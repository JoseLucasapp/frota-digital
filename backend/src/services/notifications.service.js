const supabase = require("../config/supabase");

const createNotificationsService = async (data) => {
    const { data: result, error } = await supabase
        .from("notifications")
        .insert(data)
        .select()
        .single();

    if (error) throw error;
    return result;
};
const getAllNotificationsService = async (query = {}) => {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.max(Number(query.limit) || 10, 1);
    const sortOrder = query.sortOrder === "asc" ? true : false;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let request = supabase
        .from("notifications")
        .select("*", { count: "exact" });

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
const getNotificationByIdService = async (id) => {
    if (!id) {
        throw new Error("id is required");
    }

    const { data, error } = await supabase
        .from("notifications")
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
const updateNotificationService = async (id, data) => {
    if (!id) {
        throw new Error("id is required");
    }

    const { data: result, error } = await supabase
        .from("notifications")
        .update(data)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return result;
};
const deleteNotificationService = async (id) => {
    if (!id) {
        throw new Error("id is required");
    }

    const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id);

    if (error) {
        throw error;
    }

    return { success: true };
};

module.exports = { createNotificationsService, getAllNotificationsService, getNotificationByIdService, updateNotificationService, deleteNotificationService }