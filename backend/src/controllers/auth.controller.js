const { loginService, completeDriverFirstAccessService,
  completeMechanicFirstAccessService, validateDriverFirstAccessService, validateMechanicFirstAccessService } = require("../services/auth.service.js");

const loginController = async (req, res) => {
  try {
    const { email, password, institution } = req.body;

    const result = await loginService({ email, password, institution });
    return res.json(result);
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  }
};

const validateDriverFirstAccessController = async (req, res) => {
  try {
    const result = await validateDriverFirstAccessService(req.body);
    return res.status(200).json(result);
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({ success: false, message: error.message });
  }
};

const validateMechanicFirstAccessController = async (req, res) => {
  try {
    const result = await validateMechanicFirstAccessService(req.body);
    return res.status(200).json(result);
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({ success: false, message: error.message });
  }
};

const completeDriverFirstAccessController = async (req, res) => {
  try {
    const result = await completeDriverFirstAccessService(req.body);
    return res.status(200).json(result);
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({ success: false, message: error.message });
  }
};

const completeMechanicFirstAccessController = async (req, res) => {
  try {
    const result = await completeMechanicFirstAccessService(req.body);
    return res.status(200).json(result);
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({ success: false, message: error.message });
  }
};

module.exports = {
  loginController,
  validateDriverFirstAccessController,
  validateMechanicFirstAccessController,
  completeDriverFirstAccessController,
  completeMechanicFirstAccessController,
};