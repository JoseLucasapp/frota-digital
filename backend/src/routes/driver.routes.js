const { createDriverController, getAllDriversController, getDriverByIdController, updateDriverController, deleteDriverController, uploadDriverDocumentController, deleteDriverDocumentController } = require("../controllers/driver.controller");
const { attachUser } = require("../middlewares/attachUser.middleware");
const upload = require("../middlewares/multer");
const { deleteDriverDocumentService } = require("../services/driver.service");
const { requireAuth } = require("../utils/jwt");

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

  /**
  * @swagger
  * /driver:
  *   get:
  *     summary: Get all drivers with optional filters
  *     tags: [Driver]
  *     parameters:
  *       - in: query
  *         name: cpf
  *         schema:
  *           type: string
  *         description: Filter by cpf
  *       - in: query
  *         name: name
  *         schema:
  *           type: string
  *         description: Filter by name (partial match)
  *       - in: query
  *         name: status
  *         schema:
  *           type: string
  *         description: Filter by driver status
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
    "/driver",
    requireAuth,
    attachUser,
    async (req, res) => await getAllDriversController(req, res),
  );

  /**
* @swagger
* /driver/{id}:
*   get:
*     summary: Get driver by id
*     tags: [Driver]
*     parameters:
*       - in: path
*         name: id
*         required: true
*         schema:
*           type: string
*         description: Driver id
*     responses:
*       200:
*         description: Success
*       500:
*         description: Internal Server Error
*/
  router.get(
    "/driver/:id",
    requireAuth,
    attachUser,
    async (req, res) => await getDriverByIdController(req, res),
  );

  /**
   * @swagger
   * /driver/{id}:
   *   put:
   *     summary: Update driver data
   *     tags: [Driver]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Driver id
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
  router.put(
    "/driver/:id",
    async (req, res) => await updateDriverController(req, res),
  );

  /**
 * @swagger
 * /driver/{id}:
 *   delete:
 *     summary: Delete driver by id
 *     tags: [Driver]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Driver id
 *     responses:
 *       200:
 *         description: Success
 *       500:
 *         description: Internal Server Error
 */
  router.delete(
    "/driver/:id",
    requireAuth,
    attachUser,
    async (req, res) => await deleteDriverController(req, res),
  );

  router.post(
    "/driver/:id/document/:documentType",
    requireAuth,
    attachUser,
    upload.single("file"),
    async (req, res) => await uploadDriverDocumentController(req, res),
  );

  router.delete(
    "/driver/:id/document/:documentType",
    requireAuth,
    attachUser,
    async (req, res) => await deleteDriverDocumentController(req, res),
  );
};
