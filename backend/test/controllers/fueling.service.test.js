jest.mock("../../src/services/fueling.service", () => ({
    createFuelingService: jest.fn(),
    getAllFuelingsService: jest.fn(),
    getFuelingByIdService: jest.fn(),
    updateFuelingService: jest.fn(),
    deleteFuelingService: jest.fn(),
}));

const {
    createFuelingService,
    getFuelingByIdService,
} = require("../../src/services/fueling.service");

const {
    createFuelingController,
    getFuelingByIdController,
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

    test("createFuelingController should return 400 when required fields are missing", async () => {
        const req = {
            body: {
                fuel_type: "Gasolina",
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
    });

    test("createFuelingController should return 201 on success", async () => {
        const req = {
            body: {
                vehicle_id: "veh-1",
                fuel_type: "Gasolina",
                liters: 20,
                price_per_liter: 5.99,
                current_km: 12345,
                station: "Posto A",
            },
        };
        const res = mockRes();

        createFuelingService.mockResolvedValue({ id: "1" });

        await createFuelingController(req, res);

        expect(createFuelingService).toHaveBeenCalledWith(req.body);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ id: "1" });
    });

    test("getFuelingByIdController should return 404 when not found", async () => {
        const req = { params: { id: "1" } };
        const res = mockRes();

        getFuelingByIdService.mockResolvedValue(null);

        await getFuelingByIdController(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Fueling not found",
        });
    });

    test("getFuelingByIdController should return 200 when found", async () => {
        const req = { params: { id: "1" } };
        const res = mockRes();

        getFuelingByIdService.mockResolvedValue({ id: "1", station: "Posto A" });

        await getFuelingByIdController(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            data: { id: "1", station: "Posto A" },
        });
    });
});