const path = require("path");
const supabase = require("../config/supabase");
const {
    uploadFileToBucket,
    deleteFileFromBucket,
} = require("../utils/supabaseBucket");
const { ensureAdminScope } = require("./scope.service");
const { createNotificationsService } = require("./notifications.service");


const applyVehicleKm = async ({ vehicleId, currentKm, adminId }) => {
    if (!vehicleId || currentKm === undefined || currentKm === null || currentKm === "") return;

    const nextKm = Number(currentKm);
    if (!Number.isFinite(nextKm) || nextKm < 0) {
        const error = new Error("Quilometragem atual inválida.");
        error.statusCode = 400;
        throw error;
    }

    const { data: vehicle, error: vehicleError } = await supabase
        .from("vehicles")
        .select("id, current_km")
        .eq("id", vehicleId)
        .maybeSingle();

    if (vehicleError) throw vehicleError;
    if (!vehicle) {
        const error = new Error("Veículo não encontrado");
        error.statusCode = 404;
        throw error;
    }

    const previousKm = Number(vehicle.current_km || 0);
    if (nextKm < previousKm) {
        const error = new Error(`A quilometragem atual deve ser maior ou igual a ${previousKm}.`);
        error.statusCode = 400;
        throw error;
    }

    if (nextKm !== previousKm) {
        let update = supabase.from("vehicles").update({ current_km: nextKm }).eq("id", vehicleId);
        if (adminId) update = update.eq("admin_id", adminId);
        const { error } = await update;
        if (error) throw error;
    }
};

const resolveMaintenanceAdminId = async (data, user) => {
    if (user?.role === "ADMIN") return ensureAdminScope(user);

    if (data?.vehicle_id) {
        const { data: vehicle, error } = await supabase
            .from("vehicles")
            .select("id, admin_id")
            .eq("id", data.vehicle_id)
            .maybeSingle();

        if (error) throw error;
        if (!vehicle) throw new Error("Veículo não encontrado");
        return vehicle.admin_id || null;
    }

    return null;
};

const createMaintenancesService = async (data, user) => {
    const payload = { ...data };
    const adminId = await resolveMaintenanceAdminId(data, user);

    if (adminId) {
        payload.admin_id = adminId;
    }

    await applyVehicleKm({ vehicleId: payload.vehicle_id, currentKm: payload.current_km, adminId });

    if (user?.role === "DRIVER") {
        payload.mechanic_id = null;
        payload.status = "PENDING";
    }

    const { data: result, error } = await supabase
        .from("maintenances")
        .insert(payload)
        .select()
        .single();

    if (error) throw error;

    if (user?.role === "DRIVER" && result?.admin_id) {
        try {
            await createNotificationsService(
                {
                    admin_id: result.admin_id,
                    driver_id: user.id,
                    type: "maintenance",
                    title: "Problema reportado pelo motorista",
                    message: `${result.type || "Manutenção"}: ${result.description || "Sem descrição"}`,
                    is_read: false,
                },
                user
            );
        } catch (error) {
            console.error("Falha ao criar notificação de manutenção:", error.message);
        }
    }

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

    if (user?.role === "DRIVER") {
        const { data: loans, error: loansError } = await supabase
            .from("loans")
            .select("vehicle_id")
            .eq("driver_id", user.id);

        if (loansError) throw loansError;
        const vehicleIds = [...new Set((loans || []).map((loan) => loan.vehicle_id).filter(Boolean))];

        if (vehicleIds.length === 0) {
            return {
                data: [],
                pagination: { page, limit, total: 0, totalPages: 0 },
            };
        }

        request = request.in("vehicle_id", vehicleIds);
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
    if (!id) throw new Error("ID é obrigatório.");

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
    if (!id) throw new Error("ID é obrigatório.");

    await applyVehicleKm({ vehicleId: data.vehicle_id, currentKm: data.current_km, adminId: user?.role === "ADMIN" ? ensureAdminScope(user) : null });

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
    if (!maintenanceId) throw new Error("ID da manutenção é obrigatório.");
    if (!file) throw new Error("Arquivo é obrigatório.");

    const maintenance = await getMaintenancesByIdService(maintenanceId, user);
    if (!maintenance) throw new Error("Manutenção não encontrada");

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
    if (!maintenanceId) throw new Error("ID da manutenção é obrigatório.");

    const maintenance = await getMaintenancesByIdService(maintenanceId, user);
    if (!maintenance) throw new Error("Manutenção não encontrada");
    if (!maintenance.receipt_path) throw new Error("Comprovante não encontrado");

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
    if (!id) throw new Error("ID é obrigatório.");

    const maintenance = await getMaintenancesByIdService(id, user);
    if (!maintenance) throw new Error("Manutenção não encontrada");

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
