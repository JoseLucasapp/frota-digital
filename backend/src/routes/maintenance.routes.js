const {
    createMaintenancesController,
    getAllMaintenancesController,
    getMaintenancesByIdController,
    updateMaintenancesController,
    uploadMaintenancesReceiptController,
    deleteMaintenanceReceiptController,
    deleteMaintenanceController,
} = require("../controllers/maintenance.controller");
const { attachUser } = require("../middlewares/attachUser.middleware");
const { requireRole } = require("../security/role.guard");
const { requireAuth } = require("../utils/jwt");
const upload = require("../middlewares/multer");

module.exports = (router) => {
    /**
     * @swagger
     * /maintenances:
     *   post:
     *     summary: Create a new maintenance
     *     tags: [Maintenances]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               vehicle_id:
     *                 type: string
     *                 example: df88a745-b108-41ea-978c-b08333542593
     *               mechanic_id:
     *                 type: string
     *                 example: 1d88a745-b108-41ea-978c-b08333542511
     *               type:
     *                 type: string
     *                 example: Troca de óleo
     *               description:
     *                 type: string
     *                 example: Troca de óleo e filtro
     *               priority:
     *                 type: string
     *                 example: HIGH
     *               estimated_cost:
     *                 type: number
     *                 example: 250.50
     *               status:
     *                 type: string
     *                 example: PENDING
     *     responses:
     *       201:
     *         description: Success
     *       400:
     *         description: Bad Request
     *       500:
     *         description: Internal Server Error
     */
    router.post(
        "/maintenances",
        requireAuth,
        attachUser,
        requireRole("ADMIN", "MECHANIC"),
        async (req, res) => await createMaintenancesController(req, res),
    );

    /**
     * @swagger
     * /maintenances:
     *   get:
     *     summary: Get all maintenances with optional filters
     *     tags: [Maintenances]
     *     parameters:
     *       - in: query
     *         name: vehicle_id
     *         schema:
     *           type: string
     *         description: Filter by vehicle id
     *       - in: query
     *         name: mechanic_id
     *         schema:
     *           type: string
     *         description: Filter by mechanic id
     *       - in: query
     *         name: status
     *         schema:
     *           type: string
     *         description: Filter by maintenance status
     *       - in: query
     *         name: type
     *         schema:
     *           type: string
     *         description: Filter by maintenance type (partial match)
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *         description: Page number
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *         description: Items per page
     *     responses:
     *       200:
     *         description: Success
     *       500:
     *         description: Internal Server Error
     */
    router.get(
        "/maintenances",
        requireAuth,
        attachUser,
        async (req, res) => await getAllMaintenancesController(req, res),
    );

    /**
     * @swagger
     * /maintenances/{id}:
     *   get:
     *     summary: Get maintenance by id
     *     tags: [Maintenances]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Maintenance id
     *     responses:
     *       200:
     *         description: Success
     *       404:
     *         description: Maintenance not found
     *       500:
     *         description: Internal Server Error
     */
    router.get(
        "/maintenances/:id",
        requireAuth,
        attachUser,
        async (req, res) => await getMaintenancesByIdController(req, res),
    );

    /**
     * @swagger
     * /maintenances/{id}:
     *   put:
     *     summary: Update a maintenance
     *     tags: [Maintenances]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Maintenance id
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               vehicle_id:
     *                 type: string
     *                 example: df88a745-b108-41ea-978c-b08333542593
     *               mechanic_id:
     *                 type: string
     *                 example: 1d88a745-b108-41ea-978c-b08333542511
     *               type:
     *                 type: string
     *                 example: Troca de óleo
     *               description:
     *                 type: string
     *                 example: Troca de óleo e filtro
     *               priority:
     *                 type: string
     *                 example: HIGH
     *               estimated_cost:
     *                 type: number
     *                 example: 250.50
     *               status:
     *                 type: string
     *                 example: COMPLETED
     *               receipt_url:
     *                 type: string
     *                 example: https://supabase-url.com/file.jpg
     *     responses:
     *       200:
     *         description: Success
     *       400:
     *         description: Bad Request
     *       500:
     *         description: Internal Server Error
     */
    router.put(
        "/maintenances/:id",
        requireAuth,
        attachUser,
        requireRole("ADMIN", "MECHANIC"),
        async (req, res) => await updateMaintenancesController(req, res),
    );

    /**
     * @swagger
     * /maintenances/{id}/receipt:
     *   post:
     *     summary: Upload maintenance receipt
     *     tags: [Maintenances]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Maintenance id
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             properties:
     *               file:
     *                 type: string
     *                 format: binary
     *     responses:
     *       200:
     *         description: Receipt uploaded successfully
     *       400:
     *         description: File is required
     *       404:
     *         description: Maintenance not found
     *       500:
     *         description: Internal Server Error
     */
    router.post(
        "/maintenances/:id/receipt",
        requireAuth,
        attachUser,
        requireRole("ADMIN", "MECHANIC"),
        upload.single("file"),
        async (req, res) => await uploadMaintenancesReceiptController(req, res),
    );

    /**
     * @swagger
     * /maintenances/{id}:
     *   delete:
     *     summary: Delete maintenance by id
     *     tags: [Maintenances]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Maintenance id
     *     responses:
     *       200:
     *         description: Success
     *       500:
     *         description: Internal Server Error
     */
    router.delete(
        "/maintenances/:id",
        requireAuth,
        attachUser,
        requireRole("ADMIN", "MECHANIC"),
        async (req, res) => await deleteMaintenanceController(req, res),
    );

    /**
     * @swagger
     * /maintenances/{id}/receipt:
     *   delete:
     *     summary: Delete maintenance receipt
     *     tags: [Maintenances]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Maintenance id
     *     responses:
     *       200:
     *         description: Receipt deleted successfully
     *       404:
     *         description: Receipt not found
     *       500:
     *         description: Internal Server Error
     */
    router.delete(
        "/maintenances/:id/receipt",
        requireAuth,
        attachUser,
        requireRole("ADMIN", "MECHANIC"),
        async (req, res) => await deleteMaintenanceReceiptController(req, res),
    );
};