const { createDriverController } = require("../controllers/driver.controller");

module.exports = (router) => {
  router.post(
    "/driver",
    async (req, res) => await createDriverController(req, res),
  );
};
