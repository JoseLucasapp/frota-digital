const { createMechanicController } = require("../controllers/mechanic.controller");

module.exports = (router) => {
  /**
   * @swagger
   * /mechanic:
   *   post:
   *     summary: Create a new mechanic
   *     tags: [Mechanic]
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
   *               password:
   *                 type: string
   *                 example: 123456
   *               phone:
   *                 type: string
   *                 example: 83999998888
   *               specialties:
   *                 type: string
   *                 example: Elétrica, Mecânica Geral
   *               address:
   *                 type: string
   *                 example: Rua das Flores, 123
   *               cnpj:
   *                 type: string
   *                 example: 12.345.678/0001-90
   *     responses:
   *       200:
   *         description: Success
   *       400:
   *         description: Bad Request
   *       500:
   *         description: Internal Server Error
   */
  router.post(
    "/mechanic",
    async (req, res) => await createMechanicController(req, res),
  );
};
