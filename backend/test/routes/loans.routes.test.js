const express = require("express");
const request = require("supertest");

jest.mock("../../src/controllers/loans.controller", () => ({
    createLoanController: jest.fn((req, res) =>
        res.status(201).json({ ok: "create" })
    ),
    getAllLoansController: jest.fn((req, res) =>
        res.status(200).json({ ok: "list" })
    ),
    getLoanByIdController: jest.fn((req, res) =>
        res.status(200).json({ ok: "getById" })
    ),
    updateLoanController: jest.fn((req, res) =>
        res.status(200).json({ ok: "update" })
    ),
    deleteLoanController: jest.fn((req, res) =>
        res.status(200).json({ ok: "delete" })
    ),
}));

jest.mock("../../src/utils/jwt", () => ({
    requireAuth: jest.fn((req, res, next) => next()),
}));

jest.mock("../../src/middlewares/attachUser.middleware", () => ({
    attachUser: jest.fn((req, res, next) => next()),
}));

jest.mock("../../src/security/role.guard", () => ({
    requireRole: jest.fn(() => (req, res, next) => next()),
}));

const {
    createLoanController,
    getAllLoansController,
    getLoanByIdController,
    updateLoanController,
    deleteLoanController,
} = require("../../src/controllers/loans.controller");

const { requireRole } = require("../../src/security/role.guard");
const { requireAuth } = require("../../src/utils/jwt");

const buildApp = () => {
    const app = express();
    app.use(express.json());

    const router = express.Router();
    const registerRoutes = require("../../src/routes/loans.routes");
    registerRoutes(router);

    app.use(router);
    return app;
};

describe("loans.routes", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("POST /loans should call createLoanController", async () => {
        const app = buildApp();

        const res = await request(app).post("/loans").send({
            start_date: "2023-01-01",
            end_date: "2023-12-31",
            reason: "Loan reason",
            vehicle_id: "veh-1",
            driver_id: "drv-1",
        });

        expect(requireRole).toHaveBeenCalledWith("ADMIN");
        expect(createLoanController).toHaveBeenCalled();
        expect(res.status).toBe(201);
        expect(res.body).toEqual({ ok: "create" });
    });

    test("GET /loans should call getAllLoansController", async () => {
        const app = buildApp();

        const res = await request(app).get("/loans");

        expect(requireRole).toHaveBeenCalledWith("ADMIN");
        expect(getAllLoansController).toHaveBeenCalled();
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ ok: "list" });
    });

    test("GET /loans/:id should call getLoanByIdController", async () => {
        const app = buildApp();

        const res = await request(app).get("/loans/1");

        expect(requireRole).toHaveBeenCalledWith("ADMIN");
        expect(getLoanByIdController).toHaveBeenCalled();
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ ok: "getById" });
    });

    test("PUT /loans/:id should call updateLoanController", async () => {
        const app = buildApp();

        const res = await request(app).put("/loans/1").send({
            reason: "Updated loan",
        });

        expect(requireRole).toHaveBeenCalledWith("ADMIN");
        expect(updateLoanController).toHaveBeenCalled();
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ ok: "update" });
    });

    test("DELETE /loans/:id should call deleteLoanController", async () => {
        const app = buildApp();

        const res = await request(app).delete("/loans/1");

        expect(requireRole).toHaveBeenCalledWith("ADMIN");
        expect(deleteLoanController).toHaveBeenCalled();
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ ok: "delete" });
    });

    test("should block request when requireAuth returns 401", async () => {
        requireAuth.mockImplementationOnce((req, res) =>
            res.status(401).json({ success: false, message: "Unauthorized" })
        );

        const app = buildApp();

        const res = await request(app).get("/loans");

        expect(getAllLoansController).not.toHaveBeenCalled();
        expect(res.status).toBe(401);
        expect(res.body).toEqual({
            success: false,
            message: "Unauthorized",
        });
    });

    test("should block request when requireRole returns 403 on POST", async () => {
        requireRole.mockImplementationOnce(() => (req, res) =>
            res.status(403).json({ success: false, message: "Forbidden" })
        );

        const app = buildApp();

        const res = await request(app).post("/loans").send({});

        expect(createLoanController).not.toHaveBeenCalled();
        expect(res.status).toBe(403);
        expect(res.body).toEqual({
            success: false,
            message: "Forbidden",
        });
    });

    test("should block request when requireRole returns 403 on PUT", async () => {
        requireRole.mockImplementation(() => (req, res) =>
            res.status(403).json({ success: false, message: "Forbidden" })
        );

        const app = buildApp();

        const res = await request(app).put("/loans/1").send({
            reason: "Updated loan",
        });

        expect(updateLoanController).not.toHaveBeenCalled();
        expect(res.status).toBe(403);
        expect(res.body).toEqual({
            success: false,
            message: "Forbidden",
        });
    });
});