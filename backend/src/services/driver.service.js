const supabase = require("../config/supabase");
const { DRIVER_STATUS } = require("../types/driver.status.types");
const { hashPassword } = require("../utils/hash");

const createDriverService = async (data) => {
  data.status = DRIVER_STATUS.ACTIVE;

  const { error } = await supabase.from("drivers").insert(data);
  
  if (error) {
    throw error;
  }
  return { success: true, message: "Driver created successfully" };
};

module.exports = {
  createDriverService,
};
