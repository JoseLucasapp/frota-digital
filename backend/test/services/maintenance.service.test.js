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
    createMaintenancesService,
    getAllMaintenancesService,
    getMaintenancesByIdService,
    updateMaintenancesService,
    uploadMaintenancesReceiptService,
    deleteMaintenanceReceiptService,
    deleteMaintenanceService,
} = require("../../src/services/maintenance.service");

describe("maintenances.service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("createMaintenancesService should insert and return maintenance", async () => {
        const fakeMaintenance = { id: "1", type: "Oil change" };

        const single = jest.fn().mockResolvedValue({
            data: fakeMaintenance,
            error: null,
        });

        const select = jest.fn(() => ({ single }));
        const insert = jest.fn(() => ({ select }));

        supabase.from.mockReturnValue({ insert });

        const result = await createMaintenancesService({ type: "Oil change" });

        expect(supabase.from).toHaveBeenCalledWith("maintenances");
        expect(insert).toHaveBeenCalledWith({ type: "Oil change" });
        expect(result).toEqual(fakeMaintenance);
    });

    test("createMaintenancesService should throw when supabase returns error", async () => {
        const single = jest.fn().mockResolvedValue({
            data: null,
            error: new Error("insert failed"),
        });

        const select = jest.fn(() => ({ single }));
        const insert = jest.fn(() => ({ select }));

        supabase.from.mockReturnValue({ insert });

        await expect(
            createMaintenancesService({ type: "Oil change" })
        ).rejects.toThrow("insert failed");
    });

    test("getAllMaintenancesService should apply filters, pagination and return data", async () => {
        const fakeRows = [
            { id: "1", type: "Oil change" },
            { id: "2", type: "Tire repair" },
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

        const result = await getAllMaintenancesService({
            vehicle_id: "veh-1",
            mechanic_id: "mech-1",
            status: "PENDING",
            type: "oil",
            page: "2",
            limit: "5",
        });

        expect(supabase.from).toHaveBeenCalledWith("maintenances");
        expect(builder.select).toHaveBeenCalledWith("*", { count: "exact" });
        expect(builder.eq).toHaveBeenCalledWith("vehicle_id", "veh-1");
        expect(builder.eq).toHaveBeenCalledWith("mechanic_id", "mech-1");
        expect(builder.eq).toHaveBeenCalledWith("status", "PENDING");
        expect(builder.ilike).toHaveBeenCalledWith("type", "%oil%");
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

    test("getAllMaintenancesService should use default pagination", async () => {
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

        const result = await getAllMaintenancesService();

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

    test("getAllMaintenancesService should throw when supabase returns error", async () => {
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

        await expect(getAllMaintenancesService()).rejects.toThrow("query failed");
    });

    test("getMaintenancesByIdService should return null when not found", async () => {
        const maybeSingle = jest.fn().mockResolvedValue({
            data: null,
            error: null,
        });

        const eq = jest.fn(() => ({ maybeSingle }));
        const select = jest.fn(() => ({ eq }));

        supabase.from.mockReturnValue({ select });

        const result = await getMaintenancesByIdService("abc");

        expect(result).toBeNull();
    });

    test("getMaintenancesByIdService should return maintenance when found", async () => {
        const fakeMaintenance = { id: "abc", type: "Oil change" };

        const maybeSingle = jest.fn().mockResolvedValue({
            data: fakeMaintenance,
            error: null,
        });

        const eq = jest.fn(() => ({ maybeSingle }));
        const select = jest.fn(() => ({ eq }));

        supabase.from.mockReturnValue({ select });

        const result = await getMaintenancesByIdService("abc");

        expect(eq).toHaveBeenCalledWith("id", "abc");
        expect(result).toEqual(fakeMaintenance);
    });

    test("getMaintenancesByIdService should throw when id is missing", async () => {
        await expect(getMaintenancesByIdService()).rejects.toThrow("id is required");
    });

    test("getMaintenancesByIdService should throw when supabase returns error", async () => {
        const maybeSingle = jest.fn().mockResolvedValue({
            data: null,
            error: new Error("read failed"),
        });

        const eq = jest.fn(() => ({ maybeSingle }));
        const select = jest.fn(() => ({ eq }));

        supabase.from.mockReturnValue({ select });

        await expect(getMaintenancesByIdService("abc")).rejects.toThrow("read failed");
    });

    test("updateMaintenancesService should update and return record", async () => {
        const updated = { id: "1", status: "DONE" };

        const single = jest.fn().mockResolvedValue({
            data: updated,
            error: null,
        });

        const select = jest.fn(() => ({ single }));
        const eq = jest.fn(() => ({ select }));
        const update = jest.fn(() => ({ eq }));

        supabase.from.mockReturnValue({ update });

        const result = await updateMaintenancesService("1", { status: "DONE" });

        expect(update).toHaveBeenCalledWith({ status: "DONE" });
        expect(eq).toHaveBeenCalledWith("id", "1");
        expect(result).toEqual(updated);
    });

    test("updateMaintenancesService should throw when id is missing", async () => {
        await expect(updateMaintenancesService()).rejects.toThrow("id is required");
    });

    test("updateMaintenancesService should throw when supabase returns error", async () => {
        const single = jest.fn().mockResolvedValue({
            data: null,
            error: new Error("update failed"),
        });

        const select = jest.fn(() => ({ single }));
        const eq = jest.fn(() => ({ select }));
        const update = jest.fn(() => ({ eq }));

        supabase.from.mockReturnValue({ update });

        await expect(
            updateMaintenancesService("1", { status: "DONE" })
        ).rejects.toThrow("update failed");
    });

    test("uploadMaintenancesReceiptService should upload receipt and update maintenance", async () => {
        const maybeSingle = jest.fn().mockResolvedValue({
            data: {
                id: "1",
                receipt_path: null,
            },
            error: null,
        });

        const selectMaintenance = jest.fn(() => ({
            eq: jest.fn(() => ({ maybeSingle })),
        }));

        const singleUpdate = jest.fn().mockResolvedValue({
            data: {
                id: "1",
                receipt_url: "https://file-url.com/receipt.jpg",
                receipt_path: "maintenances/1/file.jpg",
            },
            error: null,
        });

        const update = jest.fn(() => ({
            eq: jest.fn(() => ({
                select: jest.fn(() => ({ single: singleUpdate })),
            })),
        }));

        supabase.from.mockImplementation((table) => {
            if (table === "maintenances") {
                return {
                    select: selectMaintenance,
                    update,
                };
            }
        });

        uploadFileToBucket.mockResolvedValue({
            publicUrl: "https://file-url.com/receipt.jpg",
            filePath: "maintenances/1/file.jpg",
        });

        const file = {
            originalname: "receipt.jpg",
            buffer: Buffer.from("fake-file"),
            mimetype: "image/jpeg",
        };

        const result = await uploadMaintenancesReceiptService({
            maintenanceId: "1",
            file,
        });

        expect(uploadFileToBucket).toHaveBeenCalledWith(
            expect.objectContaining({
                bucket: "maintenances_receipts",
                file,
                folder: "maintenances/1",
                isPublic: true,
            })
        );

        expect(result).toEqual({
            maintenance: {
                id: "1",
                receipt_url: "https://file-url.com/receipt.jpg",
                receipt_path: "maintenances/1/file.jpg",
            },
            file: {
                publicUrl: "https://file-url.com/receipt.jpg",
                filePath: "maintenances/1/file.jpg",
            },
        });
    });

    test("uploadMaintenancesReceiptService should delete previous receipt before uploading new one", async () => {
        const maybeSingle = jest.fn().mockResolvedValue({
            data: {
                id: "1",
                receipt_path: "maintenances/1/old.jpg",
            },
            error: null,
        });

        const selectMaintenance = jest.fn(() => ({
            eq: jest.fn(() => ({ maybeSingle })),
        }));

        const singleUpdate = jest.fn().mockResolvedValue({
            data: {
                id: "1",
                receipt_url: "https://file-url.com/new.jpg",
                receipt_path: "maintenances/1/new.jpg",
            },
            error: null,
        });

        const update = jest.fn(() => ({
            eq: jest.fn(() => ({
                select: jest.fn(() => ({ single: singleUpdate })),
            })),
        }));

        supabase.from.mockImplementation((table) => {
            if (table === "maintenances") {
                return {
                    select: selectMaintenance,
                    update,
                };
            }
        });

        deleteFileFromBucket.mockResolvedValue({ success: true });
        uploadFileToBucket.mockResolvedValue({
            publicUrl: "https://file-url.com/new.jpg",
            filePath: "maintenances/1/new.jpg",
        });

        await uploadMaintenancesReceiptService({
            maintenanceId: "1",
            file: {
                originalname: "receipt.jpg",
                buffer: Buffer.from("fake-file"),
                mimetype: "image/jpeg",
            },
        });

        expect(deleteFileFromBucket).toHaveBeenCalledWith({
            bucket: "maintenances_receipts",
            filePath: "maintenances/1/old.jpg",
        });
    });

    test("uploadMaintenancesReceiptService should throw when maintenanceId is missing", async () => {
        await expect(
            uploadMaintenancesReceiptService({
                file: { originalname: "receipt.jpg" },
            })
        ).rejects.toThrow("maintenanceId is required");
    });

    test("uploadMaintenancesReceiptService should throw when file is missing", async () => {
        await expect(
            uploadMaintenancesReceiptService({
                maintenanceId: "1",
            })
        ).rejects.toThrow("file is required");
    });

    test("uploadMaintenancesReceiptService should throw when maintenance is not found", async () => {
        const maybeSingle = jest.fn().mockResolvedValue({
            data: null,
            error: null,
        });

        const selectMaintenance = jest.fn(() => ({
            eq: jest.fn(() => ({ maybeSingle })),
        }));

        supabase.from.mockImplementation((table) => {
            if (table === "maintenances") {
                return { select: selectMaintenance };
            }
        });

        await expect(
            uploadMaintenancesReceiptService({
                maintenanceId: "1",
                file: { originalname: "receipt.jpg" },
            })
        ).rejects.toThrow("Maintenance not found");
    });

    test("deleteMaintenanceReceiptService should delete receipt and clear fields", async () => {
        const maybeSingle = jest.fn().mockResolvedValue({
            data: {
                id: "1",
                receipt_path: "maintenances/1/file.jpg",
            },
            error: null,
        });

        const selectMaintenance = jest.fn(() => ({
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
            if (table === "maintenances") {
                return {
                    select: selectMaintenance,
                    update,
                };
            }
        });

        deleteFileFromBucket.mockResolvedValue({ success: true });

        const result = await deleteMaintenanceReceiptService("1");

        expect(deleteFileFromBucket).toHaveBeenCalledWith({
            bucket: "maintenances_receipts",
            filePath: "maintenances/1/file.jpg",
        });

        expect(result).toEqual({
            maintenance: {
                id: "1",
                receipt_url: null,
                receipt_path: null,
            },
        });
    });

    test("deleteMaintenanceReceiptService should throw when maintenanceId is missing", async () => {
        await expect(deleteMaintenanceReceiptService()).rejects.toThrow(
            "maintenanceId is required"
        );
    });

    test("deleteMaintenanceReceiptService should throw when receipt does not exist", async () => {
        const maybeSingle = jest.fn().mockResolvedValue({
            data: {
                id: "1",
                receipt_path: null,
            },
            error: null,
        });

        const selectMaintenance = jest.fn(() => ({
            eq: jest.fn(() => ({ maybeSingle })),
        }));

        supabase.from.mockImplementation((table) => {
            if (table === "maintenances") {
                return { select: selectMaintenance };
            }
        });

        await expect(deleteMaintenanceReceiptService("1")).rejects.toThrow(
            "receipt not found"
        );
    });

    test("deleteMaintenanceReceiptService should throw when maintenance is not found", async () => {
        const maybeSingle = jest.fn().mockResolvedValue({
            data: null,
            error: null,
        });

        const selectMaintenance = jest.fn(() => ({
            eq: jest.fn(() => ({ maybeSingle })),
        }));

        supabase.from.mockImplementation((table) => {
            if (table === "maintenances") {
                return { select: selectMaintenance };
            }
        });

        await expect(deleteMaintenanceReceiptService("1")).rejects.toThrow(
            "Maintenance not found"
        );
    });

    test("deleteMaintenanceService should delete and return success", async () => {
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
            if (table === "maintenances") {
                return {
                    select,
                    delete: del,
                };
            }
        });

        const result = await deleteMaintenanceService("1");

        expect(eqDelete).toHaveBeenCalledWith("id", "1");
        expect(result).toEqual({ success: true });
    });

    test("deleteMaintenanceService should delete receipt from bucket before deleting record", async () => {
        const maybeSingle = jest.fn().mockResolvedValue({
            data: {
                id: "1",
                receipt_path: "maintenances/1/file.jpg",
            },
            error: null,
        });

        const select = jest.fn(() => ({
            eq: jest.fn(() => ({ maybeSingle })),
        }));

        const eqDelete = jest.fn().mockResolvedValue({ error: null });
        const del = jest.fn(() => ({ eq: eqDelete }));

        supabase.from.mockImplementation((table) => {
            if (table === "maintenances") {
                return {
                    select,
                    delete: del,
                };
            }
        });

        deleteFileFromBucket.mockResolvedValue({ success: true });

        await deleteMaintenanceService("1");

        expect(deleteFileFromBucket).toHaveBeenCalledWith({
            bucket: "maintenances_receipts",
            filePath: "maintenances/1/file.jpg",
        });
    });

    test("deleteMaintenanceService should throw when id is missing", async () => {
        await expect(deleteMaintenanceService()).rejects.toThrow("id is required");
    });

    test("deleteMaintenanceService should throw when supabase returns error", async () => {
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
            if (table === "maintenances") {
                return {
                    select,
                    delete: del,
                };
            }
        });

        await expect(deleteMaintenanceService("1")).rejects.toThrow("delete failed");
    });
});