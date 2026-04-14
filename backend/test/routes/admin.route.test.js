const express = require("express");
const request = require("supertest");

jest.mock("../../src/controllers/admin.controller", () => ({
    createAdminController: jest.fn((req, res) =>
        res.status(201).json({ ok: "create" })
    ),
    getAllAdminsController: jest.fn((req, res) =>
        res.status(200).json({ ok: "list" })
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
    createAdminController,
    getAllAdminsController,
} = require("../../src/controllers/admin.controller");

const { requireAuth } = require("../../src/utils/jwt");
const { requireRole } = require("../../src/security/role.guard");

const buildApp = () => {
    const app = express();
    app.use(express.json());

    const router = express.Router();
    const registerRoutes = require("../../src/routes/admin.routes");
    registerRoutes(router);

    app.use(router);
    return app;
};

describe("admin.routes", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("POST /admin should call createAdminController", async () => {
        const app = buildApp();

        const res = await request(app).post("/admin").send({
            name: "José",
            email: "jose@email.com",
            password: "123456",
            phone: "83999999999",
            institution: "Frota Digital",
            cnpj: "123",
        });

        expect(createAdminController).toHaveBeenCalled();
        expect(res.status).toBe(201);
        expect(res.body).toEqual({ ok: "create" });
    });

    test("GET /admin should call getAllAdminsController", async () => {
        const app = buildApp();

        const res = await request(app).get("/admin");

        expect(requireRole).toHaveBeenCalledWith("ADMIN");
        expect(getAllAdminsController).toHaveBeenCalled();
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ ok: "list" });
    });

    test("should block request when requireAuth returns 401", async () => {
        requireAuth.mockImplementationOnce((req, res) =>
            res.status(401).json({ success: false, message: "Unauthorized" })
        );

        const app = buildApp();

        const res = await request(app).get("/admin");

        expect(getAllAdminsController).not.toHaveBeenCalled();
        expect(res.status).toBe(401);
        expect(res.body).toEqual({
            success: false,
            message: "Unauthorized",
        });
    });

    test("should block request when requireRole returns 403 on GET", async () => {
        requireRole.mockImplementation(() => (req, res) =>
            res.status(403).json({ success: false, message: "Forbidden" })
        );

        const app = buildApp();

        const res = await request(app).get("/admin");

        expect(getAllAdminsController).not.toHaveBeenCalled();
        expect(res.status).toBe(403);
        expect(res.body).toEqual({
            success: false,
            message: "Forbidden",
        });
    });
});