const supabase = require("../config/supabase");
const { ensureAdminScope, applyAdminScope } = require("./scope.service");

const createVehicleService = async (data, user) => {
    const adminId = ensureAdminScope(user);

    const { data: result, error } = await supabase
        .from("vehicles")
        .insert({ ...data, admin_id: adminId })
        .select()
        .single();

    if (error) throw error;
    return result;
};

const getAllVehiclesService = async (query = {}, user) => {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.max(Number(query.limit) || 10, 1);
    const sortBy = query.sortBy || "created_at";
    const sortOrder = query.sortOrder === "asc" ? true : false;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let request = supabase.from("vehicles").select("*", { count: "exact" });

    if (user?.role === "ADMIN") {
        request = applyAdminScope(request, ensureAdminScope(user));
    }

    if (query.plate) request = request.eq("plate", query.plate);
    if (query.model) request = request.ilike("model", `%${query.model}%`);
    if (query.status) request = request.eq("status", query.status);

    if (sortBy === "status") {
        request = request.order("status", { ascending: sortOrder }).order("created_at", { ascending: false });
    } else {
        request = request.order("created_at", { ascending: sortOrder });
    }

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

const getVehicleByIdService = async (id, user) => {
    if (!id) throw new Error("id is required");

    let request = supabase.from("vehicles").select("*").eq("id", id);

    if (user?.role === "ADMIN") {
        request = request.eq("admin_id", ensureAdminScope(user));
    }

    const { data, error } = await request.maybeSingle();
    if (error) throw error;
    return data || null;
};

const updateVehicleService = async (id, data, user) => {
    if (!id) throw new Error("id is required");

    let request = supabase.from("vehicles").update(data).eq("id", id);

    if (user?.role === "ADMIN") {
        request = request.eq("admin_id", ensureAdminScope(user));
    }

    const { data: result, error } = await request.select().single();
    if (error) throw error;
    return result;
};

const deleteVehicleService = async (id, user) => {
    if (!id) throw new Error("id is required");

    let request = supabase.from("vehicles").delete().eq("id", id);

    if (user?.role === "ADMIN") {
        request = request.eq("admin_id", ensureAdminScope(user));
    }

    const { error } = await request;
    if (error) throw error;

    return { success: true };
};

module.exports = { createVehicleService, getAllVehiclesService, getVehicleByIdService, updateVehicleService, deleteVehicleService };