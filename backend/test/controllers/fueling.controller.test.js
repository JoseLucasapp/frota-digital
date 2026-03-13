jest.mock("../../src/services/fueling.service", () => ({
    createFuelingService: jest.fn(),
    getAllFuelingsService: jest.fn(),
    getFuelingByIdService: jest.fn(),
    updateFuelingService: jest.fn(),
    uploadFuelingReceiptService: jest.fn(),
    deleteFuelingReceiptService: jest.fn(),
    deleteFuelingService: jest.fn(),
}));

const fuelingService = require("../../src/services/fueling.service");

const {
    createFuelingController,
    getAllFuelingsController,
    getFuelingByIdController,
    updateFuelingController,
    uploadFuelingReceiptController,
    deleteFuelingReceiptController,
    deleteFuelingController,
} = require("../../src/controllers/fueling.controller");

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe("fueling.controller", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("createFuelingController", () => {
        const validBody = {
            vehicle_id: "veh-1",
            fuel_type: "Gasolina",
            liters: 40,
            price_per_liter: 5.89,
            current_km: 120000,
            station: "Posto Dedé",
        };

        test("should return 400 when required fields are missing", async () => {
            const req = {
                body: {
                    vehicle_id: "veh-1",
                },
            };
            const res = mockRes();

            await createFuelingController(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message:
                    "vehicle_id, fuel_type, liters, price_per_liter, current_km and station are required",
            });
            expect(fuelingService.createFuelingService).not.toHaveBeenCalled();
        });

        test("should accept zero values for liters, price_per_liter and current_km", async () => {
            const body = {
                vehicle_id: "veh-1",
                fuel_type: "Gasolina",
                liters: 0,
                price_per_liter: 0,
                current_km: 0,
                station: "Posto Zero",
            };

            fuelingService.createFuelingService.mockResolvedValue({
                id: "1",
                ...body,
            });

            const req = { body };
            const res = mockRes();

            await createFuelingController(req, res);

            expect(fuelingService.createFuelingService).toHaveBeenCalledWith(body);
            expect(res.status).toHaveBeenCalledWith(201);
        });

        test("should return 201 when fueling is created", async () => {
            const created = { id: "1", ...validBody };
            fuelingService.createFuelingService.mockResolvedValue(created);

            const req = { body: validBody };
            const res = mockRes();

            await createFuelingController(req, res);

            expect(fuelingService.createFuelingService).toHaveBeenCalledWith(validBody);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(created);
        });

        test("should return 500 when service throws", async () => {
            fuelingService.createFuelingService.mockRejectedValue(new Error("db error"));

            const req = { body: validBody };
            const res = mockRes();

            await createFuelingController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "db error",
            });
        });
    });

    describe("getAllFuelingsController", () => {
        test("should return 200 with fuelings list", async () => {
            const result = {
                data: [{ id: "1", station: "Posto A" }],
                pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
            };

            fuelingService.getAllFuelingsService.mockResolvedValue(result);

            const req = {
                query: {
                    vehicle_id: "veh-1",
                    fuel_type: "Gasolina",
                },
            };
            const res = mockRes();

            await getAllFuelingsController(req, res);

            expect(fuelingService.getAllFuelingsService).toHaveBeenCalledWith({
                vehicle_id: "veh-1",
                fuel_type: "Gasolina",
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(result);
        });

        test("should return 500 when service throws", async () => {
            fuelingService.getAllFuelingsService.mockRejectedValue(new Error("db error"));

            const req = { query: {} };
            const res = mockRes();

            await getAllFuelingsController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "db error",
            });
        });
    });

    describe("getFuelingByIdController", () => {
        test("should return 404 when fueling is not found", async () => {
            fuelingService.getFuelingByIdService.mockResolvedValue(null);

            const req = { params: { id: "999" } };
            const res = mockRes();

            await getFuelingByIdController(req, res);

            expect(fuelingService.getFuelingByIdService).toHaveBeenCalledWith("999");
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Fueling not found",
            });
        });

        test("should return 200 when fueling is found", async () => {
            const fueling = { id: "1", station: "Posto A" };
            fuelingService.getFuelingByIdService.mockResolvedValue(fueling);

            const req = { params: { id: "1" } };
            const res = mockRes();

            await getFuelingByIdController(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: fueling,
            });
        });

        test("should return 500 when service throws", async () => {
            fuelingService.getFuelingByIdService.mockRejectedValue(new Error("db error"));

            const req = { params: { id: "1" } };
            const res = mockRes();

            await getFuelingByIdController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "db error",
            });
        });
    });

    describe("updateFuelingController", () => {
        test("should return 200 when fueling is updated", async () => {
            const updated = { id: "1", station: "Novo Posto" };
            fuelingService.updateFuelingService.mockResolvedValue(updated);

            const req = {
                params: { id: "1" },
                body: { station: "Novo Posto" },
            };
            const res = mockRes();

            await updateFuelingController(req, res);

            expect(fuelingService.updateFuelingService).toHaveBeenCalledWith("1", {
                station: "Novo Posto",
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: updated,
            });
        });

        test("should return 500 when service throws", async () => {
            fuelingService.updateFuelingService.mockRejectedValue(new Error("db error"));

            const req = {
                params: { id: "1" },
                body: { station: "Novo Posto" },
            };
            const res = mockRes();

            await updateFuelingController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "db error",
            });
        });
    });

    describe("uploadFuelingReceiptController", () => {
        test("should return 400 when file is missing", async () => {
            const req = {
                params: { id: "1" },
                file: null,
            };
            const res = mockRes();

            await uploadFuelingReceiptController(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "file is required",
            });
        });

        test("should return 200 when upload succeeds", async () => {
            fuelingService.uploadFuelingReceiptService.mockResolvedValue({
                fueling: { id: "1" },
                file: { publicUrl: "https://file-url.com/receipt.jpg" },
            });

            const req = {
                params: { id: "1" },
                file: { originalname: "receipt.jpg" },
            };
            const res = mockRes();

            await uploadFuelingReceiptController(req, res);

            expect(fuelingService.uploadFuelingReceiptService).toHaveBeenCalledWith({
                fuelingId: "1",
                file: req.file,
            });

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Receipt uploaded successfully",
                data: {
                    fueling: { id: "1" },
                    file: { publicUrl: "https://file-url.com/receipt.jpg" },
                },
            });
        });

        test("should return 404 when fueling is not found", async () => {
            fuelingService.uploadFuelingReceiptService.mockRejectedValue(
                new Error("Fueling not found")
            );

            const req = {
                params: { id: "1" },
                file: { originalname: "receipt.jpg" },
            };
            const res = mockRes();

            await uploadFuelingReceiptController(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Fueling not found",
            });
        });

        test("should return 500 when upload service throws generic error", async () => {
            fuelingService.uploadFuelingReceiptService.mockRejectedValue(
                new Error("upload failed")
            );

            const req = {
                params: { id: "1" },
                file: { originalname: "receipt.jpg" },
            };
            const res = mockRes();

            await uploadFuelingReceiptController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "upload failed",
            });
        });
    });

    describe("deleteFuelingReceiptController", () => {
        test("should return 200 when delete succeeds", async () => {
            fuelingService.deleteFuelingReceiptService.mockResolvedValue({
                fueling: { id: "1" },
            });

            const req = {
                params: { id: "1" },
            };
            const res = mockRes();

            await deleteFuelingReceiptController(req, res);

            expect(fuelingService.deleteFuelingReceiptService).toHaveBeenCalledWith("1");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Receipt deleted successfully",
                data: {
                    fueling: { id: "1" },
                },
            });
        });

        test("should return 404 when receipt is not found", async () => {
            fuelingService.deleteFuelingReceiptService.mockRejectedValue(
                new Error("receipt not found")
            );

            const req = {
                params: { id: "1" },
            };
            const res = mockRes();

            await deleteFuelingReceiptController(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "receipt not found",
            });
        });

        test("should return 404 when fueling is not found", async () => {
            fuelingService.deleteFuelingReceiptService.mockRejectedValue(
                new Error("Fueling not found")
            );

            const req = {
                params: { id: "1" },
            };
            const res = mockRes();

            await deleteFuelingReceiptController(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Fueling not found",
            });
        });

        test("should return 500 when delete receipt service throws generic error", async () => {
            fuelingService.deleteFuelingReceiptService.mockRejectedValue(
                new Error("delete receipt failed")
            );

            const req = {
                params: { id: "1" },
            };
            const res = mockRes();

            await deleteFuelingReceiptController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "delete receipt failed",
            });
        });
    });

    describe("deleteFuelingController", () => {
        test("should return 200 when fueling is deleted", async () => {
            fuelingService.deleteFuelingService.mockResolvedValue({ success: true });

            const req = { params: { id: "1" } };
            const res = mockRes();

            await deleteFuelingController(req, res);

            expect(fuelingService.deleteFuelingService).toHaveBeenCalledWith("1");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: { success: true },
            });
        });

        test("should return 500 when service throws", async () => {
            fuelingService.deleteFuelingService.mockRejectedValue(new Error("db error"));

            const req = { params: { id: "1" } };
            const res = mockRes();

            await deleteFuelingController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "db error",
            });
        });
    });
});