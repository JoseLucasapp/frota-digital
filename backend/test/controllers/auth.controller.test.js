const express = require("express");
const request = require("supertest");

const { loginController } = require("../../src/controllers/auth.controller");
const { requireAuth } = require("../../src/utils/jwt");
const { attachUser } = require("../../src/middlewares/attachUser.middleware");
const { requireRole } = require("../../src/security/role.guard");

jest.mock("../../src/controllers/auth.controller", () => ({
    loginController: jest.fn(),
}));

jest.mock("../../src/utils/jwt", () => ({
    requireSupabaseAuth: jest.fn(),
    requireAuth: jest.fn(),
}));

jest.mock("../../src/middlewares/attachUser.middleware", () => ({
    attachUser: jest.fn(),
}));

jest.mock("../../src/security/role.guard", () => ({
    requireRole: jest.fn(),
}));

const buildApp = () => {
    const app = express();
    app.use(express.json());

    const router = express.Router();
    const registerRoutes = require("../../src/routes/auth.routes");
    registerRoutes(router);
    app.use(router);

    return app;
};

describe("auth.routes", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        requireAuth.mockImplementation((req, res, next) => {
            req.user = {
                id: "1",
                role: "ADMIN",
                profile: { id: "1" },
            };
            next();
        });

        attachUser.mockImplementation((req, res, next) => next());
        requireRole.mockImplementation(() => (req, res, next) => next());

        loginController.mockImplementation((req, res) =>
            res.status(200).json({ token: "fake-token" })
        );
    });

    test("POST /login should call loginController", async () => {
        const app = buildApp();

        const res = await request(app).post("/login").send({
            email: "admin@email.com",
            password: "123456",
        });

        expect(loginController).toHaveBeenCalled();
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ token: "fake-token" });
    });

    test("GET /me should return current user", async () => {
        const app = buildApp();

        const res = await request(app).get("/me");

        expect(requireAuth).toHaveBeenCalled();
        expect(attachUser).toHaveBeenCalled();
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            user: {
                id: "1",
                role: "ADMIN",
                profile: { id: "1" },
            },
        });
    });

    test("GET /admin/stats should allow ADMIN", async () => {
        const app = buildApp();

        const res = await request(app).get("/admin/stats");

        expect(requireRole).toHaveBeenCalledWith("ADMIN");
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            ok: true,
            adminId: "1",
        });
    });

    test("GET /jobs should allow DRIVER and MECHANIC roles", async () => {
        requireAuth.mockImplementation((req, res, next) => {
            req.user = {
                id: "2",
                role: "DRIVER",
                profile: { id: "2" },
            };
            next();
        });

        const app = buildApp();

        const res = await request(app).get("/jobs");

        expect(requireRole).toHaveBeenCalledWith("DRIVER", "MECHANIC");
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            ok: true,
            role: "DRIVER",
        });
    });

    test("should block request when requireAuth returns 401", async () => {
        requireAuth.mockImplementation((req, res) =>
            res.status(401).json({ success: false, message: "Unauthorized" })
        );

        const app = buildApp();

        const res = await request(app).get("/me");

        expect(res.status).toBe(401);
        expect(res.body).toEqual({
            success: false,
            message: "Unauthorized",
        });
    });

    test("should block admin route when requireRole returns 403", async () => {
        requireRole.mockImplementation(() => (req, res) =>
            res.status(403).json({ success: false, message: "Forbidden" })
        );

        const app = buildApp();

        const res = await request(app).get("/admin/stats");

        expect(res.status).toBe(403);
        expect(res.body).toEqual({
            success: false,
            message: "Forbidden",
        });
    });
});