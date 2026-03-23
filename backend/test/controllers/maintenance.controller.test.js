jest.mock("../../src/services/maintenance.service", () => ({
    createMaintenancesService: jest.fn(),
    getAllMaintenancesService: jest.fn(),
    getMaintenancesByIdService: jest.fn(),
    updateMaintenancesService: jest.fn(),
    uploadMaintenancesReceiptService: jest.fn(),
    deleteMaintenanceReceiptService: jest.fn(),
    deleteMaintenanceService: jest.fn(),
}));

const maintenancesService = require("../../src/services/maintenance.service");

const {
    createMaintenancesController,
    getAllMaintenancesController,
    getMaintenancesByIdController,
    updateMaintenancesController,
    uploadMaintenancesReceiptController,
    deleteMaintenanceReceiptController,
    deleteMaintenanceController,
} = require("../../src/controllers/maintenance.controller");

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe("maintenances.controller", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("createMaintenancesController", () => {
        const validBody = {
            vehicle_id: "veh-1",
            type: "Oil change",
            status: "PENDING",
            description: "Need oil replacement",
            mechanic_id: "mech-1",
        };

        test("should return 400 when required fields are missing", async () => {
            const req = {
                body: {
                    vehicle_id: "veh-1",
                },
            };
            const res = mockRes();

            await createMaintenancesController(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "vehicle_id, type, status and description are required",
            });
            expect(maintenancesService.createMaintenancesService).not.toHaveBeenCalled();
        });

        test("should return 201 when maintenance is created", async () => {
            const created = { id: "1", ...validBody };
            maintenancesService.createMaintenancesService.mockResolvedValue(created);

            const req = { body: validBody };
            const res = mockRes();

            await createMaintenancesController(req, res);

            expect(maintenancesService.createMaintenancesService).toHaveBeenCalledWith(validBody);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(created);
        });

        test("should return 500 when service throws", async () => {
            maintenancesService.createMaintenancesService.mockRejectedValue(
                new Error("db error")
            );

            const req = { body: validBody };
            const res = mockRes();

            await createMaintenancesController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "db error",
            });
        });
    });

    describe("getAllMaintenancesController", () => {
        test("should return 200 with maintenances list", async () => {
            const result = {
                data: [{ id: "1", type: "Oil change" }],
                pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
            };

            maintenancesService.getAllMaintenancesService.mockResolvedValue(result);

            const req = {
                query: {
                    vehicle_id: "veh-1",
                    mechanic_id: "mech-1",
                    status: "PENDING",
                },
            };
            const res = mockRes();

            await getAllMaintenancesController(req, res);

            expect(maintenancesService.getAllMaintenancesService).toHaveBeenCalledWith({
                vehicle_id: "veh-1",
                mechanic_id: "mech-1",
                status: "PENDING",
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(result);
        });

        test("should return 500 when service throws", async () => {
            maintenancesService.getAllMaintenancesService.mockRejectedValue(
                new Error("db error")
            );

            const req = { query: {} };
            const res = mockRes();

            await getAllMaintenancesController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "db error",
            });
        });
    });

    describe("getMaintenancesByIdController", () => {
        test("should return 404 when maintenance is not found", async () => {
            maintenancesService.getMaintenancesByIdService.mockResolvedValue(null);

            const req = { params: { id: "999" } };
            const res = mockRes();

            await getMaintenancesByIdController(req, res);

            expect(maintenancesService.getMaintenancesByIdService).toHaveBeenCalledWith("999");
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Maintenance not found",
            });
        });

        test("should return 200 when maintenance is found", async () => {
            const maintenance = { id: "1", type: "Oil change" };
            maintenancesService.getMaintenancesByIdService.mockResolvedValue(maintenance);

            const req = { params: { id: "1" } };
            const res = mockRes();

            await getMaintenancesByIdController(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: maintenance,
            });
        });

        test("should return 500 when service throws", async () => {
            maintenancesService.getMaintenancesByIdService.mockRejectedValue(
                new Error("db error")
            );

            const req = { params: { id: "1" } };
            const res = mockRes();

            await getMaintenancesByIdController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "db error",
            });
        });
    });

    describe("updateMaintenancesController", () => {
        test("should return 200 when maintenance is updated", async () => {
            const updated = { id: "1", status: "DONE" };
            maintenancesService.updateMaintenancesService.mockResolvedValue(updated);

            const req = {
                params: { id: "1" },
                body: { status: "DONE" },
            };
            const res = mockRes();

            await updateMaintenancesController(req, res);

            expect(maintenancesService.updateMaintenancesService).toHaveBeenCalledWith("1", {
                status: "DONE",
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: updated,
            });
        });

        test("should return 500 when service throws", async () => {
            maintenancesService.updateMaintenancesService.mockRejectedValue(
                new Error("db error")
            );

            const req = {
                params: { id: "1" },
                body: { status: "DONE" },
            };
            const res = mockRes();

            await updateMaintenancesController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "db error",
            });
        });
    });

    describe("uploadMaintenancesReceiptController", () => {
        test("should return 400 when file is missing", async () => {
            const req = {
                params: { id: "1" },
                file: null,
            };
            const res = mockRes();

            await uploadMaintenancesReceiptController(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "file is required",
            });
        });

        test("should return 200 when upload succeeds", async () => {
            maintenancesService.uploadMaintenancesReceiptService.mockResolvedValue({
                maintenance: { id: "1" },
                file: { publicUrl: "https://file-url.com/receipt.jpg" },
            });

            const req = {
                params: { id: "1" },
                file: { originalname: "receipt.jpg" },
            };
            const res = mockRes();

            await uploadMaintenancesReceiptController(req, res);

            expect(maintenancesService.uploadMaintenancesReceiptService).toHaveBeenCalledWith({
                maintenanceId: "1",
                file: req.file,
            });

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Receipt uploaded successfully",
                data: {
                    maintenance: { id: "1" },
                    file: { publicUrl: "https://file-url.com/receipt.jpg" },
                },
            });
        });

        test("should return 404 when maintenance is not found", async () => {
            maintenancesService.uploadMaintenancesReceiptService.mockRejectedValue(
                new Error("Maintenance not found")
            );

            const req = {
                params: { id: "1" },
                file: { originalname: "receipt.jpg" },
            };
            const res = mockRes();

            await uploadMaintenancesReceiptController(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Maintenance not found",
            });
        });

        test("should return 500 when upload service throws generic error", async () => {
            maintenancesService.uploadMaintenancesReceiptService.mockRejectedValue(
                new Error("upload failed")
            );

            const req = {
                params: { id: "1" },
                file: { originalname: "receipt.jpg" },
            };
            const res = mockRes();

            await uploadMaintenancesReceiptController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "upload failed",
            });
        });
    });

    describe("deleteMaintenanceReceiptController", () => {
        test("should return 200 when delete succeeds", async () => {
            maintenancesService.deleteMaintenanceReceiptService.mockResolvedValue({
                maintenance: { id: "1" },
            });

            const req = {
                params: { id: "1" },
            };
            const res = mockRes();

            await deleteMaintenanceReceiptController(req, res);

            expect(maintenancesService.deleteMaintenanceReceiptService).toHaveBeenCalledWith("1");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Receipt deleted successfully",
                data: {
                    maintenance: { id: "1" },
                },
            });
        });

        test("should return 404 when receipt is not found", async () => {
            maintenancesService.deleteMaintenanceReceiptService.mockRejectedValue(
                new Error("receipt not found")
            );

            const req = {
                params: { id: "1" },
            };
            const res = mockRes();

            await deleteMaintenanceReceiptController(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "receipt not found",
            });
        });

        test("should return 404 when maintenance is not found", async () => {
            maintenancesService.deleteMaintenanceReceiptService.mockRejectedValue(
                new Error("Maintenance not found")
            );

            const req = {
                params: { id: "1" },
            };
            const res = mockRes();

            await deleteMaintenanceReceiptController(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Maintenance not found",
            });
        });

        test("should return 500 when delete receipt service throws generic error", async () => {
            maintenancesService.deleteMaintenanceReceiptService.mockRejectedValue(
                new Error("delete receipt failed")
            );

            const req = {
                params: { id: "1" },
            };
            const res = mockRes();

            await deleteMaintenanceReceiptController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "delete receipt failed",
            });
        });
    });

    describe("deleteMaintenanceController", () => {
        test("should return 200 when maintenance is deleted", async () => {
            maintenancesService.deleteMaintenanceService.mockResolvedValue({ success: true });

            const req = { params: { id: "1" } };
            const res = mockRes();

            await deleteMaintenanceController(req, res);

            expect(maintenancesService.deleteMaintenanceService).toHaveBeenCalledWith("1");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: { success: true },
            });
        });

        test("should return 500 when service throws", async () => {
            maintenancesService.deleteMaintenanceService.mockRejectedValue(
                new Error("db error")
            );

            const req = { params: { id: "1" } };
            const res = mockRes();

            await deleteMaintenanceController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "db error",
            });
        });
    });
});