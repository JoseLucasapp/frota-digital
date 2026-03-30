const path = require("path");
const supabase = require("../config/supabase");
const {
    uploadFileToBucket,
    deleteFileFromBucket,
} = require("../utils/supabaseBucket");
const { ensureAdminScope } = require("./scope.service");

const resolveFuelingAdminId = async (data, user) => {
    if (user?.role === "ADMIN") {
        return ensureAdminScope(user);
    }

    if (user?.role === "DRIVER" && data?.vehicle_id) {
        const { data: vehicle, error } = await supabase
            .from("vehicles")
            .select("id, admin_id")
            .eq("id", data.vehicle_id)
            .maybeSingle();

        if (error) throw error;
        if (!vehicle) {
            throw new Error("Vehicle not found");
        }

        return vehicle.admin_id || null;
    }

    return null;
};

const createFuelingService = async (data, user) => {
    const payload = { ...data };
    const adminId = await resolveFuelingAdminId(data, user);

    if (adminId) {
        payload.admin_id = adminId;
    }

    const { data: result, error } = await supabase
        .from("fuelings")
        .insert(payload)
        .select()
        .single();

    if (error) throw error;
    return result;
};

const getAllFuelingsService = async (query = {}, user) => {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.max(Number(query.limit) || 10, 1);

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let request = supabase
        .from("fuelings")
        .select("*", { count: "exact" });

    if (user?.role === "ADMIN") {
        request = request.eq("admin_id", ensureAdminScope(user));
    }

    if (query.vehicle_id) request = request.eq("vehicle_id", query.vehicle_id);
    if (query.fuel_type) request = request.eq("fuel_type", query.fuel_type);
    if (query.station) request = request.ilike("station", `%${query.station}%`);

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

const getFuelingByIdService = async (id, user) => {
    if (!id) {
        throw new Error("id is required");
    }

    let request = supabase
        .from("fuelings")
        .select("*")
        .eq("id", id);

    if (user?.role === "ADMIN") {
        request = request.eq("admin_id", ensureAdminScope(user));
    }

    const { data, error } = await request.maybeSingle();
    if (error) throw error;
    return data || null;
};

const updateFuelingService = async (id, data, user) => {
    if (!id) {
        throw new Error("id is required");
    }

    let request = supabase.from("fuelings").update(data).eq("id", id);

    if (user?.role === "ADMIN") {
        request = request.eq("admin_id", ensureAdminScope(user));
    }

    const { data: result, error } = await request.select().single();
    if (error) throw error;
    return result;
};

const uploadFuelingReceiptService = async ({ fuelingId, file, user }) => {
    if (!fuelingId) throw new Error("fuelingId is required");
    if (!file) throw new Error("file is required");

    const fueling = await getFuelingByIdService(fuelingId, user);
    if (!fueling) throw new Error("Fueling not found");

    if (fueling.receipt_path) {
        await deleteFileFromBucket({
            bucket: "fuelings_receipts",
            filePath: fueling.receipt_path,
        });
    }

    const ext = path.extname(file.originalname || "");
    const fileName = `${fuelingId}-${Date.now()}${ext}`;

    const uploaded = await uploadFileToBucket({
        bucket: "fuelings_receipts",
        file,
        fileName,
        folder: `fuelings/${fuelingId}`,
        isPublic: true,
    });

    const payload = {
        receipt_url: uploaded.publicUrl || uploaded.url || null,
        receipt_path: uploaded.filePath || uploaded.path || null,
    };

    let request = supabase.from("fuelings").update(payload).eq("id", fuelingId);
    if (user?.role === "ADMIN") {
        request = request.eq("admin_id", ensureAdminScope(user));
    }

    const { data, error } = await request.select("*").single();
    if (error) throw error;

    return { fueling: data, file: uploaded };
};

const deleteFuelingReceiptService = async (fuelingId, user) => {
    if (!fuelingId) throw new Error("fuelingId is required");

    const fueling = await getFuelingByIdService(fuelingId, user);
    if (!fueling) throw new Error("Fueling not found");
    if (!fueling.receipt_path) throw new Error("receipt not found");

    await deleteFileFromBucket({
        bucket: "fuelings_receipts",
        filePath: fueling.receipt_path,
    });

    let request = supabase
        .from("fuelings")
        .update({
            receipt_url: null,
            receipt_path: null,
        })
        .eq("id", fuelingId);

    if (user?.role === "ADMIN") {
        request = request.eq("admin_id", ensureAdminScope(user));
    }

    const { data, error } = await request.select("*").single();
    if (error) throw error;

    return { fueling: data };
};

const deleteFuelingService = async (id, user) => {
    if (!id) throw new Error("id is required");

    const fueling = await getFuelingByIdService(id, user);
    if (!fueling) throw new Error("Fueling not found");

    if (fueling.receipt_path) {
        await deleteFileFromBucket({
            bucket: "fuelings_receipts",
            filePath: fueling.receipt_path,
        });
    }

    let request = supabase.from("fuelings").delete().eq("id", id);
    if (user?.role === "ADMIN") {
        request = request.eq("admin_id", ensureAdminScope(user));
    }

    const { error } = await request;
    if (error) throw error;

    return { success: true };
};

module.exports = {
    createFuelingService,
    getAllFuelingsService,
    getFuelingByIdService,
    updateFuelingService,
    uploadFuelingReceiptService,
    deleteFuelingReceiptService,
    deleteFuelingService,
};