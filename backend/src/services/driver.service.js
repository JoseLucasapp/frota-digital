const supabase = require("../config/supabase");
const { hashPassword } = require("../utils/hash");

const createDriverService = async (data) => {
    const password_hash = await hashPassword(data.password);
    data.password_hash = password_hash;
    delete data.password;
  const { error } = await supabase.from("drivers").insert(data);
  if (error) {
    throw error;
  }
  return { success: true, message: "Driver created successfully" };
};

module.exports = {
  createDriverService,
};
