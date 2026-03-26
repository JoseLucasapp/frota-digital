const supabase = require("../config/supabase");
const { verifyPassword } = require("../utils/hash");
const { createToken } = require("../utils/jwt");

const TABLES = [
  { table: "admins", role: "ADMIN", identifierFields: ["email", "cnpj", "institution"] },
  { table: "mechanics", role: "MECHANIC", identifierFields: ["email", "cnpj"] },
  { table: "drivers", role: "DRIVER", identifierFields: ["email", "cpf"] },
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

async function findUserByIdentifier(identifier) {
  const cleanIdentifier = String(identifier || "").trim();

  for (const item of TABLES) {
    for (const field of item.identifierFields) {
      const { data, error } = await supabase
        .from(item.table)
        .select("*")
        .eq(field, cleanIdentifier)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        return { user: data, role: item.role };
      }
    }
  }

  return null;
}

async function loginService({ email, password, institution }) {
  const identifier = (email || institution || "").trim();

  if (!identifier || !password) {
    const err = new Error("Email/CNPJ/instituição e senha são obrigatórios");
    err.statusCode = 400;
    throw err;
  }

  const found = await findUserByIdentifier(identifier);

  if (!found) {
    const err = new Error("Usuário não encontrado");
    err.statusCode = 401;
    throw err;
  }

  const { user: foundUser, role: userRole } = found;

  const validPassword = await verifyPassword(password, foundUser.password_hash);

  if (!validPassword) {
    const err = new Error("Senha inválida");
    err.statusCode = 401;
    throw err;
  }

  const token = createToken({ sub: foundUser.id, role: userRole, email: foundUser.email });

  const sanitizedUser = { ...foundUser };
  delete sanitizedUser.password_hash;

  return {
    success: true,
    token,
    user: {
      ...sanitizedUser,
      role: userRole,
    },
  };
}

module.exports = {
  getProfileByUserId,
  loginService,
};