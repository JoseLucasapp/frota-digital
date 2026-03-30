const supabase = require("../config/supabase");
const { verifyPassword } = require("../utils/hash");
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

module.exports = {
  getProfileByUserId,
  loginService,
};