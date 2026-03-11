const { createVehicleController, getAllVehiclesController, getVehicleByIdController, updateVehicleController, deleteVehicleController } = require("../controllers/vehicle.controller");
const { attachUser } = require("../middlewares/attachUser.middleware");
const { requireRole } = require("../security/role.guard");
const { requireAuth } = require("../utils/jwt");

module.exports = (router) => {

    /**
   * @swagger
   * /vehicle:
   *   post:
   *     summary: Create a new vehicle
   *     tags: [Vehicle]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               fuel_type:
   *                 type: string
   *                 example: Gasolina
   *               model:
   *                 type: string
   *                 example: SW4
   *               plate:
   *                 type: string
   *                 example: ab12
   *               current_km:
   *                 type: number
   *                 example: 25677
   *               status:
   *                 type: string
   *                 example: active
   *               year:
   *                 type: string
   *                 example: 2022
   *               make:
   *                 type: string
   *                 example: Toyota
   *     responses:
   *       201:
   *         description: Success
   *       400:
   *         description: Bad Request
   *       500:
   *         description: Internal Server Error
   */

    router.post(
        "/vehicle",
        requireAuth,
        attachUser,
        requireRole("ADMIN"),
        async (req, res) => await createVehicleController(req, res),
    );


    /**
   * @swagger
   * /vehicle:
   *   get:
   *     summary: Get all vehicles with optional filters
   *     tags: [Vehicle]
   *     parameters:
   *       - in: query
   *         name: plate
   *         schema:
   *           type: string
   *         description: Filter by plate
   *       - in: query
   *         name: model
   *         schema:
   *           type: string
   *         description: Filter by model (partial match)
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *         description: Filter by vehicle status
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
        "/vehicle",
        requireAuth,
        attachUser,
        async (req, res) => await getAllVehiclesController(req, res),
    );

    /**
  * @swagger
  * /vehicle/{id}:
  *   get:
  *     summary: Get vehicle by id
  *     tags: [Vehicle]
  *     parameters:
  *       - in: path
  *         name: id
  *         required: true
  *         schema:
  *           type: string
  *         description: Vehicle id
  *     responses:
  *       200:
  *         description: Success
  *       500:
  *         description: Internal Server Error
  */
    router.get(
        "/vehicle/:id",
        requireAuth,
        attachUser,
        async (req, res) => await getVehicleByIdController(req, res),
    );

    /**
   * @swagger
   * /vehicle/{id}:
   *   put:
   *     summary: Update a vehicle
   *     tags: [Vehicle]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Vehicle id
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               fuel_type:
   *                 type: string
   *                 example: Gasolina
   *               model:
   *                 type: string
   *                 example: SW4
   *               plate:
   *                 type: string
   *                 example: ab12
   *               current_km:
   *                 type: number
   *                 example: 25677
   *               status:
   *                 type: string
   *                 example: active
   *               year:
   *                 type: string
   *                 example: 2022
   *               make:
   *                 type: string
   *                 example: Toyota
   *     responses:
   *       200:
   *         description: Success
   *       400:
   *         description: Bad Request
   *       500:
   *         description: Internal Server Error
   */

    router.put(
        "/vehicle/:id",
        requireAuth,
        attachUser,
        requireRole("ADMIN"),
        async (req, res) => await updateVehicleController(req, res),
    );

    /**
 * @swagger
 * /vehicle/{id}:
 *   delete:
 *     summary: Delete vehicle by id
 *     tags: [Vehicle]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vehicle id
 *     responses:
 *       200:
 *         description: Success
 *       500:
 *         description: Internal Server Error
 */
    router.delete(
        "/vehicle/:id",
        requireAuth,
        attachUser,
        async (req, res) => await deleteVehicleController(req, res),
    );

}
