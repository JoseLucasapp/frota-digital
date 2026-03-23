const path = require("path");
const supabase = require("../config/supabase");
const { DRIVER_STATUS } = require("../types/driver.status.types");
const { hashPassword } = require("../utils/hash");
const { sendEmail } = require("../utils/sentEmail");
const {
  uploadFileToBucket,
  deleteFileFromBucket,
} = require("../utils/supabaseBucket");

const DOCUMENT_TYPE_MAP = {
  cpf: {
    urlField: "cpf_file_url",
    pathField: "cpf_file_path",
    folder: "cpf",
  },
  rg: {
    urlField: "rg_file_url",
    pathField: "rg_file_path",
    folder: "rg",
  },
  cnh: {
    urlField: "cnh_file_url",
    pathField: "cnh_file_path",
    folder: "cnh",
  },
  home_doc: {
    urlField: "home_doc_file_url",
    pathField: "home_doc_file_path",
    folder: "home_doc",
  },
  identifier: {
    urlField: "identifier_file_url",
    pathField: "identifier_file_path",
    folder: "identifier",
  },
};

const createDriverService = async (data) => {
  data.status = DRIVER_STATUS.ACTIVE;

  const { data: result, error } = await supabase
    .from("drivers")
    .insert(data)
    .select()
    .single();

  if (error) {
    throw error;
  }

  sendEmail(data.email, "Conta motorista cadastrada");

  return { success: true, data: result };
};

const getAllDriversService = async (query = {}) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.max(Number(query.limit) || 10, 1);
  const sortBy = query.sortBy || "created_at";
  const sortOrder = query.sortOrder === "asc" ? true : false;

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let request = supabase
    .from("drivers")
    .select("*", { count: "exact" });

  if (query.cpf) {
    request = request.eq("cpf", query.cpf);
  }

  if (query.name) {
    request = request.ilike("name", `%${query.name}%`);
  }

  if (query.status) {
    request = request.eq("status", query.status);
  }

  if (sortBy === "status") {
    request = request
      .order("status", { ascending: sortOrder })
      .order("created_at", { ascending: false });
  } else {
    request = request.order("created_at", { ascending: sortOrder });
  }

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

const getDriverByIdService = async (id) => {
  if (!id) {
    throw new Error("id is required");
  }

  const { data, error } = await supabase
    .from("drivers")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data || null;
};

const updateDriverService = async (id, data) => {
  if (!id) {
    throw new Error("id is required");
  }

  if (!data || typeof data !== "object") {
    throw new Error("data is required");
  }

  if ("password" in data) {
    const password_hash = await hashPassword(data.password);
    data.password_hash = password_hash;
    data.is_first_acc = false;
    delete data.password;
  }

  const { data: result, error } = await supabase
    .from("drivers")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return result;
};

const uploadDriverDocumentService = async ({ driverId, documentType, file }) => {
  if (!driverId) {
    throw new Error("driverId is required");
  }

  if (!documentType) {
    throw new Error("documentType is required");
  }

  if (!file) {
    throw new Error("file is required");
  }

  const documentConfig = DOCUMENT_TYPE_MAP[documentType];

  if (!documentConfig) {
    throw new Error("invalid document type");
  }

  const driver = await getDriverByIdService(driverId);

  if (!driver) {
    throw new Error("Driver not found");
  }

  if (driver[documentConfig.pathField]) {
    await deleteFileFromBucket({
      bucket: "documents",
      filePath: driver[documentConfig.pathField],
    });
  }

  const ext = path.extname(file.originalname || "");
  const fileName = `${driverId}-${documentType}-${Date.now()}${ext}`;

  const uploaded = await uploadFileToBucket({
    bucket: "documents",
    file,
    fileName,
    folder: `drivers/${driverId}/${documentConfig.folder}`,
    isPublic: true,
  });

  const payload = {
    [documentConfig.urlField]: uploaded.publicUrl || uploaded.url || null,
    [documentConfig.pathField]: uploaded.filePath || uploaded.path || null,
  };

  const { data, error } = await supabase
    .from("drivers")
    .update(payload)
    .eq("id", driverId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return {
    driver: data,
    documentType,
    file: uploaded,
  };
};

const deleteDriverDocumentService = async ({ driverId, documentType }) => {
  if (!driverId) {
    throw new Error("driverId is required");
  }

  if (!documentType) {
    throw new Error("documentType is required");
  }

  const documentConfig = DOCUMENT_TYPE_MAP[documentType];

  if (!documentConfig) {
    throw new Error("invalid document type");
  }

  const driver = await getDriverByIdService(driverId);

  if (!driver) {
    throw new Error("Driver not found");
  }

  const existingPath = driver[documentConfig.pathField];

  if (!existingPath) {
    throw new Error("document not found");
  }

  await deleteFileFromBucket({
    bucket: "documents",
    filePath: existingPath,
  });

  const payload = {
    [documentConfig.urlField]: null,
    [documentConfig.pathField]: null,
  };

  const { data, error } = await supabase
    .from("drivers")
    .update(payload)
    .eq("id", driverId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return {
    driver: data,
    documentType,
  };
};

const deleteDriverService = async (id) => {
  if (!id) {
    throw new Error("id is required");
  }

  const { error } = await supabase
    .from("drivers")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }

  return { success: true };
};

module.exports = {
  createDriverService,
  getAllDriversService,
  getDriverByIdService,
  updateDriverService,
  uploadDriverDocumentService,
  deleteDriverDocumentService,
  deleteDriverService,
};
