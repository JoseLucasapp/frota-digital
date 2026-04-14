jest.mock("../../src/config/supabase", () => ({
    from: jest.fn(),
}));

jest.mock("../../src/utils/hash", () => ({
    hashPassword: jest.fn(),
}));

jest.mock("../../src/utils/sentEmail", () => ({
    sendEmail: jest.fn(),
}));

jest.mock("../../src/utils/supabaseBucket", () => ({
    uploadFileToBucket: jest.fn(),
    deleteFileFromBucket: jest.fn(),
}));

const supabase = require("../../src/config/supabase");
const { hashPassword } = require("../../src/utils/hash");
const { sendEmail } = require("../../src/utils/sentEmail");
const {
    uploadFileToBucket,
    deleteFileFromBucket,
} = require("../../src/utils/supabaseBucket");
const { DRIVER_STATUS } = require("../../src/types/driver.status.types");

const {
    createDriverService,
    getAllDriversService,
    getDriverByIdService,
    updateDriverService,
    uploadDriverDocumentService,
    deleteDriverDocumentService,
    deleteDriverService,
} = require("../../src/services/driver.service");

describe("driver.service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("createDriverService", () => {
        test("should create a driver with ACTIVE status", async () => {
            const single = jest.fn().mockResolvedValue({
                data: { id: "1", name: "José", status: DRIVER_STATUS.ACTIVE },
                error: null,
            });

            const select = jest.fn(() => ({ single }));
            const insert = jest.fn(() => ({ select }));

            supabase.from.mockReturnValue({ insert });

            const payload = {
                name: "José",
                email: "jose@email.com",
                phone: "83999999999",
                cpf: "123",
            };

            const result = await createDriverService(payload);

            expect(supabase.from).toHaveBeenCalledWith("drivers");
            expect(insert).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: "José",
                    email: "jose@email.com",
                    status: DRIVER_STATUS.ACTIVE,
                })
            );

            expect(sendEmail).toHaveBeenCalledWith(
                "jose@email.com",
                "Conta motorista cadastrada"
            );

            expect(result).toEqual({
                success: true,
                data: { id: "1", name: "José", status: DRIVER_STATUS.ACTIVE },
            });
        });

        test("should throw when supabase returns error", async () => {
            const single = jest.fn().mockResolvedValue({
                data: null,
                error: new Error("insert failed"),
            });

            const select = jest.fn(() => ({ single }));
            const insert = jest.fn(() => ({ select }));

            supabase.from.mockReturnValue({ insert });

            await expect(
                createDriverService({
                    name: "José",
                    email: "jose@email.com",
                    phone: "83999999999",
                    cpf: "123",
                })
            ).rejects.toThrow("insert failed");
        });
    });

    describe("getAllDriversService", () => {
        test("should return paginated drivers ordered by created_at desc by default", async () => {
            const range = jest.fn().mockResolvedValue({
                data: [{ id: "1", name: "José" }],
                error: null,
                count: 1,
            });

            const order = jest.fn(() => ({ range }));
            const ilike = jest.fn(() => ({ order }));
            const eq = jest.fn(() => ({ ilike }));

            const select = jest.fn(() => ({
                eq,
                ilike,
                order,
                range,
            }));

            supabase.from.mockReturnValue({ select });

            const result = await getAllDriversService({
                cpf: "123",
                name: "Jos",
                page: 1,
                limit: 10,
            });

            expect(select).toHaveBeenCalledWith("*", { count: "exact" });
            expect(eq).toHaveBeenCalledWith("cpf", "123");
            expect(ilike).toHaveBeenCalledWith("name", "%Jos%");
            expect(order).toHaveBeenCalledWith("created_at", { ascending: false });
            expect(range).toHaveBeenCalledWith(0, 9);

            expect(result).toEqual({
                data: [{ id: "1", name: "José" }],
                pagination: {
                    page: 1,
                    limit: 10,
                    total: 1,
                    totalPages: 1,
                },
            });
        });

        test("should order by status when sortBy=status", async () => {
            const range = jest.fn().mockResolvedValue({
                data: [{ id: "1", status: "ACTIVE" }],
                error: null,
                count: 1,
            });

            const secondOrder = jest.fn(() => ({ range }));
            const firstOrder = jest.fn(() => ({ order: secondOrder }));

            const select = jest.fn(() => ({
                order: firstOrder,
                range,
            }));

            supabase.from.mockReturnValue({ select });

            const result = await getAllDriversService({
                sortBy: "status",
                sortOrder: "asc",
            });

            expect(firstOrder).toHaveBeenCalledWith("status", { ascending: true });
            expect(secondOrder).toHaveBeenCalledWith("created_at", { ascending: false });
            expect(result.data).toEqual([{ id: "1", status: "ACTIVE" }]);
        });

        test("should throw when query fails", async () => {
            const range = jest.fn().mockResolvedValue({
                data: null,
                error: new Error("query failed"),
                count: 0,
            });

            const order = jest.fn(() => ({ range }));
            const select = jest.fn(() => ({ order, range }));

            supabase.from.mockReturnValue({ select });

            await expect(getAllDriversService()).rejects.toThrow("query failed");
        });
    });

    describe("getDriverByIdService", () => {
        test("should return driver by id", async () => {
            const maybeSingle = jest.fn().mockResolvedValue({
                data: { id: "1", name: "José" },
                error: null,
            });

            const eq = jest.fn(() => ({ maybeSingle }));
            const select = jest.fn(() => ({ eq }));

            supabase.from.mockReturnValue({ select });

            const result = await getDriverByIdService("1");

            expect(select).toHaveBeenCalledWith("*");
            expect(eq).toHaveBeenCalledWith("id", "1");
            expect(result).toEqual({ id: "1", name: "José" });
        });

        test("should return null when driver is not found", async () => {
            const maybeSingle = jest.fn().mockResolvedValue({
                data: null,
                error: null,
            });

            const eq = jest.fn(() => ({ maybeSingle }));
            const select = jest.fn(() => ({ eq }));

            supabase.from.mockReturnValue({ select });

            const result = await getDriverByIdService("999");

            expect(result).toBeNull();
        });

        test("should throw when id is missing", async () => {
            await expect(getDriverByIdService()).rejects.toThrow("id is required");
        });

        test("should throw when query fails", async () => {
            const maybeSingle = jest.fn().mockResolvedValue({
                data: null,
                error: new Error("query failed"),
            });

            const eq = jest.fn(() => ({ maybeSingle }));
            const select = jest.fn(() => ({ eq }));

            supabase.from.mockReturnValue({ select });

            await expect(getDriverByIdService("1")).rejects.toThrow("query failed");
        });
    });

    describe("updateDriverService", () => {
        test("should hash password before updating", async () => {
            hashPassword.mockResolvedValue("hashed-password");

            const single = jest.fn().mockResolvedValue({
                data: { id: "1", password_hash: "hashed-password" },
                error: null,
            });

            const select = jest.fn(() => ({ single }));
            const eq = jest.fn(() => ({ select }));
            const update = jest.fn(() => ({ eq }));

            supabase.from.mockReturnValue({ update });

            const result = await updateDriverService("1", {
                password: "123456",
                name: "José",
            });

            expect(hashPassword).toHaveBeenCalledWith("123456");
            expect(update).toHaveBeenCalledWith({
                name: "José",
                password_hash: "hashed-password",
                is_first_acc: false,
            });

            expect(result).toEqual({ id: "1", password_hash: "hashed-password" });
        });

        test("should update without password", async () => {
            const single = jest.fn().mockResolvedValue({
                data: { id: "1", name: "Novo nome" },
                error: null,
            });

            const select = jest.fn(() => ({ single }));
            const eq = jest.fn(() => ({ select }));
            const update = jest.fn(() => ({ eq }));

            supabase.from.mockReturnValue({ update });

            const result = await updateDriverService("1", { name: "Novo nome" });

            expect(hashPassword).not.toHaveBeenCalled();
            expect(update).toHaveBeenCalledWith({ name: "Novo nome" });
            expect(result).toEqual({ id: "1", name: "Novo nome" });
        });

        test("should throw when id is missing", async () => {
            await expect(updateDriverService()).rejects.toThrow("id is required");
        });

        test("should throw when data is missing", async () => {
            await expect(updateDriverService("1")).rejects.toThrow("data is required");
        });

        test("should throw when update fails", async () => {
            const single = jest.fn().mockResolvedValue({
                data: null,
                error: new Error("update failed"),
            });

            const select = jest.fn(() => ({ single }));
            const eq = jest.fn(() => ({ select }));
            const update = jest.fn(() => ({ eq }));

            supabase.from.mockReturnValue({ update });

            await expect(
                updateDriverService("1", { name: "Teste" })
            ).rejects.toThrow("update failed");
        });
    });

    describe("uploadDriverDocumentService", () => {
        test("should upload cpf document and update driver", async () => {
            const maybeSingle = jest.fn().mockResolvedValue({
                data: {
                    id: "1",
                    cpf_file_path: null,
                },
                error: null,
            });

            const selectDriver = jest.fn(() => ({
                eq: jest.fn(() => ({ maybeSingle })),
            }));

            const singleUpdate = jest.fn().mockResolvedValue({
                data: {
                    id: "1",
                    cpf_file_url: "https://file-url.com/cpf.pdf",
                    cpf_file_path: "drivers/1/cpf/file.pdf",
                },
                error: null,
            });

            const update = jest.fn(() => ({
                eq: jest.fn(() => ({
                    select: jest.fn(() => ({ single: singleUpdate })),
                })),
            }));

            supabase.from.mockImplementation((table) => {
                if (table === "drivers") {
                    return {
                        select: selectDriver,
                        update,
                    };
                }
            });

            uploadFileToBucket.mockResolvedValue({
                publicUrl: "https://file-url.com/cpf.pdf",
                filePath: "drivers/1/cpf/file.pdf",
            });

            const file = {
                originalname: "cpf.pdf",
                buffer: Buffer.from("file"),
                mimetype: "application/pdf",
            };

            const result = await uploadDriverDocumentService({
                driverId: "1",
                documentType: "cpf",
                file,
            });

            expect(uploadFileToBucket).toHaveBeenCalledWith(
                expect.objectContaining({
                    bucket: "documents",
                    file,
                    folder: "drivers/1/cpf",
                    isPublic: true,
                })
            );

            expect(result).toEqual({
                driver: {
                    id: "1",
                    cpf_file_url: "https://file-url.com/cpf.pdf",
                    cpf_file_path: "drivers/1/cpf/file.pdf",
                },
                documentType: "cpf",
                file: {
                    publicUrl: "https://file-url.com/cpf.pdf",
                    filePath: "drivers/1/cpf/file.pdf",
                },
            });
        });

        test("should delete previous file before uploading new one", async () => {
            const maybeSingle = jest.fn().mockResolvedValue({
                data: {
                    id: "1",
                    cpf_file_path: "drivers/1/cpf/old.pdf",
                },
                error: null,
            });

            const selectDriver = jest.fn(() => ({
                eq: jest.fn(() => ({ maybeSingle })),
            }));

            const singleUpdate = jest.fn().mockResolvedValue({
                data: {
                    id: "1",
                    cpf_file_url: "https://file-url.com/new.pdf",
                    cpf_file_path: "drivers/1/cpf/new.pdf",
                },
                error: null,
            });

            const update = jest.fn(() => ({
                eq: jest.fn(() => ({
                    select: jest.fn(() => ({ single: singleUpdate })),
                })),
            }));

            supabase.from.mockImplementation((table) => {
                if (table === "drivers") {
                    return {
                        select: selectDriver,
                        update,
                    };
                }
            });

            deleteFileFromBucket.mockResolvedValue({ success: true });
            uploadFileToBucket.mockResolvedValue({
                publicUrl: "https://file-url.com/new.pdf",
                filePath: "drivers/1/cpf/new.pdf",
            });

            const file = {
                originalname: "cpf.pdf",
                buffer: Buffer.from("file"),
                mimetype: "application/pdf",
            };

            await uploadDriverDocumentService({
                driverId: "1",
                documentType: "cpf",
                file,
            });

            expect(deleteFileFromBucket).toHaveBeenCalledWith({
                bucket: "documents",
                filePath: "drivers/1/cpf/old.pdf",
            });
        });

        test("should throw when driverId is missing", async () => {
            await expect(
                uploadDriverDocumentService({
                    documentType: "cpf",
                    file: { originalname: "a.pdf" },
                })
            ).rejects.toThrow("driverId is required");
        });

        test("should throw when documentType is invalid", async () => {
            await expect(
                uploadDriverDocumentService({
                    driverId: "1",
                    documentType: "invalid",
                    file: { originalname: "a.pdf" },
                })
            ).rejects.toThrow("invalid document type");
        });

        test("should throw when driver is not found", async () => {
            const maybeSingle = jest.fn().mockResolvedValue({
                data: null,
                error: null,
            });

            const selectDriver = jest.fn(() => ({
                eq: jest.fn(() => ({ maybeSingle })),
            }));

            supabase.from.mockImplementation((table) => {
                if (table === "drivers") {
                    return { select: selectDriver };
                }
            });

            await expect(
                uploadDriverDocumentService({
                    driverId: "1",
                    documentType: "cpf",
                    file: { originalname: "a.pdf" },
                })
            ).rejects.toThrow("Driver not found");
        });
    });

    describe("deleteDriverDocumentService", () => {
        test("should delete driver document and clear fields", async () => {
            const maybeSingle = jest.fn().mockResolvedValue({
                data: {
                    id: "1",
                    cpf_file_path: "drivers/1/cpf/file.pdf",
                },
                error: null,
            });

            const selectDriver = jest.fn(() => ({
                eq: jest.fn(() => ({ maybeSingle })),
            }));

            const singleUpdate = jest.fn().mockResolvedValue({
                data: {
                    id: "1",
                    cpf_file_url: null,
                    cpf_file_path: null,
                },
                error: null,
            });

            const update = jest.fn(() => ({
                eq: jest.fn(() => ({
                    select: jest.fn(() => ({ single: singleUpdate })),
                })),
            }));

            supabase.from.mockImplementation((table) => {
                if (table === "drivers") {
                    return {
                        select: selectDriver,
                        update,
                    };
                }
            });

            deleteFileFromBucket.mockResolvedValue({ success: true });

            const result = await deleteDriverDocumentService({
                driverId: "1",
                documentType: "cpf",
            });

            expect(deleteFileFromBucket).toHaveBeenCalledWith({
                bucket: "documents",
                filePath: "drivers/1/cpf/file.pdf",
            });

            expect(result).toEqual({
                driver: {
                    id: "1",
                    cpf_file_url: null,
                    cpf_file_path: null,
                },
                documentType: "cpf",
            });
        });

        test("should throw when document does not exist", async () => {
            const maybeSingle = jest.fn().mockResolvedValue({
                data: {
                    id: "1",
                    cpf_file_path: null,
                },
                error: null,
            });

            const selectDriver = jest.fn(() => ({
                eq: jest.fn(() => ({ maybeSingle })),
            }));

            supabase.from.mockImplementation((table) => {
                if (table === "drivers") {
                    return { select: selectDriver };
                }
            });

            await expect(
                deleteDriverDocumentService({
                    driverId: "1",
                    documentType: "cpf",
                })
            ).rejects.toThrow("document not found");
        });

        test("should throw when documentType is invalid", async () => {
            await expect(
                deleteDriverDocumentService({
                    driverId: "1",
                    documentType: "invalid",
                })
            ).rejects.toThrow("invalid document type");
        });

        test("should throw when driver is not found", async () => {
            const maybeSingle = jest.fn().mockResolvedValue({
                data: null,
                error: null,
            });

            const selectDriver = jest.fn(() => ({
                eq: jest.fn(() => ({ maybeSingle })),
            }));

            supabase.from.mockImplementation((table) => {
                if (table === "drivers") {
                    return { select: selectDriver };
                }
            });

            await expect(
                deleteDriverDocumentService({
                    driverId: "1",
                    documentType: "cpf",
                })
            ).rejects.toThrow("Driver not found");
        });
    });

    describe("deleteDriverService", () => {
        test("should delete driver by id", async () => {
            const eq = jest.fn().mockResolvedValue({ error: null });
            const del = jest.fn(() => ({ eq }));

            supabase.from.mockReturnValue({ delete: del });

            const result = await deleteDriverService("1");

            expect(del).toHaveBeenCalled();
            expect(eq).toHaveBeenCalledWith("id", "1");
            expect(result).toEqual({ success: true });
        });

        test("should throw when id is missing", async () => {
            await expect(deleteDriverService()).rejects.toThrow("id is required");
        });

        test("should throw when delete fails", async () => {
            const eq = jest.fn().mockResolvedValue({
                error: new Error("delete failed"),
            });
            const del = jest.fn(() => ({ eq }));

            supabase.from.mockReturnValue({ delete: del });

            await expect(deleteDriverService("1")).rejects.toThrow("delete failed");
        });
    });
});