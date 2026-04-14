const { createNotificationController, getAllNotificationsController, updateNotificationController, deleteNotificationController, getNotificationByIdController} = require("../controllers/notifications.controller");
const { attachUser } = require("../middlewares/attachUser.middleware");
const { requireAuth } = require("../utils/jwt");
module.exports = (router) => {


       /**
   * @swagger
   * /notifications:
   *   post:
   *     summary: Create a new notification
   *     tags: [Notification]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *                 example: Maintenance Reminder
   *               type:
   *                 type: string
   *                 example: maintenance
   *               message:
   *                 type: string
   *                 example: Your vehicle is due for maintenance in 500 km.
   *               driver_id:
   *                 type: uuid
   *                 example: fd468bc3-fc74-4ea7-bda3-18870fb049ef
   *     responses:
   *       201:
   *         description: Success
   *       400:
   *         description: Bad Request
   *       500:
   *         description: Internal Server Error
   */

    router.post(
        "/notifications",
        requireAuth,
        attachUser,
        async (req, res) => await createNotificationController(req, res),
    );

    /**
   * @swagger
   * /notifications:
   *   get:
   *     summary: Get all notifications with optional filters
   *     tags: [Notification]
   *     parameters:
   *       - in: query
   *         name: driver_id
   *         schema:
   *           type: string
   *         description: Filter by driver ID
   *       - in: query
   *         name: admin_id
   *         schema:
   *           type: string
   *         description: Filter by admin ID
   *       - in: query
   *         name: sortBy
   *         schema:
   *           type: string
   *           description: Order by created_at
   *     responses:
   *       200:
   *         description: Success
   *       500:
   *         description: Internal Server Error
   */
    router.get(
        "/notifications",
        requireAuth,
        attachUser,
        async (req, res) => await getAllNotificationsController(req, res),
    );

    /**
  * @swagger
  * /notifications/{id}:
  *   get:
  *     summary: Get notification by id
  *     tags: [Notification]
  *     parameters:
  *       - in: path
  *         name: id
  *         required: true
  *         schema:
  *           type: string
  *         description: Notification id
  *     responses:
  *       200:
  *         description: Success
  *       500:
  *         description: Internal Server Error
  */
    router.get(
        "/notifications/:id",
        requireAuth,
        attachUser,
        async (req, res) => await getNotificationByIdController(req, res),
    );

     /**
   * @swagger
   * /notifications/{id}:
   *   put:
   *     summary: Update a notification
   *     tags: [Notification]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Notification id
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *                 example: Maintenance Reminder
   *               type:
   *                 type: string
   *                 example: maintenance
   *               message:
   *                 type: string
   *                 example: Your vehicle is due for maintenance in 500 km.
   *               driver_id:
   *                 type: uuid
   *                 example: fd468bc3-fc74-4ea7-bda3-18870fb049ef
   *     responses:
   *       200:
   *         description: Success
   *       400:
   *         description: Bad Request
   *       500:
   *         description: Internal Server Error
   */

    router.put(
        "/notifications/:id",
        requireAuth,
        attachUser,
        async (req, res) => await updateNotificationController(req, res),
    );


    /**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     summary: Delete notification by id
 *     tags: [Notification]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification id
 *     responses:
 *       200:
 *         description: Success
 *       500:
 *         description: Internal Server Error
 */
    router.delete(
        "/notifications/:id",
        requireAuth,
        attachUser,
        async (req, res) => await deleteNotificationController(req, res),
    );

};