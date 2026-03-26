const { createLoanController, getAllLoansController, getLoanByIdController, updateLoanController, deleteLoanController } = require("../controllers/loans.controller");
const { attachUser } = require("../middlewares/attachUser.middleware");
const { requireRole } = require("../security/role.guard");
const { requireAuth } = require("../utils/jwt");

module.exports = (router) => {

    /**
       * @swagger
       * /loans:
       *   post:
       *     summary: Create a new loan
       *     tags: [Loans]
       *     requestBody:
       *       required: true
       *       content:
       *         application/json:
       *           schema:
       *             type: object
       *             properties:
       *               start_date:
       *                 type: date
       *                 example: "2023-01-01"
       *               end_date:
       *                 type: date
       *                 example: "2023-12-31"
       *               reason: 
       *                 type: string
       *                 example: reason for the loan
       *               vehicle_id: 
       *                 type: string
       *                 example: 46b69d42-8c88-4fb5-825d-24e27b83f50b
       *               driver_id: 
       *                 type: string
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
        "/loans",
        requireAuth,
        attachUser,
        requireRole("ADMIN"),
        async (req, res) => await createLoanController(req, res),
    );

    /**
   * @swagger
   * /loans:
   *   get:
   *     summary: Get all loans with optional filters
   *     tags: [Loans]
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
        "/loans",
        requireAuth,
        attachUser,
        async (req, res) => await getAllLoansController(req, res),
    );

    /**
  * @swagger
  * /loans/{id}:
  *   get:
  *     summary: Get loan by id
  *     tags: [Loans]
  *     parameters:
  *       - in: path
  *         name: id
  *         required: true
  *         schema:
  *           type: string
  *         description: Loan id
  *     responses:
  *       200:
  *         description: Success
  *       500:
  *         description: Internal Server Error
  */
    router.get(
        "/loans/:id",
        requireAuth,
        attachUser,
        async (req, res) => await getLoanByIdController(req, res),
    );

    /**
   * @swagger
   * /loans/{id}:
   *   put:
   *     summary: Update a loan
   *     tags: [Loans]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Loan id
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               start_date:
   *                 type: date
   *                 example: "2023-01-01"
   *               end_date:
   *                 type: date
   *                 example: "2023-12-31"
   *               reason: 
   *                 type: string
   *                 example: reason for the loan
   *               vehicle_id: 
   *                 type: string
   *                 example: 46b69d42-8c88-4fb5-825d-24e27b83f50b
   *               driver_id: 
   *                 type: string
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
        "/loans/:id",
        requireAuth,
        attachUser,
        requireRole("ADMIN"),
        async (req, res) => await updateLoanController(req, res),
    );

    /**
 * @swagger
 * /loans/{id}:
 *   delete:
 *     summary: Delete loan by id
 *     tags: [Loans]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Loan id
 *     responses:
 *       200:
 *         description: Success
 *       500:
 *         description: Internal Server Error
 */
    router.delete(
        "/loans/:id",
        requireAuth,
        attachUser,
        requireRole("ADMIN"),
        async (req, res) => await deleteLoanController(req, res),
    );

}

