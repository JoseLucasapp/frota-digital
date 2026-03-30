const path = require("path");
const supabase = require("../config/supabase");
const {
    uploadFileToBucket,
    deleteFileFromBucket,
} = require("../utils/supabaseBucket");
const { ensureAdminScope } = require("./scope.service");

const createMaintenancesService = async (data, user) => {
    const payload = { ...data };

    if (user?.role === "ADMIN") {
        payload.admin_id = ensureAdminScope(user);
    }

    const { data: result, error } = await supabase
        .from("maintenances")
        .insert(payload)
        .select()
        .single();

    if (error) throw error;
    return result;
};

const getAllMaintenancesService = async (query = {}, user) => {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.max(Number(query.limit) || 10, 1);

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let request = supabase
        .from("maintenances")
        .select("*", { count: "exact" });

    if (user?.role === "ADMIN") {
        request = request.eq("admin_id", ensureAdminScope(user));
    }

    if (user?.role === "MECHANIC") {
        request = request.eq("mechanic_id", user.id);
    }

    if (query.vehicle_id) request = request.eq("vehicle_id", query.vehicle_id);
    if (query.mechanic_id) request = request.eq("mechanic_id", query.mechanic_id);
    if (query.status) request = request.eq("status", query.status);
    if (query.type) request = request.ilike("type", `%${query.type}%`);

    request = request.order("created_at", { ascending: false });
    request = request.range(from, to);

    const { data, error, count } = await request;
    if (error) throw error;

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

const getMaintenancesByIdService = async (id, user) => {
    if (!id) throw new Error("id is required");

    let request = supabase.from("maintenances").select("*").eq("id", id);

    if (user?.role === "ADMIN") {
        request = request.eq("admin_id", ensureAdminScope(user));
    }

    if (user?.role === "MECHANIC") {
        request = request.eq("mechanic_id", user.id);
    }

    const { data, error } = await request.maybeSingle();
    if (error) throw error;
    return data || null;
};

const updateMaintenancesService = async (id, data, user) => {
    if (!id) throw new Error("id is required");

    let request = supabase.from("maintenances").update(data).eq("id", id);

    if (user?.role === "ADMIN") {
        request = request.eq("admin_id", ensureAdminScope(user));
    }

    if (user?.role === "MECHANIC") {
        request = request.eq("mechanic_id", user.id);
    }

    const { data: result, error } = await request.select().single();
    if (error) throw error;
    return result;
};

const uploadMaintenancesReceiptService = async ({ maintenanceId, file, user }) => {
    if (!maintenanceId) throw new Error("maintenanceId is required");
    if (!file) throw new Error("file is required");

    const maintenance = await getMaintenancesByIdService(maintenanceId, user);
    if (!maintenance) throw new Error("Maintenance not found");

    if (maintenance.receipt_path) {
        await deleteFileFromBucket({
            bucket: "maintenances_receipts",
            filePath: maintenance.receipt_path,
        });
    }

    const ext = path.extname(file.originalname || "");
    const fileName = `${maintenanceId}-${Date.now()}${ext}`;

    const uploaded = await uploadFileToBucket({
        bucket: "maintenances_receipts",
        file,
        fileName,
        folder: `maintenances/${maintenanceId}`,
        isPublic: true,
    });

    const payload = {
        receipt_url: uploaded.publicUrl || uploaded.url || null,
        receipt_path: uploaded.filePath || uploaded.path || null,
    };

    let request = supabase.from("maintenances").update(payload).eq("id", maintenanceId);

    if (user?.role === "ADMIN") {
        request = request.eq("admin_id", ensureAdminScope(user));
    }

    if (user?.role === "MECHANIC") {
        request = request.eq("mechanic_id", user.id);
    }

    const { data, error } = await request.select("*").single();
    if (error) throw error;

    return { maintenance: data, file: uploaded };
};

const deleteMaintenanceReceiptService = async (maintenanceId, user) => {
    if (!maintenanceId) throw new Error("maintenanceId is required");

    const maintenance = await getMaintenancesByIdService(maintenanceId, user);
    if (!maintenance) throw new Error("Maintenance not found");
    if (!maintenance.receipt_path) throw new Error("receipt not found");

    await deleteFileFromBucket({
        bucket: "maintenances_receipts",
        filePath: maintenance.receipt_path,
    });

    let request = supabase
        .from("maintenances")
        .update({ receipt_url: null, receipt_path: null })
        .eq("id", maintenanceId);

    if (user?.role === "ADMIN") {
        request = request.eq("admin_id", ensureAdminScope(user));
    }

    if (user?.role === "MECHANIC") {
        request = request.eq("mechanic_id", user.id);
    }

    const { data, error } = await request.select("*").single();
    if (error) throw error;

    return { maintenance: data };
};

const deleteMaintenanceService = async (id, user) => {
    if (!id) throw new Error("id is required");

    const maintenance = await getMaintenancesByIdService(id, user);
    if (!maintenance) throw new Error("Maintenance not found");

    if (maintenance.receipt_path) {
        await deleteFileFromBucket({
            bucket: "maintenances_receipts",
            filePath: maintenance.receipt_path,
        });
    }

    let request = supabase.from("maintenances").delete().eq("id", id);
    if (user?.role === "ADMIN") request = request.eq("admin_id", ensureAdminScope(user));
    if (user?.role === "MECHANIC") request = request.eq("mechanic_id", user.id);

    const { error } = await request;
    if (error) throw error;

    return { success: true };
};

module.exports = {
    createMaintenancesService,
    getAllMaintenancesService,
    getMaintenancesByIdService,
    updateMaintenancesService,
    uploadMaintenancesReceiptService,
    deleteMaintenanceReceiptService,
    deleteMaintenanceService,
};