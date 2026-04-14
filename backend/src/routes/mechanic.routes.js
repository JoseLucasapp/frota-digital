const { createMechanicController, getAllMechanicsController, getMechanicByIdController, updateMechanicController, deleteMechanicController, deleteMechanicDocumentController, uploadMechanicDocumentController } = require("../controllers/mechanic.controller");
const { attachUser } = require("../middlewares/attachUser.middleware");
const { requireRole } = require("../security/role.guard");
const { requireAuth } = require("../utils/jwt");
const upload = require("../middlewares/multer");

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
   *                 example: mechanic@email.com
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
   *       201:
   *         description: Success
   *       400:
   *         description: Bad Request
   *       500:
   *         description: Internal Server Error
   */
  router.post(
    "/mechanic",
    requireAuth,
    attachUser,
    requireRole("ADMIN"),
    async (req, res) => await createMechanicController(req, res),
  );

  /**
  * @swagger
  * /mechanic:
  *   get:
  *     summary: Get all mechanics with optional filters
  *     tags: [Mechanic]
  *     parameters:
  *       - in: query
  *         name: cnpj
  *         schema:
  *           type: string
  *         description: Filter by cnpj
  *       - in: query
  *         name: name
  *         schema:
  *           type: string
  *         description: Filter by name (partial match)
  *       - in: query
  *         name: status
  *         schema:
  *           type: string
  *         description: Filter by mechanic status
  *       - in: query
  *         name: sortBy
  *         schema:
  *           type: string
  *           description: Order by status or created_at
  *     responses:
  *       200:
  *         description: Success
  *       500:
  *         description: Internal Server Error
  */
  router.get(
    "/mechanic",
    requireAuth,
    attachUser,
    async (req, res) => await getAllMechanicsController(req, res),
  );

  /**
* @swagger
* /mechanic/{id}:
*   get:
*     summary: Get mechanic by id
*     tags: [Mechanic]
*     parameters:
*       - in: path
*         name: id
*         required: true
*         schema:
*           type: string
*         description: Mechanic id
*     responses:
*       200:
*         description: Success
*       500:
*         description: Internal Server Error
*/
  router.get(
    "/mechanic/:id",
    requireAuth,
    attachUser,
    async (req, res) => await getMechanicByIdController(req, res),
  );

  /**
   * @swagger
   * /mechanic/{id}:
   *   put:
   *     summary: Update mechanic data
   *     tags: [Mechanic]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Mechanic id
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
   *                 example: mechanic@email.com
   *               password:
   *                 type: string
   *                 example: 12345678
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
   *       201:
   *         description: Success
   *       400:
   *         description: Bad Request
   *       500:
   *         description: Internal Server Error
   */
  router.put(
    "/mechanic/:id",
    async (req, res) => await updateMechanicController(req, res),
  );

  /**
 * @swagger
 * /mechanic/{id}:
 *   delete:
 *     summary: Delete mechanic by id
 *     tags: [Mechanic]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Mechanic id
 *     responses:
 *       200:
 *         description: Success
 *       500:
 *         description: Internal Server Error
 */
  router.delete(
    "/mechanic/:id",
    requireAuth,
    attachUser,
    async (req, res) => await deleteMechanicController(req, res),
  );

  router.post(
    "/mechanic/:id/document/:documentType",
    requireAuth,
    attachUser,
    upload.single("file"),
    async (req, res) => await uploadMechanicDocumentController(req, res),
  );

  router.delete(
    "/mechanic/:id/document/:documentType",
    requireAuth,
    attachUser,
    async (req, res) => await deleteMechanicDocumentController(req, res),
  );
};

