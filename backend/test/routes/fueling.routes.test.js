const express = require("express");
const request = require("supertest");

jest.mock("../../src/controllers/fueling.controller", () => ({
    createFuelingController: jest.fn((req, res) =>
        res.status(201).json({ ok: "create" })
    ),
    getAllFuelingsController: jest.fn((req, res) =>
        res.status(200).json({ ok: "list" })
    ),
    getFuelingByIdController: jest.fn((req, res) =>
        res.status(200).json({ ok: "getById" })
    ),
    updateFuelingController: jest.fn((req, res) =>
        res.status(200).json({ ok: "update" })
    ),
    uploadFuelingReceiptController: jest.fn((req, res) =>
        res.status(200).json({ ok: "uploadReceipt" })
    ),
    deleteFuelingReceiptController: jest.fn((req, res) =>
        res.status(200).json({ ok: "deleteReceipt" })
    ),
    deleteFuelingController: jest.fn((req, res) =>
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
    createFuelingController,
    getAllFuelingsController,
    getFuelingByIdController,
    updateFuelingController,
    uploadFuelingReceiptController,
    deleteFuelingReceiptController,
    deleteFuelingController,
} = require("../../src/controllers/fueling.controller");

const { requireRole } = require("../../src/security/role.guard");
const { requireAuth } = require("../../src/utils/jwt");

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

    test("POST /fueling/:id/receipt should call uploadFuelingReceiptController", async () => {
        const app = buildApp();

        const res = await request(app)
            .post("/fueling/1/receipt")
            .attach("file", Buffer.from("fake-file"), "receipt.jpg");

        expect(requireRole).toHaveBeenCalledWith("DRIVER", "ADMIN");
        expect(uploadFuelingReceiptController).toHaveBeenCalled();
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ ok: "uploadReceipt" });
    });

    test("DELETE /fueling/:id/receipt should call deleteFuelingReceiptController", async () => {
        const app = buildApp();

        const res = await request(app).delete("/fueling/1/receipt");

        expect(requireRole).toHaveBeenCalledWith("DRIVER", "ADMIN");
        expect(deleteFuelingReceiptController).toHaveBeenCalled();
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ ok: "deleteReceipt" });
    });

    test("DELETE /fueling/:id should call deleteFuelingController", async () => {
        const app = buildApp();

        const res = await request(app).delete("/fueling/1");

        expect(deleteFuelingController).toHaveBeenCalled();
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ ok: "delete" });
    });

    test("should block request when requireAuth returns 401", async () => {
        requireAuth.mockImplementationOnce((req, res) =>
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





});