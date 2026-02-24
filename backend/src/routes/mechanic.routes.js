const { createMechanicController } = require("../controllers/mechanic.controller");

module.exports = (router) => {
  router.post(
    "/mechanic",
    async (req, res) => await createMechanicController(req, res),
  );
};
