const supabase = require("../config/supabase");
const crypto = require("crypto");
const { verifyPassword, hashPassword } = require("../utils/hash");
const { sendEmail } = require("../utils/sentEmail");
const { createToken } = require("../utils/jwt");
const { onlyDigits } = require("../utils/document");

const TABLES = [
  { table: "admins", role: "ADMIN" },
  { table: "mechanics", role: "MECHANIC" },
  { table: "drivers", role: "DRIVER" },
];

const getProfileByUserId = async (userId) => {
  const lookups = [
    { table: "admins", role: "ADMIN" },
    { table: "mechanics", role: "MECHANIC" },
    { table: "drivers", role: "DRIVER" },
  ];

  for (const item of lookups) {
    const { data, error } = await supabase
      .from(item.table)
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) throw error;
    if (data) return { role: item.role, profile: data };
  }

  return null;
};

async function findUserByEmail(email) {
  const cleanEmail = String(email || "").trim();

  for (const item of TABLES) {
    const { data, error } = await supabase
      .from(item.table)
      .select("*")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (error) throw error;
    if (data) {
      return { user: data, role: item.role };
    }
  }

  return null;
}

async function loginService({ email, password }) {
  if (!email || !password) {
    const err = new Error("Email and password required");
    err.statusCode = 400;
    throw err;
  }

  const found = await findUserByEmail(email);

  if (!found) {
    const err = new Error("Invalid credentials");
    err.statusCode = 401;
    throw err;
  }

  const { user: foundUser, role: userRole } = found;

  const validPassword = await verifyPassword(password, foundUser.password_hash);

  if (!validPassword) {
    const err = new Error("Invalid credentials");
    err.statusCode = 401;
    throw err;
  }

  const token = createToken({ sub: foundUser.id, role: userRole, email: foundUser.email });

  const sanitizedUser = { ...foundUser };
  delete sanitizedUser.password_hash;

  return {
    token,
    user: {
      ...sanitizedUser,
      role: userRole,
    },
  };
}

const validateDriverFirstAccessService = async ({ email, cpf }) => {
  if (!email || !cpf) {
    const err = new Error("Email and cpf are required");
    err.statusCode = 400;
    throw err;
  }

  const { data, error } = await supabase
    .from("drivers")
    .select("*")
    .eq("email", String(email).trim())
    .eq("cpf", onlyDigits(cpf))
    .eq("is_first_acc", true)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    const err = new Error("Driver not found for first access");
    err.statusCode = 404;
    throw err;
  }

  return {
    success: true,
    user: {
      id: data.id,
      role: "DRIVER",
      name: data.name,
      email: data.email,
      is_first_acc: data.is_first_acc,
    },
  };
};

const validateMechanicFirstAccessService = async ({ email, cnpj }) => {
  if (!email || !cnpj) {
    const err = new Error("Email and cnpj are required");
    err.statusCode = 400;
    throw err;
  }

  const { data, error } = await supabase
    .from("mechanics")
    .select("*")
    .eq("email", String(email).trim())
    .eq("cnpj", onlyDigits(cnpj))
    .eq("is_first_acc", true)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    const err = new Error("Mechanic not found for first access");
    err.statusCode = 404;
    throw err;
  }

  return {
    success: true,
    user: {
      id: data.id,
      role: "MECHANIC",
      name: data.name,
      email: data.email,
      is_first_acc: data.is_first_acc,
    },
  };
};

const completeDriverFirstAccessService = async ({ userId, password }) => {
  if (!userId || !password) {
    const err = new Error("userId and password are required");
    err.statusCode = 400;
    throw err;
  }

  const { data: driver, error: findError } = await supabase
    .from("drivers")
    .select("*")
    .eq("id", userId)
    .eq("is_first_acc", true)
    .maybeSingle();

  if (findError) throw findError;

  if (!driver) {
    const err = new Error("Driver not found for first access");
    err.statusCode = 404;
    throw err;
  }

  const password_hash = await hashPassword(password);

  const { data, error } = await supabase
    .from("drivers")
    .update({
      password_hash,
      is_first_acc: false,
    })
    .eq("id", userId)
    .select("*")
    .single();

  if (error) throw error;

  return {
    success: true,
    user: data,
  };
};

