jest.mock("../../src/services/notifications.service", () => ({
    createNotificationsService: jest.fn(),
    getAllNotificationsService: jest.fn(),
    getNotificationByIdService: jest.fn(),
    updateNotificationService: jest.fn(),
    deleteNotificationService: jest.fn(),
}));

const notificationsService = require("../../src/services/notifications.service");

const {
    createNotificationController,
    getAllNotificationsController,
    getNotificationByIdController,
    updateNotificationController,
    deleteNotificationController,
} = require("../../src/controllers/notifications.controller");

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe("notifications.controller", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("createNotificationController", () => {
        const validBody = {
            title: "Maintenance Reminder",
            type: "maintenance",
            message: "Your vehicle is due for maintenance in 500 km.",
            driver_id: "drv-1",
        };

        test("should return 400 when required fields are missing", async () => {
            const req = {
                body: {
                    title: "Maintenance Reminder",
                },
            };
            const res = mockRes();

            await createNotificationController(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "title, type and message are required",
            });
            expect(notificationsService.createNotificationsService).not.toHaveBeenCalled();
        });

        test("should return 201 when notification is created", async () => {
            const created = { id: "1", ...validBody };
            notificationsService.createNotificationsService.mockResolvedValue(created);

            const req = { body: validBody };
            const res = mockRes();

            await createNotificationController(req, res);

            expect(notificationsService.createNotificationsService).toHaveBeenCalledWith(validBody);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(created);
        });

        test("should return 500 when service throws", async () => {
            notificationsService.createNotificationsService.mockRejectedValue(
                new Error("db error")
            );

            const req = { body: validBody };
            const res = mockRes();

            await createNotificationController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "db error",
            });
        });
    });

    describe("getAllNotificationsController", () => {
        test("should return 200 with notifications list", async () => {
            const result = {
                data: [{ id: "1", title: "Reminder A" }],
                pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
            };

            notificationsService.getAllNotificationsService.mockResolvedValue(result);

            const req = {
                query: {
                    driver_id: "drv-1",
                    admin_id: "adm-1",
                },
            };
            const res = mockRes();

            await getAllNotificationsController(req, res);

            expect(notificationsService.getAllNotificationsService).toHaveBeenCalledWith({
                driver_id: "drv-1",
                admin_id: "adm-1",
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(result);
        });

        test("should return 500 when service throws", async () => {
            notificationsService.getAllNotificationsService.mockRejectedValue(
                new Error("db error")
            );

            const req = { query: {} };
            const res = mockRes();

            await getAllNotificationsController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "db error",
            });
        });
    });

    describe("getNotificationByIdController", () => {
        test("should return 404 when notification is not found", async () => {
            notificationsService.getNotificationByIdService.mockResolvedValue(null);

            const req = { params: { id: "999" } };
            const res = mockRes();

            await getNotificationByIdController(req, res);

            expect(notificationsService.getNotificationByIdService).toHaveBeenCalledWith("999");
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Notification not found",
            });
        });

        test("should return 200 when notification is found", async () => {
            const notification = { id: "1", title: "Reminder A" };
            notificationsService.getNotificationByIdService.mockResolvedValue(notification);

            const req = { params: { id: "1" } };
            const res = mockRes();

            await getNotificationByIdController(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: notification,
            });
        });

        test("should return 500 when service throws", async () => {
            notificationsService.getNotificationByIdService.mockRejectedValue(
                new Error("db error")
            );

            const req = { params: { id: "1" } };
            const res = mockRes();

            await getNotificationByIdController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "db error",
            });
        });
    });

    describe("updateNotificationController", () => {
        test("should return 200 when notification is updated", async () => {
            const updated = { id: "1", title: "Updated reminder" };
            notificationsService.updateNotificationService.mockResolvedValue(updated);

            const req = {
                params: { id: "1" },
                body: { title: "Updated reminder" },
            };
            const res = mockRes();

            await updateNotificationController(req, res);

            expect(notificationsService.updateNotificationService).toHaveBeenCalledWith(
                "1",
                {
                    title: "Updated reminder",
                }
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: updated,
            });
        });

        test("should return 500 when service throws", async () => {
            notificationsService.updateNotificationService.mockRejectedValue(
                new Error("db error")
            );

            const req = {
                params: { id: "1" },
                body: { title: "Updated reminder" },
            };
            const res = mockRes();

            await updateNotificationController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "db error",
            });
        });
    });

    describe("deleteNotificationController", () => {
        test("should return 200 when notification is deleted", async () => {
            notificationsService.deleteNotificationService.mockResolvedValue({
                success: true,
            });

            const req = { params: { id: "1" } };
            const res = mockRes();

            await deleteNotificationController(req, res);

            expect(notificationsService.deleteNotificationService).toHaveBeenCalledWith("1");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: { success: true },
            });
        });

        test("should return 500 when service throws", async () => {
            notificationsService.deleteNotificationService.mockRejectedValue(
                new Error("db error")
            );

            const req = { params: { id: "1" } };
            const res = mockRes();

            await deleteNotificationController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "db error",
            });
        });
    });
});