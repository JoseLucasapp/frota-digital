const { loginService } = require("../services/auth.service.js");

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await loginService({ email, password });
    return res.json(result);
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  loginController,
};