jest.mock("../../src/config/supabase", () => ({
    from: jest.fn(),
}));

const supabase = require("../../src/config/supabase");

const {
    createLoansService,
    getAllLoansService,
    getLoanByIdService,
    updateLoanService,
    deleteLoanService,
} = require("../../src/services/loans.service");

describe("loans.service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("createLoansService should insert and return loan", async () => {
        const fakeLoan = { id: "1", reason: "Trip" };

        const single = jest.fn().mockResolvedValue({
            data: fakeLoan,
            error: null,
        });

        const select = jest.fn(() => ({ single }));
        const insert = jest.fn(() => ({ select }));

        supabase.from.mockReturnValue({ insert });

        const result = await createLoansService({ reason: "Trip" });

        expect(supabase.from).toHaveBeenCalledWith("loans");
        expect(insert).toHaveBeenCalledWith({ reason: "Trip" });
        expect(result).toEqual(fakeLoan);
    });

    test("createLoansService should throw when supabase returns error", async () => {
        const single = jest.fn().mockResolvedValue({
            data: null,
            error: new Error("insert failed"),
        });

        const select = jest.fn(() => ({ single }));
        const insert = jest.fn(() => ({ select }));

        supabase.from.mockReturnValue({ insert });

        await expect(createLoansService({ reason: "Trip" })).rejects.toThrow(
            "insert failed"
        );
    });

    test("getAllLoansService should apply filters, pagination and return data", async () => {
        const fakeRows = [
            { id: "1", reason: "Trip A" },
            { id: "2", reason: "Trip B" },
        ];

        const builder = {
            select: jest.fn(() => builder),
            eq: jest.fn(() => builder),
            order: jest.fn(() => builder),
            range: jest.fn(() =>
                Promise.resolve({
                    data: fakeRows,
                    error: null,
                    count: 2,
                })
            ),
        };

        supabase.from.mockReturnValue(builder);

        const result = await getAllLoansService({
            vehicle_id: "veh-1",
            driver_id: "drv-1",
            page: "2",
            limit: "5",
            sortOrder: "asc",
        });

        expect(supabase.from).toHaveBeenCalledWith("loans");
        expect(builder.select).toHaveBeenCalledWith("*", { count: "exact" });
        expect(builder.eq).toHaveBeenCalledWith("vehicle_id", "veh-1");
        expect(builder.eq).toHaveBeenCalledWith("driver_id", "drv-1");
        expect(builder.order).toHaveBeenCalledWith("created_at", { ascending: true });
        expect(builder.range).toHaveBeenCalledWith(5, 9);

        expect(result).toEqual({
            data: fakeRows,
            pagination: {
                page: 2,
                limit: 5,
                total: 2,
                totalPages: 1,
            },
        });
    });

    test("getAllLoansService should use default pagination and desc order", async () => {
        const builder = {
            select: jest.fn(() => builder),
            eq: jest.fn(() => builder),
            order: jest.fn(() => builder),
            range: jest.fn(() =>
                Promise.resolve({
                    data: [],
                    error: null,
                    count: 0,
                })
            ),
        };

        supabase.from.mockReturnValue(builder);

        const result = await getAllLoansService();

        expect(builder.order).toHaveBeenCalledWith("created_at", { ascending: false });
        expect(builder.range).toHaveBeenCalledWith(0, 9);
        expect(result).toEqual({
            data: [],
            pagination: {
                page: 1,
                limit: 10,
                total: 0,
                totalPages: 0,
            },
        });
    });

    test("getAllLoansService should throw when supabase returns error", async () => {
        const builder = {
            select: jest.fn(() => builder),
            eq: jest.fn(() => builder),
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

        await expect(getAllLoansService()).rejects.toThrow("query failed");
    });

    test("getLoanByIdService should return null when not found", async () => {
        const maybeSingle = jest.fn().mockResolvedValue({
            data: null,
            error: null,
        });

        const eq = jest.fn(() => ({ maybeSingle }));
        const select = jest.fn(() => ({ eq }));

        supabase.from.mockReturnValue({ select });

        const result = await getLoanByIdService("abc");

        expect(result).toBeNull();
    });

    test("getLoanByIdService should return loan when found", async () => {
        const fakeLoan = { id: "abc", reason: "Trip" };

        const maybeSingle = jest.fn().mockResolvedValue({
            data: fakeLoan,
            error: null,
        });

        const eq = jest.fn(() => ({ maybeSingle }));
        const select = jest.fn(() => ({ eq }));

        supabase.from.mockReturnValue({ select });

        const result = await getLoanByIdService("abc");

        expect(eq).toHaveBeenCalledWith("id", "abc");
        expect(result).toEqual(fakeLoan);
    });

    test("getLoanByIdService should throw when id is missing", async () => {
        await expect(getLoanByIdService()).rejects.toThrow("id is required");
    });

    test("getLoanByIdService should throw when supabase returns error", async () => {
        const maybeSingle = jest.fn().mockResolvedValue({
            data: null,
            error: new Error("read failed"),
        });

        const eq = jest.fn(() => ({ maybeSingle }));
        const select = jest.fn(() => ({ eq }));

        supabase.from.mockReturnValue({ select });

        await expect(getLoanByIdService("abc")).rejects.toThrow("read failed");
    });

    test("updateLoanService should update and return record", async () => {
        const updated = { id: "1", reason: "Updated reason" };

        const single = jest.fn().mockResolvedValue({
            data: updated,
            error: null,
        });

        const select = jest.fn(() => ({ single }));
        const eq = jest.fn(() => ({ select }));
        const update = jest.fn(() => ({ eq }));

        supabase.from.mockReturnValue({ update });

        const result = await updateLoanService("1", { reason: "Updated reason" });

        expect(update).toHaveBeenCalledWith({ reason: "Updated reason" });
        expect(eq).toHaveBeenCalledWith("id", "1");
        expect(result).toEqual(updated);
    });

    test("updateLoanService should throw when id is missing", async () => {
        await expect(updateLoanService()).rejects.toThrow("id is required");
    });

    test("updateLoanService should throw when supabase returns error", async () => {
        const single = jest.fn().mockResolvedValue({
            data: null,
            error: new Error("update failed"),
        });

        const select = jest.fn(() => ({ single }));
        const eq = jest.fn(() => ({ select }));
        const update = jest.fn(() => ({ eq }));

        supabase.from.mockReturnValue({ update });

        await expect(
            updateLoanService("1", { reason: "Updated reason" })
        ).rejects.toThrow("update failed");
    });

    test("deleteLoanService should delete and return success", async () => {
        const eq = jest.fn().mockResolvedValue({ error: null });
        const del = jest.fn(() => ({ eq }));

        supabase.from.mockReturnValue({ delete: del });

        const result = await deleteLoanService("1");

        expect(del).toHaveBeenCalled();
        expect(eq).toHaveBeenCalledWith("id", "1");
        expect(result).toEqual({ success: true });
    });

    test("deleteLoanService should throw when id is missing", async () => {
        await expect(deleteLoanService()).rejects.toThrow("id is required");
    });

    test("deleteLoanService should throw when supabase returns error", async () => {
        const eq = jest.fn().mockResolvedValue({
            error: new Error("delete failed"),
        });
        const del = jest.fn(() => ({ eq }));

        supabase.from.mockReturnValue({ delete: del });

        await expect(deleteLoanService("1")).rejects.toThrow("delete failed");
    });
});