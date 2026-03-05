const supabase = require("../config/supabase");
const { MECHANIC_STATUS } = require("../types/mechanic.status.types");
const { hashPassword } = require("../utils/hash");

const createMechanicService = async (data) => {
    const password_hash = await hashPassword(data.password);
    data.password_hash = password_hash;
    delete data.password;
    data.status = MECHANIC_STATUS.ACTIVE;
    const { error } = await supabase.from("mechanics").insert(data);

    if (error) {
      throw error;
    }
    
    sendEmail(
      data.email,
      "Conta mecânico cadastrada",
    );
    return { success: true, message: "Mechanic created successfully" };
};

module.exports = {
  createMechanicService,
};
