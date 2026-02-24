const { createMechanicService } = require("../services/mechanic.service");

const createMechanicController = async (req, res) => {
  try {
    const data = req.body;

    if (
      !data.name ||
      !data.email ||
      !data.password ||
      !data.phone ||
      !data.cnpj
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Name, email, phone, password and cnpj are required",
        });
    }

    const result = await createMechanicService(data);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createMechanicController,
};
