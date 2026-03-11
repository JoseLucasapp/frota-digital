const supabase = require("../../src/config/supabase");
const {
    createVehicleService,
    getAllVehiclesService,
    getVehicleByIdService,
    updateVehicleService,
    deleteVehicleService,
} = require("../../src/services/vehicle.service");

jest.mock("../../src/config/supabase", () => ({
    from: jest.fn(),
}));

describe("vehicle.service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("createVehicleService", () => {
        it("should create a vehicle and return the created record", async () => {
            const payload = {
                plate: "ABC1234",
                make: "Toyota",
                model: "Corolla",
                year: "2022",
                fuel_type: "Gasoline",
                current_km: 10000,
                status: "active",
            };

            const created = { id: "1", ...payload };

            const single = jest.fn().mockResolvedValue({
                data: created,
                error: null,
            });

            const select = jest.fn(() => ({ single }));
            const insert = jest.fn(() => ({ select }));

            supabase.from.mockReturnValue({ insert });

            const result = await createVehicleService(payload);

            expect(supabase.from).toHaveBeenCalledWith("vehicles");
            expect(insert).toHaveBeenCalledWith(payload);
            expect(result).toEqual(created);
        });

        it("should throw when supabase returns an error", async () => {
            const single = jest.fn().mockResolvedValue({
                data: null,
                error: new Error("insert failed"),
            });

            const select = jest.fn(() => ({ single }));
            const insert = jest.fn(() => ({ select }));

            supabase.from.mockReturnValue({ insert });

            await expect(createVehicleService({ plate: "ABC1234" })).rejects.toThrow(
                "insert failed"
            );
        });
    });

    describe("getAllVehiclesService", () => {
        it("should return paginated vehicles with default params", async () => {
            const rows = [
                { id: "1", plate: "AAA1111" },
                { id: "2", plate: "BBB2222" },
            ];

            const finalResult = Promise.resolve({
                data: rows,
                error: null,
                count: 2,
            });

            const builder = {
                select: jest.fn(() => builder),
                eq: jest.fn(() => builder),
                ilike: jest.fn(() => builder),
                order: jest.fn(() => builder),
                range: jest.fn(() => finalResult),
            };

            supabase.from.mockReturnValue(builder);

            const result = await getAllVehiclesService();

            expect(builder.select).toHaveBeenCalledWith("*", { count: "exact" });
            expect(builder.order).toHaveBeenCalledWith("created_at", { ascending: false });
            expect(builder.range).toHaveBeenCalledWith(0, 9);
            expect(result).toEqual({
                data: rows,
                pagination: {
                    page: 1,
                    limit: 10,
                    total: 2,
                    totalPages: 1,
                },
            });
        });

        it("should apply filters and pagination", async () => {
            const finalResult = Promise.resolve({
                data: [{ id: "1", plate: "ABC1234" }],
                error: null,
                count: 1,
            });

            const builder = {
                select: jest.fn(() => builder),
                eq: jest.fn(() => builder),
                ilike: jest.fn(() => builder),
                order: jest.fn(() => builder),
                range: jest.fn(() => finalResult),
            };

            supabase.from.mockReturnValue(builder);

            const result = await getAllVehiclesService({
                plate: "ABC1234",
                model: "Cor",
                status: "active",
                page: "2",
                limit: "5",
            });

            expect(builder.eq).toHaveBeenCalledWith("plate", "ABC1234");
            expect(builder.ilike).toHaveBeenCalledWith("model", "%Cor%");
            expect(builder.eq).toHaveBeenCalledWith("status", "active");
            expect(builder.range).toHaveBeenCalledWith(5, 9);
            expect(result.pagination).toEqual({
                page: 2,
                limit: 5,
                total: 1,
                totalPages: 1,
            });
        });

        it("should sort by status when sortBy=status", async () => {
            const finalResult = Promise.resolve({
                data: [],
                error: null,
                count: 0,
            });

            const builder = {
                select: jest.fn(() => builder),
                eq: jest.fn(() => builder),
                ilike: jest.fn(() => builder),
                order: jest.fn(() => builder),
                range: jest.fn(() => finalResult),
            };

            supabase.from.mockReturnValue(builder);

            await getAllVehiclesService({
                sortBy: "status",
                sortOrder: "asc",
            });

            expect(builder.order).toHaveBeenNthCalledWith(1, "status", { ascending: true });
            expect(builder.order).toHaveBeenNthCalledWith(2, "created_at", { ascending: false });
        });

        it("should throw when supabase returns an error", async () => {
            const builder = {
                select: jest.fn(() => builder),
                eq: jest.fn(() => builder),
                ilike: jest.fn(() => builder),
                order: jest.fn(() => builder),
                range: jest.fn(() =>
                    Promise.resolve({
                        data: null,
                        error: new Error("query failed"),
                        count: 0,
                    })
                ),
            };

            supabase.from.mockReturnValue(builder);

            await expect(getAllVehiclesService()).rejects.toThrow("query failed");
        });
    });

    describe("getVehicleByIdService", () => {
        it("should throw when id is missing", async () => {
            await expect(getVehicleByIdService()).rejects.toThrow("id is required");
        });

        it("should return a vehicle when found", async () => {
            const maybeSingle = jest.fn().mockResolvedValue({
                data: { id: "1", plate: "ABC1234" },
                error: null,
            });

            const eq = jest.fn(() => ({ maybeSingle }));
            const select = jest.fn(() => ({ eq }));

            supabase.from.mockReturnValue({ select });

            const result = await getVehicleByIdService("1");

            expect(result).toEqual({ id: "1", plate: "ABC1234" });
        });

        it("should return null when not found", async () => {
            const maybeSingle = jest.fn().mockResolvedValue({
                data: null,
                error: null,
            });

            const eq = jest.fn(() => ({ maybeSingle }));
            const select = jest.fn(() => ({ eq }));

            supabase.from.mockReturnValue({ select });

            const result = await getVehicleByIdService("999");

            expect(result).toBeNull();
        });

        it("should throw when supabase returns an error", async () => {
            const maybeSingle = jest.fn().mockResolvedValue({
                data: null,
                error: new Error("read failed"),
            });

            const eq = jest.fn(() => ({ maybeSingle }));
            const select = jest.fn(() => ({ eq }));

            supabase.from.mockReturnValue({ select });

            await expect(getVehicleByIdService("1")).rejects.toThrow("read failed");
        });
    });

    describe("updateVehicleService", () => {
        it("should throw when id is missing", async () => {
            await expect(updateVehicleService(null, { status: "inactive" })).rejects.toThrow(
                "id is required"
            );
        });

        it("should update a vehicle and return the updated record", async () => {
            const single = jest.fn().mockResolvedValue({
                data: { id: "1", status: "inactive" },
                error: null,
            });

            const select = jest.fn(() => ({ single }));
            const eq = jest.fn(() => ({ select }));
            const update = jest.fn(() => ({ eq }));

            supabase.from.mockReturnValue({ update });

            const result = await updateVehicleService("1", { status: "inactive" });

            expect(update).toHaveBeenCalledWith({ status: "inactive" });
            expect(eq).toHaveBeenCalledWith("id", "1");
            expect(result).toEqual({ id: "1", status: "inactive" });
        });

        it("should throw when supabase returns an error", async () => {
            const single = jest.fn().mockResolvedValue({
                data: null,
                error: new Error("update failed"),
            });

            const select = jest.fn(() => ({ single }));
            const eq = jest.fn(() => ({ select }));
            const update = jest.fn(() => ({ eq }));

            supabase.from.mockReturnValue({ update });

            await expect(updateVehicleService("1", { status: "inactive" })).rejects.toThrow(
                "update failed"
            );
        });
    });

    describe("deleteVehicleService", () => {
        it("should throw when id is missing", async () => {
            await expect(deleteVehicleService()).rejects.toThrow("id is required");
        });

        it("should delete a vehicle and return success", async () => {
            const eq = jest.fn().mockResolvedValue({ error: null });
            const del = jest.fn(() => ({ eq }));

            supabase.from.mockReturnValue({ delete: del });

            const result = await deleteVehicleService("1");

            expect(eq).toHaveBeenCalledWith("id", "1");
            expect(result).toEqual({ success: true });
        });

        it("should throw when supabase returns an error", async () => {
            const eq = jest.fn().mockResolvedValue({
                error: new Error("delete failed"),
            });
            const del = jest.fn(() => ({ eq }));

            supabase.from.mockReturnValue({ delete: del });

            await expect(deleteVehicleService("1")).rejects.toThrow("delete failed");
        });
    });
});