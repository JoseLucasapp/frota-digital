const { createDriverService } = require("../services/driver.service");

const createDriverController = async (req, res) => {
  try {
    const data = req.body;

    if (
      !data.name ||
      !data.email ||
      !data.phone ||
      !data.cpf
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Name, email, phone, password and cpf are required",
        });
    }

    const result = await createDriverService(data);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createDriverController,
};
