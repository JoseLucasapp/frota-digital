const supabase = require("../config/supabase");
const { ensureAdminScope, isAdmin } = require("./scope.service");

const applyNotificationScope = (request, user) => {
    if (isAdmin(user)) {
        return request.eq("admin_id", ensureAdminScope(user));
    }

    return request;
};

const createNotificationsService = async (data, user) => {
    const payload = { ...data };

    if (isAdmin(user)) {
        payload.admin_id = ensureAdminScope(user);
    }

    const { data: result, error } = await supabase
        .from("notifications")
        .insert(payload)
        .select()
        .single();

    if (error) throw error;
    return result;
};

const getAllNotificationsService = async (query = {}, user) => {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.max(Number(query.limit) || 10, 1);
    const sortOrder = query.sortOrder === "asc";

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let request = supabase
        .from("notifications")
        .select("*", { count: "exact" });

    request = applyNotificationScope(request, user);

    if (query.driver_id) {
        request = request.eq("driver_id", query.driver_id);
    }

    if (query.admin_id) {
        request = request.eq("admin_id", query.admin_id);
    }

    request = request.order("created_at", { ascending: sortOrder });
    request = request.range(from, to);

    const { data, error, count } = await request;

    if (error) {
        throw error;
    }

    return {
        data,
        pagination: {
            page,
            limit,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / limit),
        },
    };
};

const getNotificationByIdService = async (id, user) => {
    if (!id) {
        throw new Error("id is required");
    }

    let request = supabase
        .from("notifications")
        .select("*")
        .eq("id", id);

    request = applyNotificationScope(request, user);

    const { data, error } = await request.maybeSingle();

    if (error) {
        throw error;
    }

    return data || null;
};

const updateNotificationService = async (id, data, user) => {
    if (!id) {
        throw new Error("id is required");
    }

    let request = supabase
        .from("notifications")
        .update(data)
        .eq("id", id);

    request = applyNotificationScope(request, user);

    const { data: result, error } = await request
        .select()
        .single();

    if (error) {
        throw error;
    }

    return result;
};

const deleteNotificationService = async (id, user) => {
    if (!id) {
        throw new Error("id is required");
    }

    let request = supabase
        .from("notifications")
        .delete()
        .eq("id", id);

    request = applyNotificationScope(request, user);

    const { error } = await request;

    if (error) {
        throw error;
    }

    return { success: true };
};

module.exports = {
    createNotificationsService,
    getAllNotificationsService,
    getNotificationByIdService,
    updateNotificationService,
    deleteNotificationService,
};