const supabase = require("../config/supabase");
const { verifyPassword } = require("../utils/hash");
const { createToken } = require("../utils/jwt");

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

const TABLES = [
  { table: "admins", role: "ADMIN" },
  { table: "mechanics", role: "MECHANIC" },
  { table: "drivers", role: "DRIVER" },
];

async function loginService({ email, password }) {
  if (!email || !password) {
    const err = new Error("Email and password required");
    err.statusCode = 400;
    throw err;
  }

  let foundUser = null;
  let userRole = null;

  console.log(TABLES)

  for (const item of TABLES) {
    console.log(item)
    const { data, error } = await supabase
      .from(item.table)
      .select("*")
      .eq("email", email)
      .maybeSingle();

    console.log(data)

    if (error) throw error;

    if (data) {
      foundUser = data;
      userRole = item.role;
      break;
    }
  }

  console.log(email, password, foundUser)

  if (!foundUser) {
    const err = new Error("Invalid credentials");
    err.statusCode = 401;
    throw err;
  }

  console.log(foundUser, password)
  const validPassword = await verifyPassword(password, foundUser.password_hash);

  if (!validPassword) {
    const err = new Error("Invalid credentials");
    err.statusCode = 401;
    throw err;
  }

  const token = createToken({ sub: foundUser.id, role: userRole, email: foundUser.email });

  delete foundUser.password_hash;

  return {
    token,
    user: {
      ...foundUser,
      role: userRole,
    },
  };
}

module.exports = {
  getProfileByUserId,
  loginService,
};
