const express = require("express");
const request = require("supertest");

jest.mock("../../src/controllers/maintenance.controller", () => ({
    createMaintenancesController: jest.fn((req, res) =>
        res.status(201).json({ ok: "create" })
    ),
    getAllMaintenancesController: jest.fn((req, res) =>
        res.status(200).json({ ok: "list" })
    ),
    getMaintenancesByIdController: jest.fn((req, res) =>
        res.status(200).json({ ok: "getById" })
    ),
    updateMaintenancesController: jest.fn((req, res) =>
        res.status(200).json({ ok: "update" })
    ),
    uploadMaintenancesReceiptController: jest.fn((req, res) =>
        res.status(200).json({ ok: "uploadReceipt" })
    ),
    deleteMaintenanceReceiptController: jest.fn((req, res) =>
        res.status(200).json({ ok: "deleteReceipt" })
    ),
    deleteMaintenanceController: jest.fn((req, res) =>
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

jest.mock("../../src/middlewares/multer", () => ({
    single: jest.fn(() => (req, res, next) => {
        req.file = { originalname: "receipt.jpg" };
        next();
    }),
}));

const {
    createMaintenancesController,
    getAllMaintenancesController,
    getMaintenancesByIdController,
    updateMaintenancesController,
    uploadMaintenancesReceiptController,
    deleteMaintenanceReceiptController,
    deleteMaintenanceController,
} = require("../../src/controllers/maintenance.controller");

const { requireRole } = require("../../src/security/role.guard");
const { requireAuth } = require("../../src/utils/jwt");

const buildApp = () => {
    const app = express();
    app.use(express.json());

    const router = express.Router();
    const registerRoutes = require("../../src/routes/maintenance.routes");
    registerRoutes(router);

    app.use(router);
    return app;
};

describe("maintenances.routes", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("POST /maintenances should call createMaintenancesController", async () => {
        const app = buildApp();

        const res = await request(app).post("/maintenances").send({
            vehicle_id: "veh-1",
            type: "Oil change",
            status: "PENDING",
            description: "Need oil replacement",
            mechanic_id: "mech-1",
            priority: "HIGH",
            estimated_cost: 250.5,
        });

        expect(requireRole).toHaveBeenCalledWith("ADMIN", "MECHANIC");
        expect(createMaintenancesController).toHaveBeenCalled();
        expect(res.status).toBe(201);
        expect(res.body).toEqual({ ok: "create" });
    });

    test("GET /maintenances should call getAllMaintenancesController", async () => {
        const app = buildApp();

        const res = await request(app).get("/maintenances");

        expect(getAllMaintenancesController).toHaveBeenCalled();
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ ok: "list" });
    });

    test("GET /maintenances/:id should call getMaintenancesByIdController", async () => {
        const app = buildApp();

        const res = await request(app).get("/maintenances/1");

        expect(getMaintenancesByIdController).toHaveBeenCalled();
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ ok: "getById" });
    });

    test("PUT /maintenances/:id should call updateMaintenancesController", async () => {
        const app = buildApp();

        const res = await request(app).put("/maintenances/1").send({
            status: "DONE",
        });

        expect(requireRole).toHaveBeenCalledWith("ADMIN", "MECHANIC");
        expect(updateMaintenancesController).toHaveBeenCalled();
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ ok: "update" });
    });

    test("POST /maintenances/:id/receipt should call uploadMaintenancesReceiptController", async () => {
        const app = buildApp();

        const res = await request(app)
            .post("/maintenances/1/receipt")
            .attach("file", Buffer.from("fake-file"), "receipt.jpg");

        expect(requireRole).toHaveBeenCalledWith("ADMIN", "MECHANIC");
        expect(uploadMaintenancesReceiptController).toHaveBeenCalled();
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ ok: "uploadReceipt" });
    });

    test("DELETE /maintenances/:id/receipt should call deleteMaintenanceReceiptController", async () => {
        const app = buildApp();

        const res = await request(app).delete("/maintenances/1/receipt");

        expect(requireRole).toHaveBeenCalledWith("ADMIN", "MECHANIC");
        expect(deleteMaintenanceReceiptController).toHaveBeenCalled();
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ ok: "deleteReceipt" });
    });

    test("DELETE /maintenances/:id should call deleteMaintenanceController", async () => {
        const app = buildApp();

        const res = await request(app).delete("/maintenances/1");

        expect(requireRole).toHaveBeenCalledWith("ADMIN", "MECHANIC");
        expect(deleteMaintenanceController).toHaveBeenCalled();
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ ok: "delete" });
    });

    test("should block request when requireAuth returns 401", async () => {
        requireAuth.mockImplementationOnce((req, res) =>
            res.status(401).json({ success: false, message: "Unauthorized" })
        );

        const app = buildApp();

        const res = await request(app).get("/maintenances");

        expect(getAllMaintenancesController).not.toHaveBeenCalled();
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

        const res = await request(app).post("/maintenances").send({});

        expect(createMaintenancesController).not.toHaveBeenCalled();
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

        const res = await request(app).put("/maintenances/1").send({
            status: "DONE",
        });

        expect(updateMaintenancesController).not.toHaveBeenCalled();
        expect(res.status).toBe(403);
        expect(res.body).toEqual({
            success: false,
            message: "Forbidden",
        });
    });

    test("should block request when requireRole returns 403 on receipt upload", async () => {
        requireRole.mockImplementation(() => (req, res) =>
            res.status(403).json({ success: false, message: "Forbidden" })
        );

        const app = buildApp();

        const res = await request(app)
            .post("/maintenances/1/receipt")
            .attach("file", Buffer.from("fake-file"), "receipt.jpg");

        expect(uploadMaintenancesReceiptController).not.toHaveBeenCalled();
        expect(res.status).toBe(403);
        expect(res.body).toEqual({
            success: false,
            message: "Forbidden",
        });
    });

    test("should block request when requireRole returns 403 on receipt delete", async () => {
        requireRole.mockImplementation(() => (req, res) =>
            res.status(403).json({ success: false, message: "Forbidden" })
        );

        const app = buildApp();

        const res = await request(app).delete("/maintenances/1/receipt");

        expect(deleteMaintenanceReceiptController).not.toHaveBeenCalled();
        expect(res.status).toBe(403);
        expect(res.body).toEqual({
            success: false,
            message: "Forbidden",
        });
    });

    test("should block request when requireRole returns 403 on delete maintenance", async () => {
        requireRole.mockImplementation(() => (req, res) =>
            res.status(403).json({ success: false, message: "Forbidden" })
        );

        const app = buildApp();

        const res = await request(app).delete("/maintenances/1");

        expect(deleteMaintenanceController).not.toHaveBeenCalled();
        expect(res.status).toBe(403);
        expect(res.body).toEqual({
            success: false,
            message: "Forbidden",
        });
    });
});