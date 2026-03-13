const { createDriverController } = require("../controllers/driver.controller");

module.exports = (router) => {
  /**
   * @swagger
   * /driver:
   *   post:
   *     summary: Create a new driver
   *     tags: [Driver]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - email
   *               - password
   *             properties:
   *               name:
   *                 type: string
   *                 example: José Lucas
   *               email:
   *                 type: string
   *                 example: jose@email.com
   *               phone:
   *                 type: string
   *                 example: 83999998888
   *               cnh_category:
   *                 type: string
   *                 example: A-B
   *               cnh_valid_until:
   *                 type: string
   *                 example: 2025-12-31
   *               cpf:
   *                 type: string
   *                 example: 124.345.678-90
   *     responses:
   *       201:
   *         description: Success
   *       400:
   *         description: Bad Request
   *       500:
   *         description: Internal Server Error
   */
  router.post(
    "/driver",
    async (req, res) => await createDriverController(req, res),
  );
};
