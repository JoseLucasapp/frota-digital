const path = require("path");
const supabase = require("../config/supabase");
const { MECHANIC_STATUS } = require("../types/mechanic.status.types");
const { hashPassword } = require("../utils/hash");
const { sendEmail } = require("../utils/sentEmail");
const {
  uploadFileToBucket,
  deleteFileFromBucket,
} = require("../utils/supabaseBucket");
const { ensureAdminScope } = require("./scope.service");

const DOCUMENT_TYPE_MAP = {
  cnpj: {
    urlField: "cnpj_file_url",
    pathField: "cnpj_file_path",
    folder: "cnpj",
  },
  business_license: {
    urlField: "business_license_file_url",
    pathField: "business_license_file_path",
    folder: "business-license",
  },
  certificates: {
    urlField: "certificates_file_url",
    pathField: "certificates_file_path",
    folder: "certificates",
  },
};

const createMechanicService = async (data, user) => {
  const payload = {
    ...data,
    status: data.status || MECHANIC_STATUS.ACTIVE,
  };

  if (user?.role === "ADMIN") {
    payload.admin_id = ensureAdminScope(user);
  }

  if (payload.password) {
    payload.password_hash = await hashPassword(payload.password);
    payload.is_first_acc = false;
    delete payload.password;
  }

  const { data: result, error } = await supabase
    .from("mechanics")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;

  if (data.email) {
    sendEmail(data.email, "Conta mecânico cadastrada");
  }

  return { success: true, data: result };
};

const getAllMechanicsService = async (query = {}, user) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.max(Number(query.limit) || 10, 1);
  const sortBy = query.sortBy || "created_at";
  const sortOrder = query.sortOrder === "asc";

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let request = supabase.from("mechanics").select("*", { count: "exact" });

  if (user?.role === "ADMIN") {
    request = request.eq("admin_id", ensureAdminScope(user));
  }

  if (query.cnpj) request = request.eq("cnpj", query.cnpj);
  if (query.name) request = request.ilike("name", `%${query.name}%`);
  if (query.status) request = request.eq("status", query.status);

  if (sortBy === "status") {
    request = request
      .order("status", { ascending: sortOrder })
      .order("created_at", { ascending: false });
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

const getMechanicByIdService = async (id, user) => {
  if (!id) throw new Error("id is required");

  let request = supabase.from("mechanics").select("*").eq("id", id);

  if (user?.role === "ADMIN") {
    request = request.eq("admin_id", ensureAdminScope(user));
  }

  if (user?.role === "MECHANIC") {
    request = request.eq("id", user.id);
  }

  const { data, error } = await request.maybeSingle();
  if (error) throw error;
  return data || null;
};

const updateMechanicService = async (id, data, user) => {
  if (!id) throw new Error("id is required");
  if (!data || typeof data !== "object") throw new Error("data is required");

  const payload = { ...data };

  if ("password" in payload) {
    if (payload.password) {
      payload.password_hash = await hashPassword(payload.password);
      payload.is_first_acc = false;
    }
    delete payload.password;
  }

  let request = supabase.from("mechanics").update(payload).eq("id", id);

  if (user?.role === "ADMIN") {
    request = request.eq("admin_id", ensureAdminScope(user));
  }

  if (user?.role === "MECHANIC") {
    request = request.eq("id", user.id);
  }

  const { data: result, error } = await request.select().single();
  if (error) throw error;
  return result;
};

const uploadMechanicDocumentService = async ({ mechanicId, documentType, file, user }) => {
  if (!mechanicId) throw new Error("mechanicId is required");
  if (!documentType) throw new Error("documentType is required");
  if (!file) throw new Error("file is required");

  const documentConfig = DOCUMENT_TYPE_MAP[documentType];
  if (!documentConfig) throw new Error("invalid document type");

  const mechanic = await getMechanicByIdService(mechanicId, user);
  if (!mechanic) throw new Error("Mechanic not found");

  if (mechanic[documentConfig.pathField]) {
    await deleteFileFromBucket({
      bucket: "documents",
      filePath: mechanic[documentConfig.pathField],
    });
  }

  const ext = path.extname(file.originalname || "");
  const fileName = `${mechanicId}-${documentType}-${Date.now()}${ext}`;

  const uploaded = await uploadFileToBucket({
    bucket: "documents",
    file,
    fileName,
    folder: `mechanics/${mechanicId}/${documentConfig.folder}`,
    isPublic: true,
  });

  const payload = {
    [documentConfig.urlField]: uploaded.publicUrl || uploaded.url || null,
    [documentConfig.pathField]: uploaded.filePath || uploaded.path || null,
  };

  let request = supabase.from("mechanics").update(payload).eq("id", mechanicId);

  if (user?.role === "ADMIN") {
    request = request.eq("admin_id", ensureAdminScope(user));
  }

  if (user?.role === "MECHANIC") {
    request = request.eq("id", user.id);
  }

  const { data, error } = await request.select("*").single();
  if (error) throw error;

  return { mechanic: data, documentType, file: uploaded };
};

const deleteMechanicDocumentService = async ({ mechanicId, documentType, user }) => {
  if (!mechanicId) throw new Error("mechanicId is required");
  if (!documentType) throw new Error("documentType is required");

  const documentConfig = DOCUMENT_TYPE_MAP[documentType];
  if (!documentConfig) throw new Error("invalid document type");

  const mechanic = await getMechanicByIdService(mechanicId, user);
  if (!mechanic) throw new Error("Mechanic not found");

  const existingPath = mechanic[documentConfig.pathField];
  if (!existingPath) throw new Error("document not found");

  await deleteFileFromBucket({
    bucket: "documents",
    filePath: existingPath,
  });

  const payload = {
    [documentConfig.urlField]: null,
    [documentConfig.pathField]: null,
  };

  let request = supabase.from("mechanics").update(payload).eq("id", mechanicId);

  if (user?.role === "ADMIN") {
    request = request.eq("admin_id", ensureAdminScope(user));
  }

  if (user?.role === "MECHANIC") {
    request = request.eq("id", user.id);
  }

  const { data, error } = await request.select("*").single();
  if (error) throw error;

  return { mechanic: data, documentType };
};

const deleteMechanicService = async (id, user) => {
  if (!id) throw new Error("id is required");

  const mechanic = await getMechanicByIdService(id, user);
  if (!mechanic) {
    const error = new Error("Mecânico não encontrado");
    error.statusCode = 404;
    throw error;
  }

  const [maintenancesCheck] = await Promise.all([
    supabase
      .from("maintenances")
      .select("id", { count: "exact", head: true })
      .eq("mechanic_id", id),
  ]);

  if (maintenancesCheck.error) throw maintenancesCheck.error;

  const blockers = [];
  if ((maintenancesCheck.count || 0) > 0) blockers.push("manutenções");

  if (blockers.length > 0) {
    const error = new Error(
      `Não é possível excluir este mecânico porque ele possui ${blockers.join(", ")} vinculadas.`
    );
    error.statusCode = 409;
    throw error;
  }

  let request = supabase.from("mechanics").delete().eq("id", id);

  if (user?.role === "ADMIN") {
    request = request.eq("admin_id", ensureAdminScope(user));
  }

  if (user?.role === "MECHANIC") {
    request = request.eq("id", user.id);
  }

  const { error } = await request;
  if (error) throw error;

  return { success: true };
};

module.exports = {
  createMechanicService,
  getAllMechanicsService,
  getMechanicByIdService,
  updateMechanicService,
  uploadMechanicDocumentService,
  deleteMechanicDocumentService,
  deleteMechanicService,
};