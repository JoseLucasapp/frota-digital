jest.mock("../../src/config/supabase", () => ({
    from: jest.fn(),
}));

jest.mock("../../src/utils/supabaseBucket", () => ({
    uploadFileToBucket: jest.fn(),
    deleteFileFromBucket: jest.fn(),
}));

const supabase = require("../../src/config/supabase");
const {
    uploadFileToBucket,
    deleteFileFromBucket,
} = require("../../src/utils/supabaseBucket");

const {
    createFuelingService,
    getAllFuelingsService,
    getFuelingByIdService,
    updateFuelingService,
    uploadFuelingReceiptService,
    deleteFuelingReceiptService,
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

    test("createFuelingService should throw when supabase returns error", async () => {
        const single = jest.fn().mockResolvedValue({
            data: null,
            error: new Error("insert failed"),
        });

        const select = jest.fn(() => ({ single }));
        const insert = jest.fn(() => ({ select }));

        supabase.from.mockReturnValue({ insert });

        await expect(createFuelingService({ station: "Posto A" })).rejects.toThrow(
            "insert failed"
        );
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

    test("getFuelingByIdService should return fueling when found", async () => {
        const fakeFueling = { id: "abc", station: "Posto A" };

        const maybeSingle = jest.fn().mockResolvedValue({
            data: fakeFueling,
            error: null,
        });

        const eq = jest.fn(() => ({ maybeSingle }));
        const select = jest.fn(() => ({ eq }));

        supabase.from.mockReturnValue({ select });

        const result = await getFuelingByIdService("abc");

        expect(eq).toHaveBeenCalledWith("id", "abc");
        expect(result).toEqual(fakeFueling);
    });

    test("getFuelingByIdService should throw when id is missing", async () => {
        await expect(getFuelingByIdService()).rejects.toThrow("id is required");
    });

    test("getFuelingByIdService should throw when supabase returns error", async () => {
        const maybeSingle = jest.fn().mockResolvedValue({
            data: null,
            error: new Error("read failed"),
        });

        const eq = jest.fn(() => ({ maybeSingle }));
        const select = jest.fn(() => ({ eq }));

        supabase.from.mockReturnValue({ select });

        await expect(getFuelingByIdService("abc")).rejects.toThrow("read failed");
    });

    test("getAllFuelingsService should apply filters, pagination and return data", async () => {
        const fakeRows = [
            { id: "1", station: "Posto A" },
            { id: "2", station: "Posto B" },
        ];

        const builder = {
            select: jest.fn(() => builder),
            eq: jest.fn(() => builder),
            ilike: jest.fn(() => builder),
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

        const result = await getAllFuelingsService({
            vehicle_id: "veh-1",
            fuel_type: "Gasolina",
            station: "Dedé",
            page: "2",
            limit: "5",
        });

        expect(builder.select).toHaveBeenCalledWith("*", { count: "exact" });
        expect(builder.eq).toHaveBeenCalledWith("vehicle_id", "veh-1");
        expect(builder.eq).toHaveBeenCalledWith("fuel_type", "Gasolina");
        expect(builder.ilike).toHaveBeenCalledWith("station", "%Dedé%");
        expect(builder.order).toHaveBeenCalledWith("created_at", { ascending: false });
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

    test("getAllFuelingsService should use default pagination", async () => {
        const builder = {
            select: jest.fn(() => builder),
            eq: jest.fn(() => builder),
            ilike: jest.fn(() => builder),
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

        const result = await getAllFuelingsService();

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

    test("getAllFuelingsService should throw when supabase returns error", async () => {
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

        await expect(getAllFuelingsService()).rejects.toThrow("query failed");
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

    test("updateFuelingService should throw when id is missing", async () => {
        await expect(updateFuelingService()).rejects.toThrow("id is required");
    });

    test("updateFuelingService should throw when supabase returns error", async () => {
        const single = jest.fn().mockResolvedValue({
            data: null,
            error: new Error("update failed"),
        });

        const select = jest.fn(() => ({ single }));
        const eq = jest.fn(() => ({ select }));
        const update = jest.fn(() => ({ eq }));

        supabase.from.mockReturnValue({ update });

        await expect(updateFuelingService("1", { station: "Novo Posto" })).rejects.toThrow(
            "update failed"
        );
    });

    test("uploadFuelingReceiptService should upload receipt and update fueling", async () => {
        const maybeSingle = jest.fn().mockResolvedValue({
            data: {
                id: "1",
                receipt_path: null,
            },
            error: null,
        });

        const selectFueling = jest.fn(() => ({
            eq: jest.fn(() => ({ maybeSingle })),
        }));

        const singleUpdate = jest.fn().mockResolvedValue({
            data: {
                id: "1",
                receipt_url: "https://file-url.com/receipt.jpg",
                receipt_path: "fuelings/1/file.jpg",
            },
            error: null,
        });

        const update = jest.fn(() => ({
            eq: jest.fn(() => ({
                select: jest.fn(() => ({ single: singleUpdate })),
            })),
        }));

        supabase.from.mockImplementation((table) => {
            if (table === "fuelings") {
                return {
                    select: selectFueling,
                    update,
                };
            }
        });

        uploadFileToBucket.mockResolvedValue({
            publicUrl: "https://file-url.com/receipt.jpg",
            filePath: "fuelings/1/file.jpg",
        });

        const file = {
            originalname: "receipt.jpg",
            buffer: Buffer.from("fake-file"),
            mimetype: "image/jpeg",
        };

        const result = await uploadFuelingReceiptService({
            fuelingId: "1",
            file,
        });

        expect(uploadFileToBucket).toHaveBeenCalledWith(
            expect.objectContaining({
                bucket: "fuelings_receipts",
                file,
                folder: "fuelings/1",
                isPublic: true,
            })
        );

        expect(result).toEqual({
            fueling: {
                id: "1",
                receipt_url: "https://file-url.com/receipt.jpg",
                receipt_path: "fuelings/1/file.jpg",
            },
            file: {
                publicUrl: "https://file-url.com/receipt.jpg",
                filePath: "fuelings/1/file.jpg",
            },
        });
    });

    test("uploadFuelingReceiptService should delete previous receipt before uploading new one", async () => {
        const maybeSingle = jest.fn().mockResolvedValue({
            data: {
                id: "1",
                receipt_path: "fuelings/1/old.jpg",
            },
            error: null,
        });

        const selectFueling = jest.fn(() => ({
            eq: jest.fn(() => ({ maybeSingle })),
        }));

        const singleUpdate = jest.fn().mockResolvedValue({
            data: {
                id: "1",
                receipt_url: "https://file-url.com/new.jpg",
                receipt_path: "fuelings/1/new.jpg",
            },
            error: null,
        });

        const update = jest.fn(() => ({
            eq: jest.fn(() => ({
                select: jest.fn(() => ({ single: singleUpdate })),
            })),
        }));

        supabase.from.mockImplementation((table) => {
            if (table === "fuelings") {
                return {
                    select: selectFueling,
                    update,
                };
            }
        });

        deleteFileFromBucket.mockResolvedValue({ success: true });
        uploadFileToBucket.mockResolvedValue({
            publicUrl: "https://file-url.com/new.jpg",
            filePath: "fuelings/1/new.jpg",
        });

        await uploadFuelingReceiptService({
            fuelingId: "1",
            file: {
                originalname: "receipt.jpg",
                buffer: Buffer.from("fake-file"),
                mimetype: "image/jpeg",
            },
        });

        expect(deleteFileFromBucket).toHaveBeenCalledWith({
            bucket: "fuelings_receipts",
            filePath: "fuelings/1/old.jpg",
        });
    });

    test("uploadFuelingReceiptService should throw when fuelingId is missing", async () => {
        await expect(
            uploadFuelingReceiptService({
                file: { originalname: "receipt.jpg" },
            })
        ).rejects.toThrow("fuelingId is required");
    });

    test("uploadFuelingReceiptService should throw when file is missing", async () => {
        await expect(
            uploadFuelingReceiptService({
                fuelingId: "1",
            })
        ).rejects.toThrow("file is required");
    });

    test("uploadFuelingReceiptService should throw when fueling is not found", async () => {
        const maybeSingle = jest.fn().mockResolvedValue({
            data: null,
            error: null,
        });

        const selectFueling = jest.fn(() => ({
            eq: jest.fn(() => ({ maybeSingle })),
        }));

        supabase.from.mockImplementation((table) => {
            if (table === "fuelings") {
                return { select: selectFueling };
            }
        });

        await expect(
            uploadFuelingReceiptService({
                fuelingId: "1",
                file: { originalname: "receipt.jpg" },
            })
        ).rejects.toThrow("Fueling not found");
    });

    test("deleteFuelingReceiptService should delete receipt and clear fields", async () => {
        const maybeSingle = jest.fn().mockResolvedValue({
            data: {
                id: "1",
                receipt_path: "fuelings/1/file.jpg",
            },
            error: null,
        });

        const selectFueling = jest.fn(() => ({
            eq: jest.fn(() => ({ maybeSingle })),
        }));

        const singleUpdate = jest.fn().mockResolvedValue({
            data: {
                id: "1",
                receipt_url: null,
                receipt_path: null,
            },
            error: null,
        });

        const update = jest.fn(() => ({
            eq: jest.fn(() => ({
                select: jest.fn(() => ({ single: singleUpdate })),
            })),
        }));

        supabase.from.mockImplementation((table) => {
            if (table === "fuelings") {
                return {
                    select: selectFueling,
                    update,
                };
            }
        });

        deleteFileFromBucket.mockResolvedValue({ success: true });

        const result = await deleteFuelingReceiptService("1");

        expect(deleteFileFromBucket).toHaveBeenCalledWith({
            bucket: "fuelings_receipts",
            filePath: "fuelings/1/file.jpg",
        });

        expect(result).toEqual({
            fueling: {
                id: "1",
                receipt_url: null,
                receipt_path: null,
            },
        });
    });

    test("deleteFuelingReceiptService should throw when fuelingId is missing", async () => {
        await expect(deleteFuelingReceiptService()).rejects.toThrow("fuelingId is required");
    });

    test("deleteFuelingReceiptService should throw when receipt does not exist", async () => {
        const maybeSingle = jest.fn().mockResolvedValue({
            data: {
                id: "1",
                receipt_path: null,
            },
            error: null,
        });

        const selectFueling = jest.fn(() => ({
            eq: jest.fn(() => ({ maybeSingle })),
        }));

        supabase.from.mockImplementation((table) => {
            if (table === "fuelings") {
                return { select: selectFueling };
            }
        });

        await expect(deleteFuelingReceiptService("1")).rejects.toThrow("receipt not found");
    });

    test("deleteFuelingReceiptService should throw when fueling is not found", async () => {
        const maybeSingle = jest.fn().mockResolvedValue({
            data: null,
            error: null,
        });

        const selectFueling = jest.fn(() => ({
            eq: jest.fn(() => ({ maybeSingle })),
        }));

        supabase.from.mockImplementation((table) => {
            if (table === "fuelings") {
                return { select: selectFueling };
            }
        });

        await expect(deleteFuelingReceiptService("1")).rejects.toThrow("Fueling not found");
    });

    test("deleteFuelingService should delete and return success", async () => {
        const maybeSingle = jest.fn().mockResolvedValue({
            data: {
                id: "1",
                receipt_path: null,
            },
            error: null,
        });

        const select = jest.fn(() => ({
            eq: jest.fn(() => ({ maybeSingle })),
        }));

        const eqDelete = jest.fn().mockResolvedValue({ error: null });
        const del = jest.fn(() => ({ eq: eqDelete }));

        supabase.from.mockImplementation((table) => {
            if (table === "fuelings") {
                return {
                    select,
                    delete: del,
                };
            }
        });

        const result = await deleteFuelingService("1");

        expect(eqDelete).toHaveBeenCalledWith("id", "1");
        expect(result).toEqual({ success: true });
    });

    test("deleteFuelingService should delete receipt from bucket before deleting record", async () => {
        const maybeSingle = jest.fn().mockResolvedValue({
            data: {
                id: "1",
                receipt_path: "fuelings/1/file.jpg",
            },
            error: null,
        });

        const select = jest.fn(() => ({
            eq: jest.fn(() => ({ maybeSingle })),
        }));

        const eqDelete = jest.fn().mockResolvedValue({ error: null });
        const del = jest.fn(() => ({ eq: eqDelete }));

        supabase.from.mockImplementation((table) => {
            if (table === "fuelings") {
                return {
                    select,
                    delete: del,
                };
            }
        });

        deleteFileFromBucket.mockResolvedValue({ success: true });

        await deleteFuelingService("1");

        expect(deleteFileFromBucket).toHaveBeenCalledWith({
            bucket: "fuelings_receipts",
            filePath: "fuelings/1/file.jpg",
        });
    });

    test("deleteFuelingService should throw when id is missing", async () => {
        await expect(deleteFuelingService()).rejects.toThrow("id is required");
    });

    test("deleteFuelingService should throw when supabase returns error", async () => {
        const maybeSingle = jest.fn().mockResolvedValue({
            data: {
                id: "1",
                receipt_path: null,
            },
            error: null,
        });

        const select = jest.fn(() => ({
            eq: jest.fn(() => ({ maybeSingle })),
        }));

        const eqDelete = jest.fn().mockResolvedValue({
            error: new Error("delete failed"),
        });
        const del = jest.fn(() => ({ eq: eqDelete }));

        supabase.from.mockImplementation((table) => {
            if (table === "fuelings") {
                return {
                    select,
                    delete: del,
                };
            }
        });

        await expect(deleteFuelingService("1")).rejects.toThrow("delete failed");
    });
});