const {createAdminController} = require('../controllers/admin.controller')

module.exports = (router) => {
  /**
   * @swagger
   * /admin:
   *   post:
   *     summary: Create a new admin
   *     tags: [Admin]
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
   *               institution:
   *                 type: string
   *                 example: Frota Digital LTDA
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
    "/admin",
    async (req, res) => await createAdminController(req, res),
  );
}