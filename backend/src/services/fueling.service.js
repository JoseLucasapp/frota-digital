const supabase = require("../config/supabase");

const createFuelingService = async (data) => {
    const { result, error } = await supabase
        .from("fuelings")
        .insert(data)
        .select()
        .single();

    if (error) throw error;
    return result;
};

const getAllFuelingsService = async (query = {}) => {
    let request = supabase
        .from("fuelings")
        .select("*");

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

    const { data, error } = await request;

    if (error) {
        throw error;
    }

    return data;
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

    if (!data) {
        return null;
    }

    return data;
};

const updateFuelingService = async (id, data) => {
    if (!id) {
        throw new Error("id is required");
    }

    const { result, error } = await supabase
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

const deleteFuelingService = async (id) => {
    if (!id) {
        throw new Error("id is required");
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

module.exports = { createFuelingService, getAllFuelingsService, getFuelingByIdService, updateFuelingService, deleteFuelingService };