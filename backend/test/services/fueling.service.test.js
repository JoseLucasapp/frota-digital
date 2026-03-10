jest.mock("../../src/config/supabase", () => ({
    from: jest.fn(),
}));

const supabase = require("../../src/config/supabase");
const {
    createFuelingService,
    getAllFuelingsService,
    getFuelingByIdService,
    updateFuelingService,
    deleteFuelingService,
} = require("../../src/services/fueling.service");

describe("fueling.service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("createFuelingService should insert and return fueling", async () => {
        const fakeFueling = { id: "1", station: "Posto A" };

        const single = jest.fn().mockResolvedValue({
            data: fakeFueling,
            error: null,
        });

        const select = jest.fn(() => ({ single }));
        const insert = jest.fn(() => ({ select }));

        supabase.from.mockReturnValue({ insert });

        const result = await createFuelingService({ station: "Posto A" });

        expect(supabase.from).toHaveBeenCalledWith("fuelings");
        expect(insert).toHaveBeenCalledWith({ station: "Posto A" });
        expect(result).toEqual(fakeFueling);
    });

    test("getFuelingByIdService should return null when not found", async () => {
        const maybeSingle = jest.fn().mockResolvedValue({
            data: null,
            error: null,
        });

        const eq = jest.fn(() => ({ maybeSingle }));
        const select = jest.fn(() => ({ eq }));

        supabase.from.mockReturnValue({ select });

        const result = await getFuelingByIdService("abc");

        expect(result).toBeNull();
    });

    test("getFuelingByIdService should throw when id is missing", async () => {
        await expect(getFuelingByIdService()).rejects.toThrow("id is required");
    });

    test("getAllFuelingsService should apply filters and return data", async () => {
        const fakeRows = [
            { id: "1", station: "Posto A" },
            { id: "2", station: "Posto B" },
        ];

        const request = {
            eq: jest.fn().mockReturnThis(),
            ilike: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({
                data: fakeRows,
                error: null,
            }),
        };

        const select = jest.fn(() => request);
        supabase.from.mockReturnValue({ select });

        const result = await getAllFuelingsService({
            vehicle_id: "veh-1",
            fuel_type: "Gasolina",
            station: "Dedé",
        });

        expect(request.eq).toHaveBeenCalledWith("vehicle_id", "veh-1");
        expect(request.eq).toHaveBeenCalledWith("fuel_type", "Gasolina");
        expect(request.ilike).toHaveBeenCalledWith("station", "%Dedé%");
        expect(request.order).toHaveBeenCalledWith("created_at", { ascending: false });
        expect(result).toEqual(fakeRows);
    });

    test("updateFuelingService should update and return record", async () => {
        const updated = { id: "1", station: "Novo Posto" };

        const single = jest.fn().mockResolvedValue({
            data: updated,
            error: null,
        });

        const select = jest.fn(() => ({ single }));
        const eq = jest.fn(() => ({ select }));
        const update = jest.fn(() => ({ eq }));

        supabase.from.mockReturnValue({ update });

        const result = await updateFuelingService("1", { station: "Novo Posto" });

        expect(update).toHaveBeenCalledWith({ station: "Novo Posto" });
        expect(eq).toHaveBeenCalledWith("id", "1");
        expect(result).toEqual(updated);
    });

    test("deleteFuelingService should delete and return success", async () => {
        const eq = jest.fn().mockResolvedValue({ error: null });
        const del = jest.fn(() => ({ eq }));

        supabase.from.mockReturnValue({ delete: del });

        const result = await deleteFuelingService("1");

        expect(del).toHaveBeenCalled();
        expect(eq).toHaveBeenCalledWith("id", "1");
        expect(result).toEqual({ success: true });
    });
});