const completeMechanicFirstAccessService = async ({ userId, password }) => {
  if (!userId || !password) {
    const err = new Error("userId and password are required");
    err.statusCode = 400;
    throw err;
  }

  const { data: mechanic, error: findError } = await supabase
    .from("mechanics")
    .select("*")
    .eq("id", userId)
    .eq("is_first_acc", true)
    .maybeSingle();

  if (findError) throw findError;

  if (!mechanic) {
    const err = new Error("Mechanic not found for first access");
    err.statusCode = 404;
    throw err;
  }

  const password_hash = await hashPassword(password);

  const { data, error } = await supabase
    .from("mechanics")
    .update({
      password_hash,
      is_first_acc: false,
    })
    .eq("id", userId)
    .select("*")
    .single();

  if (error) throw error;

  return {
    success: true,
    user: data,
  };
};

const requestAdminPasswordCodeService = async (adminId) => {
  if (!adminId) {
    const err = new Error("Administrador não informado.");
    err.statusCode = 400;
    throw err;
  }

  const { data: admin, error: findError } = await supabase
    .from("admins")
    .select("id, email, name")
    .eq("id", adminId)
    .maybeSingle();

  if (findError) throw findError;
  if (!admin) {
    const err = new Error("Administrador não encontrado.");
    err.statusCode = 404;
    throw err;
  }

  const code = String(crypto.randomInt(100000, 999999));
  const code_hash = await hashPassword(code);
  const expires_at = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  await supabase
    .from("admin_password_codes")
    .update({ used_at: new Date().toISOString() })
    .eq("admin_id", admin.id)
    .is("used_at", null);

  const { error } = await supabase
    .from("admin_password_codes")
    .insert({ admin_id: admin.id, code_hash, expires_at });

  if (error) throw error;

  await sendEmail(
    admin.email,
    "Código para alterar sua senha",
    `Seu código para alterar a senha é: ${code}. Ele expira em 15 minutos.`
  );

  return { success: true, message: "Código enviado para o email cadastrado." };
};

const verifyAdminPasswordCodeService = async (adminId, code) => {
  if (!adminId || !code) {
    const err = new Error("Administrador e código são obrigatórios.");
    err.statusCode = 400;
    throw err;
  }

  const { data: rows, error } = await supabase
    .from("admin_password_codes")
    .select("*")
    .eq("admin_id", adminId)
    .is("used_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) throw error;
  const row = rows?.[0];
  if (!row || !(await verifyPassword(String(code).trim(), row.code_hash))) {
    const err = new Error("Código inválido ou expirado.");
    err.statusCode = 400;
    throw err;
  }

  return { success: true, message: "Código confirmado." };
};

const confirmAdminPasswordChangeService = async (adminId, code, password) => {
  if (!password || String(password).length < 6) {
    const err = new Error("A nova senha deve ter pelo menos 6 caracteres.");
    err.statusCode = 400;
    throw err;
  }

  await verifyAdminPasswordCodeService(adminId, code);

  const password_hash = await hashPassword(password);
  const { error: updateError } = await supabase
    .from("admins")
    .update({ password_hash })
    .eq("id", adminId);

  if (updateError) throw updateError;

  await supabase
    .from("admin_password_codes")
    .update({ used_at: new Date().toISOString() })
    .eq("admin_id", adminId)
    .is("used_at", null);

  return { success: true, message: "Senha alterada com sucesso." };
};

module.exports = {
  getProfileByUserId,
  loginService,
  validateDriverFirstAccessService,
  validateMechanicFirstAccessService,
  completeDriverFirstAccessService,
  completeMechanicFirstAccessService,
  requestAdminPasswordCodeService,
  verifyAdminPasswordCodeService,
  confirmAdminPasswordChangeService,
};