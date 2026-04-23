const {
  createTrackingLogController,
  getTrackingLogsController,
  getTrackingOverviewController,
} = require("../controllers/tracking.controller");
const { attachUser } = require("../middlewares/attachUser.middleware");
const { requireAuth } = require("../utils/jwt");

module.exports = (router) => {
  /**
   * @swagger
   * /tracking/logs:
   *   get:
   *     summary: List tracking logs
   *     tags: [Tracking]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: vehicle_id
   *         schema:
   *           type: string
   *         description: Filter by vehicle id
   *       - in: query
   *         name: driver_id
   *         schema:
   *           type: string
   *         description: Filter by driver id
   *       - in: query
   *         name: source
   *         schema:
   *           type: string
   *           enum: [manual, browser_geolocation]
   *         description: Filter by tracking source
   *       - in: query
   *         name: start_date
   *         schema:
   *           type: string
   *           format: date-time
   *         description: Initial datetime filter
   *       - in: query
   *         name: end_date
   *         schema:
   *           type: string
   *           format: date-time
   *         description: Final datetime filter
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           example: 1
   *         description: Page number
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           example: 20
   *         description: Items per page
   *     responses:
   *       200:
   *         description: Tracking logs listed successfully
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    "/tracking/logs",
    requireAuth,
    attachUser,
    async (req, res) => await getTrackingLogsController(req, res),
  );

  /**
   * @swagger
   * /tracking/overview:
   *   get:
   *     summary: List tracking overview by vehicle
   *     tags: [Tracking]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: vehicle_id
   *         schema:
   *           type: string
   *         description: Filter by vehicle id
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           example: 200
   *         description: Max number of vehicles returned
   *     responses:
   *       200:
   *         description: Tracking overview listed successfully
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get(
    "/tracking/overview",
    requireAuth,
    attachUser,
    async (req, res) => await getTrackingOverviewController(req, res),
  );

  /**
   * @swagger
   * /tracking/logs:
   *   post:
   *     summary: Create a tracking log
   *     tags: [Tracking]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - vehicle_id
   *             properties:
   *               vehicle_id:
   *                 type: string
   *                 example: 3f7d6b66-2f1a-4d20-b67f-123456789abc
   *               driver_id:
   *                 type: string
   *                 example: 97b0dcf7-2a09-4f6e-b4e3-123456789abc
   *                 description: Optional for admin requests. Ignored for driver requests.
   *               latitude:
   *                 type: number
   *                 format: float
   *                 example: -6.8897
   *               longitude:
   *                 type: number
   *                 format: float
   *                 example: -38.5612
   *               address:
   *                 type: string
   *                 example: Rua Manoel Emiliano, 16 - Frei Damião, Santa Luzia - PB
   *               source:
   *                 type: string
   *                 enum: [manual, browser_geolocation]
   *                 example: manual
   *               notes:
   *                 type: string
   *                 example: Atualização feita pelo motorista
   *               recorded_at:
   *                 type: string
   *                 format: date-time
   *                 example: 2026-04-23T15:30:00.000Z
   *     responses:
   *       201:
   *         description: Tracking log created successfully
   *       400:
   *         description: Invalid request data
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Vehicle not found
   *       500:
   *         description: Internal server error
   */
  router.post(
    "/tracking/logs",
    requireAuth,
    attachUser,
    async (req, res) => await createTrackingLogController(req, res),
  );
};