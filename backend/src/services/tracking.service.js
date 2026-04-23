const supabase = require("../config/supabase");
const { ensureAdminScope } = require("./scope.service");

const MAX_LIMIT = 500;
const OFFLINE_WINDOW_HOURS = 2;

const normalizeOptionalNumber = (value) => {
  if (value == null || value === "") return null;
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    const error = new Error("latitude/longitude inválidos");
    error.statusCode = 400;
    throw error;
  }
  return parsed;
};

const ensureVehicleAccess = async ({ vehicleId, user }) => {
  let request = supabase.from("vehicles").select("id, admin_id, plate, make, model").eq("id", vehicleId);

  if (user?.role === "ADMIN") {
    request = request.eq("admin_id", ensureAdminScope(user));
  }

  const { data, error } = await request.maybeSingle();
  if (error) throw error;
  if (!data) {
    const accessError = new Error("Veículo não encontrado");
    accessError.statusCode = 404;
    throw accessError;
  }

  return data;
};

const ensureDriverCanTrackVehicle = async ({ vehicleId, user }) => {
  const { data, error } = await supabase
    .from("loans")
    .select("id, admin_id, start_date, end_date")
    .eq("vehicle_id", vehicleId)
    .eq("driver_id", user.id)
    .order("start_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    const accessError = new Error("Motorista não vinculado a este veículo");
    accessError.statusCode = 403;
    throw accessError;
  }

  return data;
};

const createTrackingLogService = async (payload, user) => {
  const vehicleId = payload.vehicle_id;
  if (!vehicleId) {
    const error = new Error("vehicle_id é obrigatório");
    error.statusCode = 400;
    throw error;
  }

  const address = String(payload.address || "").trim();
  const notes = String(payload.notes || "").trim();
  const latitude = normalizeOptionalNumber(payload.latitude);
  const longitude = normalizeOptionalNumber(payload.longitude);

  if (latitude == null && longitude == null && !address) {
    const error = new Error("Informe a localização pelo navegador ou digite um endereço");
    error.statusCode = 400;
    throw error;
  }

  if ((latitude == null) !== (longitude == null)) {
    const error = new Error("latitude e longitude devem ser informados juntas");
    error.statusCode = 400;
    throw error;
  }

  const vehicle = await ensureVehicleAccess({ vehicleId, user });

  let adminId = vehicle.admin_id || null;
  let driverId = payload.driver_id || null;

  if (user?.role === "ADMIN") {
    adminId = ensureAdminScope(user);
  }

  if (user?.role === "DRIVER") {
    const loan = await ensureDriverCanTrackVehicle({ vehicleId, user });
    adminId = loan.admin_id || adminId;
    driverId = user.id;
  }

  const recordedAt = payload.recorded_at ? new Date(payload.recorded_at).toISOString() : new Date().toISOString();

  const insertPayload = {
    vehicle_id: vehicleId,
    driver_id: driverId,
    admin_id: adminId,
    latitude,
    longitude,
    address: address || null,
    source: payload.source || (latitude != null ? "browser_geolocation" : "manual"),
    notes: notes || null,
    recorded_at: recordedAt,
  };

  const { data: created, error: insertError } = await supabase
    .from("vehicle_tracking_logs")
    .insert(insertPayload)
    .select()
    .single();

  if (insertError) throw insertError;

  const vehicleUpdate = {
    last_latitude: latitude,
    last_longitude: longitude,
    last_address: address || null,
    last_tracked_at: recordedAt,
    last_tracking_source: insertPayload.source,
    updated_at: new Date().toISOString(),
  };

  const { error: updateError } = await supabase
    .from("vehicles")
    .update(vehicleUpdate)
    .eq("id", vehicleId);

  if (updateError) throw updateError;

  return created;
};

