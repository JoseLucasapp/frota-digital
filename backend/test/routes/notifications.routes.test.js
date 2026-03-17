const express = require("express");
const request = require("supertest");

jest.mock("../../src/controllers/notifications.controller", () => ({
    createNotificationController: jest.fn((req, res) =>
        res.status(201).json({ ok: "create" })
    ),
    getAllNotificationsController: jest.fn((req, res) =>
        res.status(200).json({ ok: "list" })
    ),
    getNotificationByIdController: jest.fn((req, res) =>
        res.status(200).json({ ok: "getById" })
    ),
    updateNotificationController: jest.fn((req, res) =>
        res.status(200).json({ ok: "update" })
    ),
    deleteNotificationController: jest.fn((req, res) =>
        res.status(200).json({ ok: "delete" })
    ),
}));

jest.mock("../../src/utils/jwt", () => ({
    requireAuth: jest.fn((req, res, next) => next()),
}));

jest.mock("../../src/middlewares/attachUser.middleware", () => ({
    attachUser: jest.fn((req, res, next) => next()),
}));

const {
    createNotificationController,
    getAllNotificationsController,
    getNotificationByIdController,
    updateNotificationController,
    deleteNotificationController,
} = require("../../src/controllers/notifications.controller");

const { requireAuth } = require("../../src/utils/jwt");

const buildApp = () => {
    const app = express();
    app.use(express.json());

    const router = express.Router();
    const registerRoutes = require("../../src/routes/notifications.routes");
    registerRoutes(router);

    app.use(router);
    return app;
};

describe("notifications.routes", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("POST /notifications should call createNotificationController", async () => {
        const app = buildApp();

        const res = await request(app).post("/notifications").send({
            title: "Maintenance Reminder",
            type: "maintenance",
            message: "Your vehicle is due for maintenance in 500 km.",
            driver_id: "drv-1",
        });

        expect(createNotificationController).toHaveBeenCalled();
        expect(res.status).toBe(201);
        expect(res.body).toEqual({ ok: "create" });
    });

    test("GET /notifications should call getAllNotificationsController", async () => {
        const app = buildApp();

        const res = await request(app).get("/notifications");

        expect(getAllNotificationsController).toHaveBeenCalled();
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ ok: "list" });
    });

    test("GET /notifications/:id should call getNotificationByIdController", async () => {
        const app = buildApp();

        const res = await request(app).get("/notifications/1");

        expect(getNotificationByIdController).toHaveBeenCalled();
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ ok: "getById" });
    });

    test("PUT /notifications/:id should call updateNotificationController", async () => {
        const app = buildApp();

        const res = await request(app).put("/notifications/1").send({
            title: "Updated reminder",
        });

        expect(updateNotificationController).toHaveBeenCalled();
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ ok: "update" });
    });

    test("DELETE /notifications/:id should call deleteNotificationController", async () => {
        const app = buildApp();

        const res = await request(app).delete("/notifications/1");

        expect(deleteNotificationController).toHaveBeenCalled();
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ ok: "delete" });
    });

    test("should block request when requireAuth returns 401", async () => {
        requireAuth.mockImplementationOnce((req, res) =>
            res.status(401).json({ success: false, message: "Unauthorized" })
        );

        const app = buildApp();

        const res = await request(app).get("/notifications");

        expect(getAllNotificationsController).not.toHaveBeenCalled();
        expect(res.status).toBe(401);
        expect(res.body).toEqual({
            success: false,
            message: "Unauthorized",
        });
    });
});