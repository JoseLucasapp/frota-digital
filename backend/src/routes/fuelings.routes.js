const { createFuelingController, getAllFuelingsController, getFuelingByIdController, updateFuelingController, deleteFuelingController, deleteFuelingReceiptController, uploadFuelingReceiptController } = require("../controllers/fueling.controller");
const { attachUser } = require("../middlewares/attachUser.middleware");
const { requireRole } = require("../security/role.guard");
const { requireAuth } = require("../utils/jwt");
const upload = require("../middlewares/multer");

module.exports = (router) => {

    /**
   * @swagger
   * /fueling:
   *   post:
   *     summary: Create a new fueling
   *     tags: [Fueling]
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
   *               fuel_type:
   *                 type: string
   *                 example: Gasolina
   *               price_per_liter:
   *                 type: number
   *                 example: 6.17
   *               liters:
   *                 type: number
   *                 example: 100
   *               current_km:
   *                 type: number
   *                 example: 25677
   *               station:
   *                 type: string
   *                 example: Posto Dedé Jaime
   *               receipt_url:
   *                 type: string
   *                 example: url.supabase.receipt
   *               vehicle_id:
   *                 type: uuid
   *                 example: df88a745-b108-41ea-978c-b08333542593
   *     responses:
   *       201:
   *         description: Success
   *       400:
   *         description: Bad Request
   *       500:
   *         description: Internal Server Error
   */

    router.post(
        "/fueling",
        requireAuth,
        attachUser,
        requireRole("DRIVER", "ADMIN"),
        async (req, res) => await createFuelingController(req, res),
    );


    /**
   * @swagger
   * /fueling:
   *   get:
   *     summary: Get all fuelings with optional filters
   *     tags: [Fueling]
   *     parameters:
   *       - in: query
   *         name: fuel_type
   *         schema:
   *           type: string
   *         description: Filter by fuel type
   *       - in: query
   *         name: station
   *         schema:
   *           type: string
   *         description: Filter by station (partial match)
   *       - in: query
   *         name: vehicle_id
   *         schema:
   *           type: string
   *         description: Filter by vehicle id
   *     responses:
   *       200:
   *         description: Success
   *       500:
   *         description: Internal Server Error
   */
    router.get(
        "/fueling",
        requireAuth,
        attachUser,
        async (req, res) => await getAllFuelingsController(req, res),
    );

    /**
  * @swagger
  * /fueling/{id}:
  *   get:
  *     summary: Get fueling by id
  *     tags: [Fueling]
  *     parameters:
  *       - in: path
  *         name: id
  *         required: true
  *         schema:
  *           type: string
  *         description: Fueling id
  *     responses:
  *       200:
  *         description: Success
  *       500:
  *         description: Internal Server Error
  */
    router.get(
        "/fueling/:id",
        requireAuth,
        attachUser,
        async (req, res) => await getFuelingByIdController(req, res),
    );

    /**
   * @swagger
   * /fueling/{id}:
   *   put:
   *     summary: Update a fueling
   *     tags: [Fueling]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Fueling id
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
   *               fuel_type:
   *                 type: string
   *                 example: Gasolina
   *               price_per_liter:
   *                 type: number
   *                 example: 6.17
   *               current_km:
   *                 type: number
   *                 example: 25677
   *               station:
   *                 type: string
   *                 example: Posto Dedé Jaime
   *               receipt_url:
   *                 type: string
   *                 example: url.supabase.receipt
   *               vehicle_id:
   *                 type: uuid
   *                 example: testeid
   *     responses:
   *       200:
   *         description: Success
   *       400:
   *         description: Bad Request
   *       500:
   *         description: Internal Server Error
   */

    router.put(
        "/fueling/:id",
        requireAuth,
        attachUser,
        requireRole("DRIVER", "ADMIN"),
        async (req, res) => await updateFuelingController(req, res),
    );

    router.post(
        "/fueling/:id/receipt",
        requireAuth,
        attachUser,
        requireRole("DRIVER", "ADMIN"),
        upload.single("file"),
        async (req, res) => await uploadFuelingReceiptController(req, res),
    );

    /**
 * @swagger
 * /fueling/{id}:
 *   delete:
 *     summary: Delete fueling by id
 *     tags: [Fueling]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Fueling id
 *     responses:
 *       200:
 *         description: Success
 *       500:
 *         description: Internal Server Error
 */
    router.delete(
        "/fueling/:id",
        requireAuth,
        attachUser,
        async (req, res) => await deleteFuelingController(req, res),
    );

    router.delete(
        "/fueling/:id/receipt",
        requireAuth,
        attachUser,
        requireRole("DRIVER", "ADMIN"),
        async (req, res) => await deleteFuelingReceiptController(req, res),
    );


}
