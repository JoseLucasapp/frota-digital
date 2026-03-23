const supabase = require("../config/supabase");

const createLoansService = async (data) => {
    const { data: result, error } = await supabase
        .from("loans")
        .insert(data)
        .select()
        .single();

    if (error) throw error;
    return result;
};
const getAllLoansService = async (query = {}) => {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.max(Number(query.limit) || 10, 1);
    const sortOrder = query.sortOrder === "asc" ? true : false;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let request = supabase
        .from("loans")
        .select("*", { count: "exact" });

    if (query.vehicle_id) {
        request = request.eq("vehicle_id", query.vehicle_id);
    }
    if (query.driver_id) {
        request = request.eq("driver_id", query.driver_id);
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

const getLoanByIdService = async (id) => {
    if (!id) {
        throw new Error("id is required");
    }

    const { data, error } = await supabase
        .from("loans")
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

const updateLoanService = async (id, data) => {
    if (!id) {
        throw new Error("id is required");
    }

    const { data: result, error } = await supabase
        .from("loans")
        .update(data)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return result;
};

const deleteLoanService = async (id) => {
    if (!id) {
        throw new Error("id is required");
    }

    const { error } = await supabase
        .from("loans")
        .delete()
        .eq("id", id);

    if (error) {
        throw error;
    }

    return { success: true };
};

module.exports = { createLoansService, getAllLoansService, getLoanByIdService, updateLoanService, deleteLoanService }