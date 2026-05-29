const supabase = require("../config/supabase");
const { ensureAdminScope } = require("./scope.service");

const READ_FIELDS = ["read", "is_read"];

const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

const omitKeys = (object, keys) => {
    const omitted = new Set(keys);
    return Object.fromEntries(Object.entries(object).filter(([key]) => !omitted.has(key)));
};

const normalizeNotificationRow = (row) => {
    if (!row) return row;
    if (!hasOwn(row, "read") && !hasOwn(row, "is_read")) return row;

    const read = Boolean(row.read ?? row.is_read ?? false);
    return {
        ...row,
        read,
        is_read: read,
    };
};

const isReadColumnError = (error) => {
    if (!error) return false;

    const text = [
        error.code,
        error.message,
        error.details,
        error.hint,
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

    const mentionsReadField = READ_FIELDS.some((field) => text.includes(field));
    const mentionsMissingColumn =
        text.includes("column") ||
        text.includes("schema cache") ||
        text.includes("does not exist") ||
        text.includes("not found");

    return mentionsReadField && mentionsMissingColumn;
};

const buildNotificationWriteCandidates = (payload) => {
    const normalized = { ...(payload || {}) };
    const hasRead = hasOwn(normalized, "read");
    const hasIsRead = hasOwn(normalized, "is_read");

    if (hasRead && !hasIsRead) normalized.is_read = normalized.read;
    if (hasIsRead && !hasRead) normalized.read = normalized.is_read;

    const candidates = [normalized];

    if (hasOwn(normalized, "read")) candidates.push(omitKeys(normalized, ["read"]));
    if (hasOwn(normalized, "is_read")) candidates.push(omitKeys(normalized, ["is_read"]));
    const withoutReadFields = omitKeys(normalized, READ_FIELDS);
    if (Object.keys(withoutReadFields).length > 0) candidates.push(withoutReadFields);

    return candidates.filter((candidate, index, list) => {
        const signature = JSON.stringify(candidate);
        return list.findIndex((item) => JSON.stringify(item) === signature) === index;
    });
};

const executeNotificationWrite = async (payload, operation) => {
    const candidates = buildNotificationWriteCandidates(payload);
    let lastError = null;

    for (const candidate of candidates) {
        const { data, error } = await operation(candidate);
        if (!error) return data;

        lastError = error;
        if (!isReadColumnError(error)) throw error;
    }

    throw lastError;
};

const resolveNotificationAdminId = async (payload, user) => {
    if (payload.admin_id) return payload.admin_id;
    if (user?.role === "ADMIN") return ensureAdminScope(user);

    if (user?.role === "DRIVER") {
        const { data, error } = await supabase
            .from("drivers")
            .select("admin_id")
            .eq("id", user.id)
            .maybeSingle();

        if (error) throw error;
        return data?.admin_id || null;
    }

    if (user?.role === "MECHANIC") {
        const { data, error } = await supabase
            .from("mechanics")
            .select("admin_id")
            .eq("id", user.id)
            .maybeSingle();

        if (error) throw error;
        return data?.admin_id || null;
    }

    return null;
};

const createNotificationsService = async (data, user) => {
    const payload = { ...data };

    if (!hasOwn(payload, "read") && !hasOwn(payload, "is_read")) {
        payload.is_read = false;
    }
    const adminId = await resolveNotificationAdminId(payload, user);

    if (adminId) {
        payload.admin_id = adminId;
    }

    if (user?.role === "DRIVER" && !payload.driver_id) {
        payload.driver_id = user.id;
    }

    const result = await executeNotificationWrite(payload, (candidate) =>
        supabase
            .from("notifications")
            .insert(candidate)
            .select()
            .single()
    );

    return normalizeNotificationRow(result);
};

const getAllNotificationsService = async (query = {}, user) => {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.max(Number(query.limit) || 10, 1);
    const sortOrder = query.sortOrder === "asc";

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const readFilters = query.unread_only === "true" || query.unread_only === true
        ? ["is_read", "read"]
        : [null];

    let lastError = null;

    for (const readField of readFilters) {
        let request = supabase
            .from("notifications")
            .select("*", { count: "exact" });

        if (user?.role === "ADMIN") {
            request = request.eq("admin_id", ensureAdminScope(user));
        }

        if (user?.role === "DRIVER") {
            request = request.eq("driver_id", user.id);
        }

        if (query.driver_id) request = request.eq("driver_id", query.driver_id);
        if (query.admin_id) request = request.eq("admin_id", query.admin_id);
        if (readField) request = request.eq(readField, false);

        request = request.order("created_at", { ascending: sortOrder });
        request = request.range(from, to);

        const { data, error, count } = await request;
        if (!error) {
            return {
                data: (data || []).map(normalizeNotificationRow),
                pagination: {
                    page,
                    limit,
                    total: count || 0,
                    totalPages: Math.ceil((count || 0) / limit),
                },
            };
        }

        lastError = error;
        if (!readField || !isReadColumnError(error)) throw error;
    }

    throw lastError;
};

const getNotificationByIdService = async (id, user) => {
    if (!id) throw new Error("id is required");

    let request = supabase.from("notifications").select("*").eq("id", id);
    if (user?.role === "ADMIN") request = request.eq("admin_id", ensureAdminScope(user));
    if (user?.role === "DRIVER") request = request.eq("driver_id", user.id);

    const { data, error } = await request.maybeSingle();
    if (error) throw error;
    return normalizeNotificationRow(data || null);
};

const updateNotificationService = async (id, data, user) => {
    if (!id) throw new Error("id is required");

    const result = await executeNotificationWrite(data, (candidate) => {
        let request = supabase.from("notifications").update(candidate).eq("id", id);
        if (user?.role === "ADMIN") request = request.eq("admin_id", ensureAdminScope(user));
        if (user?.role === "DRIVER") request = request.eq("driver_id", user.id);

        return request.select().single();
    });

    return normalizeNotificationRow(result);
};

const deleteNotificationService = async (id, user) => {
    if (!id) throw new Error("id is required");

    let request = supabase.from("notifications").delete().eq("id", id);
    if (user?.role === "ADMIN") request = request.eq("admin_id", ensureAdminScope(user));
    if (user?.role === "DRIVER") request = request.eq("driver_id", user.id);

    const { error } = await request;
    if (error) throw error;
    return { success: true };
};

module.exports = {
    createNotificationsService,
    getAllNotificationsService,
    getNotificationByIdService,
    updateNotificationService,
    deleteNotificationService,
};
