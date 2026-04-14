const supabase = require("../config/supabase");
const { verifyPassword, hashPassword } = require("../utils/hash");
const { createToken } = require("../utils/jwt");

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
    .eq("cpf", String(cpf).trim())
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
    .eq("cnpj", String(cnpj).trim())
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

module.exports = {
  getProfileByUserId,
  loginService,
  validateDriverFirstAccessService,
  validateMechanicFirstAccessService,
  completeDriverFirstAccessService,
  completeMechanicFirstAccessService,
};