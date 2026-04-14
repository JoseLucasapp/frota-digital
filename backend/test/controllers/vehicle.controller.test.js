const {
    createVehicleController,
    getAllVehiclesController,
    getVehicleByIdController,
    updateVehicleController,
    deleteVehicleController,
} = require("../../src/controllers/vehicle.controller");

const vehicleService = require("../../src/services/vehicle.service");

jest.mock("../../src/services/vehicle.service", () => ({
    createVehicleService: jest.fn(),
    getAllVehiclesService: jest.fn(),
    getVehicleByIdService: jest.fn(),
    updateVehicleService: jest.fn(),
    deleteVehicleService: jest.fn(),
}));

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe("vehicle.controller", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("createVehicleController", () => {
        const validBody = {
            plate: "ABC1234",
            make: "Toyota",
            model: "Corolla",
            year: "2022",
            fuel_type: "Gasoline",
            current_km: 10000,
            status: "active",
        };

        it("should return 400 when required fields are missing", async () => {
            const req = { body: { plate: "ABC1234" } };
            const res = mockRes();

            await createVehicleController(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(vehicleService.createVehicleService).not.toHaveBeenCalled();
        });

        it("should return 201 when vehicle is created", async () => {
            const created = { id: "1", ...validBody };
            vehicleService.createVehicleService.mockResolvedValue(created);

            const req = { body: validBody };
            const res = mockRes();

            await createVehicleController(req, res);

            expect(vehicleService.createVehicleService).toHaveBeenCalledWith(validBody);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(created);
        });

        it("should return 500 when service throws", async () => {
            vehicleService.createVehicleService.mockRejectedValue(new Error("db error"));

            const req = { body: validBody };
            const res = mockRes();

            await createVehicleController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "db error",
            });
        });
    });

    describe("getAllVehiclesController", () => {
        it("should return 200 with vehicles list", async () => {
            const result = {
                data: [{ id: "1", plate: "ABC1234" }],
                pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
            };

            vehicleService.getAllVehiclesService.mockResolvedValue(result);

            const req = { query: { status: "active" } };
            const res = mockRes();

            await getAllVehiclesController(req, res);

            expect(vehicleService.getAllVehiclesService).toHaveBeenCalledWith({
                status: "active",
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(result);
        });

        it("should return 500 when service throws", async () => {
            vehicleService.getAllVehiclesService.mockRejectedValue(new Error("db error"));

            const req = { query: {} };
            const res = mockRes();

            await getAllVehiclesController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe("getVehicleByIdController", () => {
        it("should return 404 when vehicle is not found", async () => {
            vehicleService.getVehicleByIdService.mockResolvedValue(null);

            const req = { params: { id: "999" } };
            const res = mockRes();

            await getVehicleByIdController(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Vehicle not found",
            });
        });

        it("should return 200 when vehicle is found", async () => {
            const vehicle = { id: "1", plate: "ABC1234" };
            vehicleService.getVehicleByIdService.mockResolvedValue(vehicle);

            const req = { params: { id: "1" } };
            const res = mockRes();

            await getVehicleByIdController(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: vehicle,
            });
        });

        it("should return 500 when service throws", async () => {
            vehicleService.getVehicleByIdService.mockRejectedValue(new Error("db error"));

            const req = { params: { id: "1" } };
            const res = mockRes();

            await getVehicleByIdController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe("updateVehicleController", () => {
        it("should return 200 when vehicle is updated", async () => {
            const updated = { id: "1", status: "inactive" };
            vehicleService.updateVehicleService.mockResolvedValue(updated);

            const req = {
                params: { id: "1" },
                body: { status: "inactive" },
            };
            const res = mockRes();

            await updateVehicleController(req, res);

            expect(vehicleService.updateVehicleService).toHaveBeenCalledWith("1", {
                status: "inactive",
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: updated,
            });
        });

        it("should return 500 when service throws", async () => {
            vehicleService.updateVehicleService.mockRejectedValue(new Error("db error"));

            const req = {
                params: { id: "1" },
                body: { status: "inactive" },
            };
            const res = mockRes();

            await updateVehicleController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe("deleteVehicleController", () => {
        it("should return 200 when vehicle is deleted", async () => {
            vehicleService.deleteVehicleService.mockResolvedValue({ success: true });

            const req = { params: { id: "1" } };
            const res = mockRes();

            await deleteVehicleController(req, res);

            expect(vehicleService.deleteVehicleService).toHaveBeenCalledWith("1");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: { success: true },
            });
        });

        it("should return 500 when service throws", async () => {
            vehicleService.deleteVehicleService.mockRejectedValue(new Error("db error"));

            const req = { params: { id: "1" } };
            const res = mockRes();

            await deleteVehicleController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
});