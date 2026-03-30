const supabase = require("../config/supabase");

const ensureAdminScope = (user) => {
    if (!user || user.role !== "ADMIN" || !user.id) {
        const error = new Error("Admin scope is required");
        error.statusCode = 403;
        throw error;
    }

    return user.id;
};

const applyAdminScope = (request, adminId) => {
    if (!adminId) return request;
    return request.eq("admin_id", adminId);
};

const getScopedVehicleIds = async (adminId) => {
    const { data, error } = await supabase
        .from("vehicles")
        .select("id")
        .eq("admin_id", adminId);

    if (error) throw error;
    return (data || []).map((item) => item.id);
};

const getScopedDriverIds = async (adminId) => {
    const { data, error } = await supabase
        .from("drivers")
        .select("id")
        .eq("admin_id", adminId);

    if (error) throw error;
    return (data || []).map((item) => item.id);
};

const getScopedMechanicIds = async (adminId) => {
    const { data, error } = await supabase
        .from("mechanics")
        .select("id")
        .eq("admin_id", adminId);

    if (error) throw error;
    return (data || []).map((item) => item.id);
};

module.exports = {
    ensureAdminScope,
    applyAdminScope,
    getScopedVehicleIds,
    getScopedDriverIds,
    getScopedMechanicIds,
};