const path = require("path");
const supabase = require("../config/supabase");
const {
    uploadFileToBucket,
    deleteFileFromBucket,
} = require("../utils/supabaseBucket");

const createFuelingService = async (data) => {
    const { data: result, error } = await supabase
        .from("fuelings")
        .insert(data)
        .select()
        .single();

    if (error) throw error;
    return result;
};

const getAllFuelingsService = async (query = {}) => {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.max(Number(query.limit) || 10, 1);

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let request = supabase
        .from("fuelings")
        .select("*", { count: "exact" });

    if (query.vehicle_id) {
        request = request.eq("vehicle_id", query.vehicle_id);
    }

    if (query.fuel_type) {
        request = request.eq("fuel_type", query.fuel_type);
    }

    if (query.station) {
        request = request.ilike("station", `%${query.station}%`);
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

const getFuelingByIdService = async (id) => {
    if (!id) {
        throw new Error("id is required");
    }

    const { data, error } = await supabase
        .from("fuelings")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data || null;
};

const updateFuelingService = async (id, data) => {
    if (!id) {
        throw new Error("id is required");
    }

    const { data: result, error } = await supabase
        .from("fuelings")
        .update(data)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return result;
};

const uploadFuelingReceiptService = async ({ fuelingId, file }) => {
    if (!fuelingId) {
        throw new Error("fuelingId is required");
    }

    if (!file) {
        throw new Error("file is required");
    }

    const fueling = await getFuelingByIdService(fuelingId);

    if (!fueling) {
        throw new Error("Fueling not found");
    }

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

    const { data, error } = await supabase
        .from("fuelings")
        .update(payload)
        .eq("id", fuelingId)
        .select("*")
        .single();

    if (error) {
        throw error;
    }

    return {
        fueling: data,
        file: uploaded,
    };
};

const deleteFuelingReceiptService = async (fuelingId) => {
    if (!fuelingId) {
        throw new Error("fuelingId is required");
    }

    const fueling = await getFuelingByIdService(fuelingId);

    if (!fueling) {
        throw new Error("Fueling not found");
    }

    if (!fueling.receipt_path) {
        throw new Error("receipt not found");
    }

    await deleteFileFromBucket({
        bucket: "fuelings_receipts",
        filePath: fueling.receipt_path,
    });

    const { data, error } = await supabase
        .from("fuelings")
        .update({
            receipt_url: null,
            receipt_path: null,
        })
        .eq("id", fuelingId)
        .select("*")
        .single();

    if (error) {
        throw error;
    }

    return {
        fueling: data,
    };
};

const deleteFuelingService = async (id) => {
    if (!id) {
        throw new Error("id is required");
    }

    const fueling = await getFuelingByIdService(id);

    if (fueling?.receipt_path) {
        await deleteFileFromBucket({
            bucket: "fuelings_receipts",
            filePath: fueling.receipt_path,
        });
    }

    const { error } = await supabase
        .from("fuelings")
        .delete()
        .eq("id", id);

    if (error) {
        throw error;
    }

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