jest.mock("../../src/utils/jwt", () => ({
    requireAuth: (req, res, next) => next(),
}));

jest.mock("../../src/middlewares/attachUser.middleware", () => ({
    attachUser: (req, res, next) => next(),
}));

jest.mock("../../src/security/role.guard", () => ({
    requireRole: () => (req, res, next) => next(),
}));

jest.mock("../../src/services/fueling.service", () => ({
    createFuelingService: jest.fn(),
    getAllFuelingsService: jest.fn(),
    getFuelingByIdService: jest.fn(),
    updateFuelingService: jest.fn(),
    deleteFuelingService: jest.fn(),
}));

const request = require("supertest");
const app = require("../../src/app");
const {
    getFuelingByIdService,
} = require("../../src/services/fueling.service");

describe("fueling routes", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("GET /api/fueling/:id should return 200", async () => {
        getFuelingByIdService.mockResolvedValue({ id: "1", station: "Posto A" });

        const response = await request(app).get("/api/fueling/1");

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            success: true,
            data: { id: "1", station: "Posto A" },
        });
    });

    test("GET /api/fueling/:id should return 404 when not found", async () => {
        getFuelingByIdService.mockResolvedValue(null);

        const response = await request(app).get("/api/fueling/1");

        expect(response.status).toBe(404);
        expect(response.body).toEqual({
            success: false,
            message: "Fueling not found",
        });
    });
});