const getTrackingLogsService = async (query = {}, user) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), MAX_LIMIT);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let request = supabase.from("vehicle_tracking_logs").select("*", { count: "exact" });

  if (user?.role === "ADMIN") {
    request = request.eq("admin_id", ensureAdminScope(user));
  }

  if (user?.role === "DRIVER") {
    request = request.eq("driver_id", user.id);
  }

  if (query.vehicle_id) request = request.eq("vehicle_id", query.vehicle_id);
  if (query.driver_id) request = request.eq("driver_id", query.driver_id);
  if (query.source) request = request.eq("source", query.source);
  if (query.start_date) request = request.gte("recorded_at", new Date(query.start_date).toISOString());
  if (query.end_date) request = request.lte("recorded_at", new Date(query.end_date).toISOString());

  request = request.order("recorded_at", { ascending: false }).range(from, to);

  const { data, error, count } = await request;
  if (error) throw error;

  return {
    data: data || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  };
};

const getTrackingOverviewService = async (query = {}, user) => {
  const limit = Math.min(Math.max(Number(query.limit) || 200, 1), MAX_LIMIT);

  let vehiclesRequest = supabase
    .from("vehicles")
    .select("id, plate, make, model, status, admin_id, last_latitude, last_longitude, last_address, last_tracked_at, last_tracking_source")
    .order("plate", { ascending: true })
    .limit(limit);

  if (user?.role === "ADMIN") {
    vehiclesRequest = vehiclesRequest.eq("admin_id", ensureAdminScope(user));
  }

  if (query.vehicle_id) {
    vehiclesRequest = vehiclesRequest.eq("id", query.vehicle_id);
  }

  const { data: vehicles, error: vehiclesError } = await vehiclesRequest;
  if (vehiclesError) throw vehiclesError;

  const vehicleIds = (vehicles || []).map((item) => item.id);
  const now = Date.now();
  const offlineWindowMs = OFFLINE_WINDOW_HOURS * 60 * 60 * 1000;

  let loans = [];
  if (vehicleIds.length) {
    let loansRequest = supabase
      .from("loans")
      .select("id, vehicle_id, driver_id, start_date, end_date, admin_id")
      .in("vehicle_id", vehicleIds)
      .order("start_date", { ascending: false });

    if (user?.role === "ADMIN") {
      loansRequest = loansRequest.eq("admin_id", ensureAdminScope(user));
    }

    if (user?.role === "DRIVER") {
      loansRequest = loansRequest.eq("driver_id", user.id);
    }

    const loansResult = await loansRequest;
    if (loansResult.error) throw loansResult.error;
    loans = loansResult.data || [];
  }

  const driverIds = [...new Set(loans.map((loan) => loan.driver_id).filter(Boolean))];
  let drivers = [];
  if (driverIds.length) {
    let driversRequest = supabase.from("drivers").select("id, name, phone, admin_id").in("id", driverIds);

    if (user?.role === "ADMIN") {
      driversRequest = driversRequest.eq("admin_id", ensureAdminScope(user));
    }

    if (user?.role === "DRIVER") {
      driversRequest = driversRequest.eq("id", user.id);
    }

    const driversResult = await driversRequest;
    if (driversResult.error) throw driversResult.error;
    drivers = driversResult.data || [];
  }

  const latestLoanByVehicleId = new Map();
  for (const loan of loans) {
    if (!latestLoanByVehicleId.has(loan.vehicle_id)) {
      latestLoanByVehicleId.set(loan.vehicle_id, loan);
    }
  }

  const driverById = new Map(drivers.map((driver) => [driver.id, driver]));

  const data = (vehicles || []).map((vehicle) => {
    const loan = latestLoanByVehicleId.get(vehicle.id) || null;
    const driver = loan?.driver_id ? driverById.get(loan.driver_id) || null : null;
    const trackedAt = vehicle.last_tracked_at ? new Date(vehicle.last_tracked_at).getTime() : null;
    const trackingStatus = trackedAt && now - trackedAt <= offlineWindowMs ? "ok" : "offline";

    return {
      ...vehicle,
      tracking_status: vehicle.last_tracked_at ? trackingStatus : "offline",
      driver,
      loan,
    };
  });

  return { data };
};

module.exports = {
  createTrackingLogService,
  getTrackingLogsService,
  getTrackingOverviewService,
};
