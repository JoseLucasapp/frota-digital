const { loginService } = require("../services/auth.service.js");

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await loginService({ email, password });
    return res.json(result);
  } catch (err) {
    return res
      .status(500)
      .json(err);
  }
}


module.exports = {
  loginController,
}