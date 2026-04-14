const request = require("supertest");
const express = require("express");

jest.mock("../../src/controllers/mechanic.controller", () => ({
    createMechanicController: jest.fn((req, res) =>
        res.status(201).json({ ok: true, route: "create" })
    ),
    getAllMechanicsController: jest.fn((req, res) =>
        res.status(200).json({ ok: true, route: "list" })
    ),
    getMechanicByIdController: jest.fn((req, res) =>
        res.status(200).json({ ok: true, route: "getById" })
    ),
    updateMechanicController: jest.fn((req, res) =>
        res.status(200).json({ ok: true, route: "update" })
    ),
    uploadMechanicDocumentController: jest.fn((req, res) =>
        res.status(200).json({ ok: true, route: "uploadDocument" })
    ),
    deleteMechanicDocumentController: jest.fn((req, res) =>
        res.status(200).json({ ok: true, route: "deleteDocument" })
    ),
    deleteMechanicController: jest.fn((req, res) =>
        res.status(200).json({ ok: true, route: "delete" })
    ),
}));

jest.mock("../../src/middlewares/attachUser.middleware", () => ({
    attachUser: jest.fn((req, res, next) => next()),
}));

jest.mock("../../src/security/role.guard", () => ({
    requireRole: jest.fn(() => (req, res, next) => next()),
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

const mechanicRoutes = require("../../src/routes/mechanic.routes");
const {
    createMechanicController,
    getAllMechanicsController,
    getMechanicByIdController,
    updateMechanicController,
    uploadMechanicDocumentController,
    deleteMechanicDocumentController,
    deleteMechanicController,
} = require("../../src/controllers/mechanic.controller");

describe("mechanic.routes", () => {
    let app;

    beforeEach(() => {
        jest.clearAllMocks();
        app = express();
        app.use(express.json());

        const router = express.Router();
        mechanicRoutes(router);
        app.use(router);
    });

    it("POST /mechanic should call create controller", async () => {
        const res = await request(app).post("/mechanic").send({
            name: "José",
            email: "jose@email.com",
            phone: "83999999999",
            cnpj: "123",
        });

        expect(res.status).toBe(201);
        expect(createMechanicController).toHaveBeenCalled();
    });

    it("GET /mechanic should call list controller", async () => {
        const res = await request(app).get("/mechanic");

        expect(res.status).toBe(200);
        expect(getAllMechanicsController).toHaveBeenCalled();
    });

    it("GET /mechanic/:id should call get by id controller", async () => {
        const res = await request(app).get("/mechanic/1");

        expect(res.status).toBe(200);
        expect(getMechanicByIdController).toHaveBeenCalled();
    });

    it("PUT /mechanic/:id should call update controller", async () => {
        const res = await request(app).put("/mechanic/1").send({ name: "Novo" });

        expect(res.status).toBe(200);
        expect(updateMechanicController).toHaveBeenCalled();
    });

    it("POST /mechanic/:id/document/:documentType should call upload document controller", async () => {
        const res = await request(app)
            .post("/mechanic/1/document/cnpj")
            .attach("file", Buffer.from("fake file"), "cnpj.pdf");

        expect(res.status).toBe(200);
        expect(uploadMechanicDocumentController).toHaveBeenCalled();
    });

    it("DELETE /mechanic/:id/document/:documentType should call delete document controller", async () => {
        const res = await request(app).delete("/mechanic/1/document/cnpj");

        expect(res.status).toBe(200);
        expect(deleteMechanicDocumentController).toHaveBeenCalled();
    });

    it("DELETE /mechanic/:id should call delete controller", async () => {
        const res = await request(app).delete("/mechanic/1");

        expect(res.status).toBe(200);
        expect(deleteMechanicController).toHaveBeenCalled();
    });
});