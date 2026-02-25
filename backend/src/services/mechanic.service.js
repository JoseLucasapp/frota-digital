const supabase = require("../config/supabase");
const { hashPassword } = require("../utils/hash");

const createMechanicService = async (data) => {
    const password_hash = await hashPassword(data.password);
    data.password_hash = password_hash;
    delete data.password;
    data.status = "ACTIVE";
    const { error } = await supabase.from("mechanics").insert(data);

    if (error) {
      throw error;
    }
    return { success: true, message: "Mechanic created successfully" };
};

module.exports = {
  createMechanicService,
};
