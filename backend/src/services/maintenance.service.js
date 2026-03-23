const path = require("path");
const supabase = require("../config/supabase");
const {
    uploadFileToBucket,
    deleteFileFromBucket,
} = require("../utils/supabaseBucket");

const createMaintenancesService = async (data) => {
    const { data: result, error } = await supabase
        .from("maintenances")
        .insert(data)
        .select()
        .single();

    if (error) throw error;
    return result;
};

const getAllMaintenancesService = async (query = {}) => {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.max(Number(query.limit) || 10, 1);

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let request = supabase
        .from("maintenances")
        .select("*", { count: "exact" });

    if (query.vehicle_id) {
        request = request.eq("vehicle_id", query.vehicle_id);
    }

    if (query.mechanic_id) {
        request = request.eq("mechanic_id", query.mechanic_id);
    }

    if (query.status) {
        request = request.eq("status", query.status);
    }

    if (query.type) {
        request = request.ilike("type", `%${query.type}%`);
    }

    request = request.order("created_at", { ascending: false });
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

const getMaintenancesByIdService = async (id) => {
    if (!id) {
        throw new Error("id is required");
    }

    const { data, error } = await supabase
        .from("maintenances")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data || null;
};

const updateMaintenancesService = async (id, data) => {
    if (!id) {
        throw new Error("id is required");
    }

    const { data: result, error } = await supabase
        .from("maintenances")
        .update(data)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return result;
};

const uploadMaintenancesReceiptService = async ({ maintenanceId, file }) => {
    if (!maintenanceId) {
        throw new Error("maintenanceId is required");
    }

    if (!file) {
        throw new Error("file is required");
    }

    const maintenance = await getMaintenancesByIdService(maintenanceId);

    if (!maintenance) {
        throw new Error("Maintenance not found");
    }

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

    const { data, error } = await supabase
        .from("maintenances")
        .update(payload)
        .eq("id", maintenanceId)
        .select("*")
        .single();

    if (error) {
        throw error;
    }

    return {
        maintenance: data,
        file: uploaded,
    };
};

const deleteMaintenanceReceiptService = async (maintenanceId) => {
    if (!maintenanceId) {
        throw new Error("maintenanceId is required");
    }

    const maintenance = await getMaintenancesByIdService(maintenanceId);

    if (!maintenance) {
        throw new Error("Maintenance not found");
    }

    if (!maintenance.receipt_path) {
        throw new Error("receipt not found");
    }

    await deleteFileFromBucket({
        bucket: "maintenances_receipts",
        filePath: maintenance.receipt_path,
    });

    const { data, error } = await supabase
        .from("maintenances")
        .update({
            receipt_url: null,
            receipt_path: null,
        })
        .eq("id", maintenanceId)
        .select("*")
        .single();

    if (error) {
        throw error;
    }

    return {
        maintenance: data,
    };
};

const deleteMaintenanceService = async (id) => {
    if (!id) {
        throw new Error("id is required");
    }

    const maintenance = await getMaintenancesByIdService(id);

    if (maintenance?.receipt_path) {
        await deleteFileFromBucket({
            bucket: "maintenances_receipts",
            filePath: maintenance.receipt_path,
        });
    }

    const { error } = await supabase
        .from("maintenances")
        .delete()
        .eq("id", id);

    if (error) {
        throw error;
    }

    return { success: true };
};

module.exports = {
    createMaintenancesService,
    getAllMaintenancesService,
    getMaintenancesByIdService,
    updateMaintenancesService,
    uploadMaintenancesReceiptService,
    deleteMaintenanceReceiptService,
    deleteMaintenanceService
}