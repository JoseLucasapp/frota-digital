const { requireSupabaseAuth, requireAuth } = require("../utils/jwt");
const { attachUser } = require("../middlewares/attachUser.middleware");
const { requireRole } = require("../security/role.guard");
const {loginController} = require('../controllers/auth.controller')

module.exports = (router) => {
  /**
   * @swagger
   * /login:
   *   post:
   *     summary: Login with email and password
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 example: jose@email.com
   *               password:
   *                 type: string
   *                 format: password
   *                 example: 123456
   *     responses:
   *       200:
   *         description: Success, returns JWT token and user info
   *       400:
   *         description: Bad Request, missing or invalid fields
   *       500:
   *         description: Internal Server Error
   */
  router.post("/login", async (req, res) => await loginController(req, res));

  /**
   * @swagger
   * /me:
   *   get:
   *     summary: Get the current user's profile
   *     tags: [Auth]
   *     security:
   *      - bearerAuth: []
   *     responses:
   *       200:
   *         description: Success
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal Server Error
   *
   */
  router.get("/me", requireAuth, attachUser, (req, res) => {
    res.json({ user: req.user });
  });

  /**
   * @swagger
   * /admin/stats:
   *   get:
   *     summary: Get admin stats (protected route)
   *     tags: [Auth]
   *     responses:
   *       200:
   *         description: Success
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       500:
   *         description: Internal Server Error
   */
  router.get(
    "/admin/stats",
    requireAuth,
    attachUser,
    requireRole("ADMIN"),
    async (req, res) => {
      res.json({ ok: true, adminId: req.user.profile.id });
    },
  );

  /**
   * @swagger
   * /jobs:
   *   get:
   *     summary: Get jobs for drivers and mechanics (protected route)
   *     tags: [Auth]
   *     responses:
   *       200:
   *         description: Success
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       500:
   *         description: Internal Server Error
   */
  router.get(
    "/jobs",
    requireAuth,
    attachUser,
    requireRole("DRIVER", "MECHANIC"),
    async (req, res) => {
      res.json({ ok: true, role: req.user.role });
    },
  );
}