const request = require("supertest");
const express = require("express");

jest.mock("../../src/controllers/driver.controller", () => ({
    createDriverController: jest.fn((req, res) =>
        res.status(201).json({ ok: true, route: "create" })
    ),
    getAllDriversController: jest.fn((req, res) =>
        res.status(200).json({ ok: true, route: "list" })
    ),
    getDriverByIdController: jest.fn((req, res) =>
        res.status(200).json({ ok: true, route: "getById" })
    ),
    updateDriverController: jest.fn((req, res) =>
        res.status(200).json({ ok: true, route: "update" })
    ),
    uploadDriverDocumentController: jest.fn((req, res) =>
        res.status(200).json({ ok: true, route: "uploadDocument" })
    ),
    deleteDriverDocumentController: jest.fn((req, res) =>
        res.status(200).json({ ok: true, route: "deleteDocument" })
    ),
    deleteDriverController: jest.fn((req, res) =>
        res.status(200).json({ ok: true, route: "delete" })
    ),
}));

jest.mock("../../src/middlewares/attachUser.middleware", () => ({
    attachUser: jest.fn((req, res, next) => next()),
}));

jest.mock("../../src/utils/jwt", () => ({
    requireAuth: jest.fn((req, res, next) => next()),
}));

jest.mock("../../src/middlewares/multer", () => ({
    single: jest.fn(() => (req, res, next) => {
        req.file = { originalname: "test.pdf" };
        next();
    }),
}));

const driverRoutes = require("../../src/routes/driver.routes");
const {
    createDriverController,
    getAllDriversController,
    getDriverByIdController,
    updateDriverController,
    uploadDriverDocumentController,
    deleteDriverController,
    deleteDriverDocumentController,
} = require("../../src/controllers/driver.controller");

describe("driver.routes", () => {
    let app;

    beforeEach(() => {
        jest.clearAllMocks();
        app = express();
        app.use(express.json());

        const router = express.Router();
        driverRoutes(router);
        app.use(router);
    });

    test("POST /driver should call create controller", async () => {
        const res = await request(app).post("/driver").send({
            name: "José",
            email: "driver@email.com",
            phone: "83999999999",
            cpf: "123",
        });

        expect(res.status).toBe(201);
        expect(res.body).toEqual({ ok: true, route: "create" });
        expect(createDriverController).toHaveBeenCalled();
    });

    test("GET /driver should call list controller", async () => {
        const res = await request(app).get("/driver");

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ ok: true, route: "list" });
        expect(getAllDriversController).toHaveBeenCalled();
    });

    test("GET /driver/:id should call get by id controller", async () => {
        const res = await request(app).get("/driver/1");

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ ok: true, route: "getById" });
        expect(getDriverByIdController).toHaveBeenCalled();
    });

    test("PUT /driver/:id should call update controller", async () => {
        const res = await request(app).put("/driver/1").send({ name: "Novo" });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ ok: true, route: "update" });
        expect(updateDriverController).toHaveBeenCalled();
    });

    test("POST /driver/:id/document/:documentType should call upload document controller", async () => {
        const res = await request(app)
            .post("/driver/1/document/cpf")
            .attach("file", Buffer.from("fake file"), "cpf.pdf");

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ ok: true, route: "uploadDocument" });
        expect(uploadDriverDocumentController).toHaveBeenCalled();
    });

    test("DELETE /driver/:id/document/:documentType should call delete document service", async () => {
        const res = await request(app).delete("/driver/1/document/cpf");

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ ok: true, route: "deleteDocument" });
        expect(deleteDriverDocumentController).toHaveBeenCalled();
    });

    test("DELETE /driver/:id should call delete controller", async () => {
        const res = await request(app).delete("/driver/1");

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ ok: true, route: "delete" });
        expect(deleteDriverController).toHaveBeenCalled();
    });
});