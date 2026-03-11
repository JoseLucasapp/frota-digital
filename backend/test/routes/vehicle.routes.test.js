const express = require("express");
const request = require("supertest");

const {
    createVehicleController,
    getAllVehiclesController,
    getVehicleByIdController,
    updateVehicleController,
    deleteVehicleController,
} = require("../../src/controllers/vehicle.controller");

const { requireAuth } = require("../../src/utils/jwt");
const { attachUser } = require("../../src/middlewares/attachUser.middleware");
const { requireRole } = require("../../src/security/role.guard");

jest.mock("../../src/controllers/vehicle.controller", () => ({
    createVehicleController: jest.fn(),
    getAllVehiclesController: jest.fn(),
    getVehicleByIdController: jest.fn(),
    updateVehicleController: jest.fn(),
    deleteVehicleController: jest.fn(),
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
    const registerRoutes = require("../../src/routes/vehicle.routes");
    registerRoutes(router);

    app.use(router);
    return app;
};

describe("vehicle.routes", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        requireAuth.mockImplementation((req, res, next) => next());
        attachUser.mockImplementation((req, res, next) => next());
        requireRole.mockImplementation(() => (req, res, next) => next());

        createVehicleController.mockImplementation((req, res) =>
            res.status(201).json({ ok: "create" })
        );
        getAllVehiclesController.mockImplementation((req, res) =>
            res.status(200).json({ ok: "list" })
        );
        getVehicleByIdController.mockImplementation((req, res) =>
            res.status(200).json({ ok: "getById" })
        );
        updateVehicleController.mockImplementation((req, res) =>
            res.status(200).json({ ok: "update" })
        );
        deleteVehicleController.mockImplementation((req, res) =>
            res.status(200).json({ ok: "delete" })
        );
    });

    it("POST /vehicle should call createVehicleController", async () => {
        const app = buildApp();

        const res = await request(app).post("/vehicle").send({
            plate: "ABC1234",
            make: "Toyota",
            model: "Corolla",
            year: "2022",
            fuel_type: "Gasoline",
            current_km: 10000,
            status: "active",
        });

        expect(requireRole).toHaveBeenCalledWith("ADMIN");
        expect(createVehicleController).toHaveBeenCalled();
        expect(res.status).toBe(201);
    });

    it("GET /vehicle should call getAllVehiclesController", async () => {
        const app = buildApp();

        const res = await request(app).get("/vehicle");

        expect(getAllVehiclesController).toHaveBeenCalled();
        expect(res.status).toBe(200);
    });

    it("GET /vehicle/:id should call getVehicleByIdController", async () => {
        const app = buildApp();

        const res = await request(app).get("/vehicle/1");

        expect(getVehicleByIdController).toHaveBeenCalled();
        expect(res.status).toBe(200);
    });

    it("PUT /vehicle/:id should call updateVehicleController", async () => {
        const app = buildApp();

        const res = await request(app).put("/vehicle/1").send({
            status: "inactive",
        });

        expect(requireRole).toHaveBeenCalledWith("ADMIN");
        expect(updateVehicleController).toHaveBeenCalled();
        expect(res.status).toBe(200);
    });

    it("DELETE /vehicle/:id should call deleteVehicleController", async () => {
        const app = buildApp();

        const res = await request(app).delete("/vehicle/1");

        expect(deleteVehicleController).toHaveBeenCalled();
        expect(res.status).toBe(200);
    });

    it("should block request when requireAuth returns 401", async () => {
        requireAuth.mockImplementation((req, res) =>
            res.status(401).json({ success: false, message: "Unauthorized" })
        );

        const app = buildApp();

        const res = await request(app).get("/vehicle");

        expect(getAllVehiclesController).not.toHaveBeenCalled();
        expect(res.status).toBe(401);
        expect(res.body).toEqual({
            success: false,
            message: "Unauthorized",
        });
    });

    it("should block request when requireRole returns 403", async () => {
        requireRole.mockImplementation(() => (req, res) =>
            res.status(403).json({ success: false, message: "Forbidden" })
        );

        const app = buildApp();

        const res = await request(app).post("/vehicle").send({});

        expect(createVehicleController).not.toHaveBeenCalled();
        expect(res.status).toBe(403);
        expect(res.body).toEqual({
            success: false,
            message: "Forbidden",
        });
    });
});