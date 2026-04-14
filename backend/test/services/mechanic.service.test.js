const supabase = require("../../src/config/supabase");
const { hashPassword } = require("../../src/utils/hash");
const { sendEmail } = require("../../src/utils/sentEmail");
const {
    uploadFileToBucket,
    deleteFileFromBucket,
} = require("../../src/utils/supabaseBucket");
const { MECHANIC_STATUS } = require("../../src/types/mechanic.status.types");

const {
    createMechanicService,
    getAllMechanicsService,
    getMechanicByIdService,
    updateMechanicService,
    deleteMechanicService,
    uploadMechanicDocumentService,
    deleteMechanicDocumentService,
} = require("../../src/services/mechanic.service");

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

describe("mechanic.service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("createMechanicService", () => {
        it("should create a mechanic with ACTIVE status", async () => {
            const single = jest.fn().mockResolvedValue({
                data: { id: "1", name: "José", status: MECHANIC_STATUS.ACTIVE },
                error: null,
            });

            const select = jest.fn(() => ({ single }));
            const insert = jest.fn(() => ({ select }));

            supabase.from.mockReturnValue({ insert });

            const payload = {
                name: "José",
                email: "jose@email.com",
                phone: "83999999999",
                cnpj: "123",
            };

            const result = await createMechanicService(payload);

            expect(supabase.from).toHaveBeenCalledWith("mechanics");
            expect(insert).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: "José",
                    email: "jose@email.com",
                    status: MECHANIC_STATUS.ACTIVE,
                })
            );

            expect(sendEmail).toHaveBeenCalledWith(
                "jose@email.com",
                "Conta mecânico cadastrada"
            );

            expect(result).toEqual({
                success: true,
                data: { id: "1", name: "José", status: MECHANIC_STATUS.ACTIVE },
            });
        });

        it("should throw when supabase returns error", async () => {
            const single = jest.fn().mockResolvedValue({
                data: null,
                error: new Error("insert failed"),
            });

            const select = jest.fn(() => ({ single }));
            const insert = jest.fn(() => ({ select }));

            supabase.from.mockReturnValue({ insert });

            await expect(
                createMechanicService({
                    name: "José",
                    email: "jose@email.com",
                    phone: "83999999999",
                    cnpj: "123",
                })
            ).rejects.toThrow("insert failed");
        });
    });

    describe("getAllMechanicsService", () => {
        it("should return paginated mechanics ordered by created_at desc by default", async () => {
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

            const result = await getAllMechanicsService({
                page: 1,
                limit: 10,
                cnpj: "123",
                name: "Jos",
            });

            expect(select).toHaveBeenCalledWith("*", { count: "exact" });
            expect(eq).toHaveBeenCalledWith("cnpj", "123");
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

        it("should order by status when sortBy=status", async () => {
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

            const result = await getAllMechanicsService({
                sortBy: "status",
                sortOrder: "asc",
            });

            expect(firstOrder).toHaveBeenCalledWith("status", { ascending: true });
            expect(secondOrder).toHaveBeenCalledWith("created_at", { ascending: false });
            expect(result.data).toEqual([{ id: "1", status: "ACTIVE" }]);
        });

        it("should throw when query fails", async () => {
            const range = jest.fn().mockResolvedValue({
                data: null,
                error: new Error("query failed"),
                count: 0,
            });

            const order = jest.fn(() => ({ range }));
            const select = jest.fn(() => ({ order, range }));

            supabase.from.mockReturnValue({ select });

            await expect(getAllMechanicsService()).rejects.toThrow("query failed");
        });

        it("should order by created_at when sortBy is not status", async () => {
            const range = jest.fn().mockResolvedValue({
                data: [{ id: "1", name: "José" }],
                error: null,
                count: 1,
            });

            const order = jest.fn(() => ({ range }));
            const select = jest.fn(() => ({ order, range }));

            supabase.from.mockReturnValue({ select });

            const result = await getAllMechanicsService({
                page: 1,
                limit: 10,
                sortBy: "created_at",
                sortOrder: "asc",
            });

            expect(order).toHaveBeenCalledWith("created_at", { ascending: true });
            expect(range).toHaveBeenCalledWith(0, 9);
            expect(result.pagination.total).toBe(1);
        });
    });

    describe("getMechanicByIdService", () => {
        it("should return mechanic by id", async () => {
            const maybeSingle = jest.fn().mockResolvedValue({
                data: { id: "1", name: "José" },
                error: null,
            });

            const eq = jest.fn(() => ({ maybeSingle }));
            const select = jest.fn(() => ({ eq }));

            supabase.from.mockReturnValue({ select });

            const result = await getMechanicByIdService("1");

            expect(select).toHaveBeenCalledWith("*");
            expect(eq).toHaveBeenCalledWith("id", "1");
            expect(result).toEqual({ id: "1", name: "José" });
        });

        it("should return null when mechanic is not found", async () => {
            const maybeSingle = jest.fn().mockResolvedValue({
                data: null,
                error: null,
            });

            const eq = jest.fn(() => ({ maybeSingle }));
            const select = jest.fn(() => ({ eq }));

            supabase.from.mockReturnValue({ select });

            const result = await getMechanicByIdService("999");

            expect(result).toBeNull();
        });

        it("should throw when id is missing", async () => {
            await expect(getMechanicByIdService()).rejects.toThrow("id is required");
        });

        it("should throw when query fails", async () => {
            const maybeSingle = jest.fn().mockResolvedValue({
                data: null,
                error: new Error("query failed"),
            });

            const eq = jest.fn(() => ({ maybeSingle }));
            const select = jest.fn(() => ({ eq }));

            supabase.from.mockReturnValue({ select });

            await expect(getMechanicByIdService("1")).rejects.toThrow("query failed");
        });
    });

    describe("updateMechanicService", () => {
        it("should hash password before updating", async () => {
            hashPassword.mockResolvedValue("hashed-password");

            const single = jest.fn().mockResolvedValue({
                data: { id: "1", password_hash: "hashed-password" },
                error: null,
            });

            const select = jest.fn(() => ({ single }));
            const eq = jest.fn(() => ({ select }));
            const update = jest.fn(() => ({ eq }));

            supabase.from.mockReturnValue({ update });

            const result = await updateMechanicService("1", {
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

        it("should update without password", async () => {
            const single = jest.fn().mockResolvedValue({
                data: { id: "1", name: "Novo nome" },
                error: null,
            });

            const select = jest.fn(() => ({ single }));
            const eq = jest.fn(() => ({ select }));
            const update = jest.fn(() => ({ eq }));

            supabase.from.mockReturnValue({ update });

            const result = await updateMechanicService("1", { name: "Novo nome" });

            expect(hashPassword).not.toHaveBeenCalled();
            expect(update).toHaveBeenCalledWith({ name: "Novo nome" });
            expect(result).toEqual({ id: "1", name: "Novo nome" });
        });

        it("should throw when id is missing", async () => {
            await expect(updateMechanicService()).rejects.toThrow("id is required");
        });

        it("should throw when data is missing", async () => {
            await expect(updateMechanicService("1")).rejects.toThrow("data is required");
        });

        it("should throw when update fails", async () => {
            const single = jest.fn().mockResolvedValue({
                data: null,
                error: new Error("update failed"),
            });

            const select = jest.fn(() => ({ single }));
            const eq = jest.fn(() => ({ select }));
            const update = jest.fn(() => ({ eq }));

            supabase.from.mockReturnValue({ update });

            await expect(
                updateMechanicService("1", { name: "Teste" })
            ).rejects.toThrow("update failed");
        });
    });

    describe("deleteMechanicService", () => {
        it("should delete mechanic by id", async () => {
            const eq = jest.fn().mockResolvedValue({ error: null });
            const del = jest.fn(() => ({ eq }));

            supabase.from.mockReturnValue({ delete: del });

            const result = await deleteMechanicService("1");

            expect(eq).toHaveBeenCalledWith("id", "1");
            expect(result).toEqual({ success: true });
        });

        it("should throw when id is missing", async () => {
            await expect(deleteMechanicService()).rejects.toThrow("id is required");
        });

        it("should throw when delete fails", async () => {
            const eq = jest.fn().mockResolvedValue({
                error: new Error("delete failed"),
            });
            const del = jest.fn(() => ({ eq }));

            supabase.from.mockReturnValue({ delete: del });

            await expect(deleteMechanicService("1")).rejects.toThrow("delete failed");
        });
    });

    describe("uploadMechanicDocumentService", () => {
        it("should upload cnpj document and update mechanic", async () => {
            const maybeSingle = jest.fn().mockResolvedValue({
                data: { id: "1", cnpj_file_path: null },
                error: null,
            });

            const selectMechanic = jest.fn(() => ({
                eq: jest.fn(() => ({ maybeSingle })),
            }));

            const singleUpdate = jest.fn().mockResolvedValue({
                data: {
                    id: "1",
                    cnpj_file_url: "https://file-url.com/cnpj.pdf",
                    cnpj_file_path: "mechanics/1/cnpj/file.pdf",
                },
                error: null,
            });

            const update = jest.fn(() => ({
                eq: jest.fn(() => ({
                    select: jest.fn(() => ({ single: singleUpdate })),
                })),
            }));

            supabase.from.mockImplementation((table) => {
                if (table === "mechanics") {
                    return {
                        select: selectMechanic,
                        update,
                    };
                }
            });

            uploadFileToBucket.mockResolvedValue({
                publicUrl: "https://file-url.com/cnpj.pdf",
                filePath: "mechanics/1/cnpj/file.pdf",
            });

            const file = {
                originalname: "cnpj.pdf",
                buffer: Buffer.from("file"),
                mimetype: "application/pdf",
            };

            const result = await uploadMechanicDocumentService({
                mechanicId: "1",
                documentType: "cnpj",
                file,
            });

            expect(uploadFileToBucket).toHaveBeenCalledWith(
                expect.objectContaining({
                    bucket: "documents",
                    file,
                    folder: "mechanics/1/cnpj",
                    isPublic: true,
                })
            );

            expect(result.documentType).toBe("cnpj");
        });

        it("should delete previous file before uploading new one", async () => {
            const maybeSingle = jest.fn().mockResolvedValue({
                data: {
                    id: "1",
                    cnpj_file_path: "mechanics/1/cnpj/old.pdf",
                },
                error: null,
            });

            const selectMechanic = jest.fn(() => ({
                eq: jest.fn(() => ({ maybeSingle })),
            }));

            const singleUpdate = jest.fn().mockResolvedValue({
                data: {
                    id: "1",
                    cnpj_file_url: "https://file-url.com/new.pdf",
                    cnpj_file_path: "mechanics/1/cnpj/new.pdf",
                },
                error: null,
            });

            const update = jest.fn(() => ({
                eq: jest.fn(() => ({
                    select: jest.fn(() => ({ single: singleUpdate })),
                })),
            }));

            supabase.from.mockImplementation((table) => {
                if (table === "mechanics") {
                    return {
                        select: selectMechanic,
                        update,
                    };
                }
            });

            deleteFileFromBucket.mockResolvedValue({ success: true });

            uploadFileToBucket.mockResolvedValue({
                publicUrl: "https://file-url.com/new.pdf",
                filePath: "mechanics/1/cnpj/new.pdf",
            });

            const file = {
                originalname: "cnpj.pdf",
                buffer: Buffer.from("file"),
                mimetype: "application/pdf",
            };

            await uploadMechanicDocumentService({
                mechanicId: "1",
                documentType: "cnpj",
                file,
            });

            expect(deleteFileFromBucket).toHaveBeenCalledWith({
                bucket: "documents",
                filePath: "mechanics/1/cnpj/old.pdf",
            });
        });

        it("should throw when mechanicId is missing", async () => {
            await expect(
                uploadMechanicDocumentService({
                    documentType: "cnpj",
                    file: { originalname: "a.pdf" },
                })
            ).rejects.toThrow("mechanicId is required");
        });

        it("should throw when documentType is invalid", async () => {
            await expect(
                uploadMechanicDocumentService({
                    mechanicId: "1",
                    documentType: "invalid",
                    file: { originalname: "a.pdf" },
                })
            ).rejects.toThrow("invalid document type");
        });

        it("should throw when mechanic is not found", async () => {
            const maybeSingle = jest.fn().mockResolvedValue({
                data: null,
                error: null,
            });

            const selectMechanic = jest.fn(() => ({
                eq: jest.fn(() => ({ maybeSingle })),
            }));

            supabase.from.mockImplementation((table) => {
                if (table === "mechanics") {
                    return { select: selectMechanic };
                }
            });

            await expect(
                uploadMechanicDocumentService({
                    mechanicId: "1",
                    documentType: "cnpj",
                    file: { originalname: "a.pdf" },
                })
            ).rejects.toThrow("Mechanic not found");
        });
    });

    describe("deleteMechanicDocumentService", () => {
        it("should delete mechanic document and clear fields", async () => {
            const maybeSingle = jest.fn().mockResolvedValue({
                data: {
                    id: "1",
                    cnpj_file_path: "mechanics/1/cnpj/file.pdf",
                },
                error: null,
            });

            const selectMechanic = jest.fn(() => ({
                eq: jest.fn(() => ({ maybeSingle })),
            }));

            const singleUpdate = jest.fn().mockResolvedValue({
                data: {
                    id: "1",
                    cnpj_file_url: null,
                    cnpj_file_path: null,
                },
                error: null,
            });

            const update = jest.fn(() => ({
                eq: jest.fn(() => ({
                    select: jest.fn(() => ({ single: singleUpdate })),
                })),
            }));

            supabase.from.mockImplementation((table) => {
                if (table === "mechanics") {
                    return {
                        select: selectMechanic,
                        update,
                    };
                }
            });

            deleteFileFromBucket.mockResolvedValue({ success: true });

            const result = await deleteMechanicDocumentService({
                mechanicId: "1",
                documentType: "cnpj",
            });

            expect(deleteFileFromBucket).toHaveBeenCalledWith({
                bucket: "documents",
                filePath: "mechanics/1/cnpj/file.pdf",
            });

            expect(result.documentType).toBe("cnpj");
        });

        it("should throw when document does not exist", async () => {
            const maybeSingle = jest.fn().mockResolvedValue({
                data: {
                    id: "1",
                    cnpj_file_path: null,
                },
                error: null,
            });

            const selectMechanic = jest.fn(() => ({
                eq: jest.fn(() => ({ maybeSingle })),
            }));

            supabase.from.mockImplementation((table) => {
                if (table === "mechanics") {
                    return { select: selectMechanic };
                }
            });

            await expect(
                deleteMechanicDocumentService({
                    mechanicId: "1",
                    documentType: "cnpj",
                })
            ).rejects.toThrow("document not found");
        });

        it("should throw when documentType is invalid", async () => {
            await expect(
                deleteMechanicDocumentService({
                    mechanicId: "1",
                    documentType: "invalid",
                })
            ).rejects.toThrow("invalid document type");
        });

        it("should throw when mechanic is not found", async () => {
            const maybeSingle = jest.fn().mockResolvedValue({
                data: null,
                error: null,
            });

            const selectMechanic = jest.fn(() => ({
                eq: jest.fn(() => ({ maybeSingle })),
            }));

            supabase.from.mockImplementation((table) => {
                if (table === "mechanics") {
                    return { select: selectMechanic };
                }
            });

            await expect(
                deleteMechanicDocumentService({
                    mechanicId: "1",
                    documentType: "cnpj",
                })
            ).rejects.toThrow("Mechanic not found");
        });
    });
});