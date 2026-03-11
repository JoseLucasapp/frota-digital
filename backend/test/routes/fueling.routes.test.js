const express = require("express");
const request = require("supertest");

const {
    createFuelingController,
    getAllFuelingsController,
    getFuelingByIdController,
    updateFuelingController,
    deleteFuelingController,
} = require("../../src/controllers/fueling.controller");

const { requireAuth } = require("../../src/utils/jwt");
const { attachUser } = require("../../src/middlewares/attachUser.middleware");
const { requireRole } = require("../../src/security/role.guard");

jest.mock("../../src/controllers/fueling.controller", () => ({
    createFuelingController: jest.fn(),
    getAllFuelingsController: jest.fn(),
    getFuelingByIdController: jest.fn(),
    updateFuelingController: jest.fn(),
    deleteFuelingController: jest.fn(),
}));

jest.mock("../../src/utils/jwt", () => ({
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
    const registerRoutes = require("../../src/routes/fuelings.routes");
    registerRoutes(router);

    app.use(router);
    return app;
};

describe("fueling.routes", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        requireAuth.mockImplementation((req, res, next) => next());
        attachUser.mockImplementation((req, res, next) => next());
        requireRole.mockImplementation(() => (req, res, next) => next());

        createFuelingController.mockImplementation((req, res) =>
            res.status(201).json({ ok: "create" })
        );
        getAllFuelingsController.mockImplementation((req, res) =>
            res.status(200).json({ ok: "list" })
        );
        getFuelingByIdController.mockImplementation((req, res) =>
            res.status(200).json({ ok: "getById" })
        );
        updateFuelingController.mockImplementation((req, res) =>
            res.status(200).json({ ok: "update" })
        );
        deleteFuelingController.mockImplementation((req, res) =>
            res.status(200).json({ ok: "delete" })
        );
    });

    test("POST /fueling should call createFuelingController", async () => {
        const app = buildApp();

        const res = await request(app).post("/fueling").send({
            vehicle_id: "veh-1",
            fuel_type: "Gasolina",
            liters: 40,
            price_per_liter: 5.89,
            current_km: 120000,
            station: "Posto Dedé",
        });

        expect(requireRole).toHaveBeenCalledWith("DRIVER", "ADMIN");
        expect(createFuelingController).toHaveBeenCalled();
        expect(res.status).toBe(201);
        expect(res.body).toEqual({ ok: "create" });
    });

    test("GET /fueling should call getAllFuelingsController", async () => {
        const app = buildApp();

        const res = await request(app).get("/fueling");

        expect(getAllFuelingsController).toHaveBeenCalled();
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ ok: "list" });
    });

    test("GET /fueling/:id should call getFuelingByIdController", async () => {
        const app = buildApp();

        const res = await request(app).get("/fueling/1");

        expect(getFuelingByIdController).toHaveBeenCalled();
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ ok: "getById" });
    });

    test("PUT /fueling/:id should call updateFuelingController", async () => {
        const app = buildApp();

        const res = await request(app).put("/fueling/1").send({
            station: "Novo Posto",
        });

        expect(requireRole).toHaveBeenCalledWith("DRIVER", "ADMIN");
        expect(updateFuelingController).toHaveBeenCalled();
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ ok: "update" });
    });

    test("DELETE /fueling/:id should call deleteFuelingController", async () => {
        const app = buildApp();

        const res = await request(app).delete("/fueling/1");

        expect(deleteFuelingController).toHaveBeenCalled();
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ ok: "delete" });
    });

    test("should block request when requireAuth returns 401", async () => {
        requireAuth.mockImplementation((req, res) =>
            res.status(401).json({ success: false, message: "Unauthorized" })
        );

        const app = buildApp();

        const res = await request(app).get("/fueling");

        expect(getAllFuelingsController).not.toHaveBeenCalled();
        expect(res.status).toBe(401);
        expect(res.body).toEqual({
            success: false,
            message: "Unauthorized",
        });
    });

    test("should block request when requireRole returns 403 on POST", async () => {
        requireRole.mockImplementation(() => (req, res) =>
            res.status(403).json({ success: false, message: "Forbidden" })
        );

        const app = buildApp();

        const res = await request(app).post("/fueling").send({});

        expect(createFuelingController).not.toHaveBeenCalled();
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

        const res = await request(app).put("/fueling/1").send({
            station: "Novo Posto",
        });

        expect(updateFuelingController).not.toHaveBeenCalled();
        expect(res.status).toBe(403);
        expect(res.body).toEqual({
            success: false,
            message: "Forbidden",
        });
    });
});