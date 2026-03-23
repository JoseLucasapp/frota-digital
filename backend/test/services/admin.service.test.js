jest.mock("../../src/config/supabase", () => ({
    from: jest.fn(),
}));

jest.mock("../../src/utils/hash", () => ({
    hashPassword: jest.fn(),
}));

const supabase = require("../../src/config/supabase");
const { hashPassword } = require("../../src/utils/hash");

const {
    createAdminService,
    getAllAdminsService,
} = require("../../src/services/admin.service");

describe("admin.service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("createAdminService", () => {
        test("should hash password, insert admin and return success message", async () => {
            hashPassword.mockResolvedValue("hashed-password");

            const insert = jest.fn().mockResolvedValue({
                error: null,
            });

            supabase.from.mockReturnValue({ insert });

            const payload = {
                name: "José",
                email: "jose@email.com",
                password: "123456",
                phone: "83999999999",
                institution: "Frota Digital",
                cnpj: "123",
            };

            const result = await createAdminService({ ...payload });

            expect(hashPassword).toHaveBeenCalledWith("123456");
            expect(supabase.from).toHaveBeenCalledWith("admins");
            expect(insert).toHaveBeenCalledWith({
                name: "José",
                email: "jose@email.com",
                phone: "83999999999",
                institution: "Frota Digital",
                cnpj: "123",
                password_hash: "hashed-password",
            });

            expect(result).toEqual({
                success: true,
                message: "Admin created successfully",
            });
        });

        test("should throw when insert fails", async () => {
            hashPassword.mockResolvedValue("hashed-password");

            const insert = jest.fn().mockResolvedValue({
                error: new Error("insert failed"),
            });

            supabase.from.mockReturnValue({ insert });

            await expect(
                createAdminService({
                    name: "José",
                    email: "jose@email.com",
                    password: "123456",
                    phone: "83999999999",
                    institution: "Frota Digital",
                    cnpj: "123",
                })
            ).rejects.toThrow("insert failed");
        });
    });

    describe("getAllAdminsService", () => {
        test("should apply filters and pagination", async () => {
            const fakeRows = [
                { id: "1", name: "José" },
                { id: "2", name: "Maria" },
            ];

            const builder = {
                select: jest.fn(() => builder),
                eq: jest.fn(() => builder),
                ilike: jest.fn(() => builder),
                range: jest.fn(() =>
                    Promise.resolve({
                        data: fakeRows,
                        error: null,
                        count: 2,
                    })
                ),
            };

            supabase.from.mockReturnValue(builder);

            const result = await getAllAdminsService({
                email: "jose@email.com",
                name: "Jos",
                cnpj: "123",
                institution: "Frota",
                page: "2",
                pageSize: "5",
            });

            expect(supabase.from).toHaveBeenCalledWith("admins");
            expect(builder.select).toHaveBeenCalledWith("*", { count: "exact" });
            expect(builder.eq).toHaveBeenCalledWith("email", "jose@email.com");
            expect(builder.eq).toHaveBeenCalledWith("cnpj", "123");
            expect(builder.ilike).toHaveBeenCalledWith("name", "%Jos%");
            expect(builder.ilike).toHaveBeenCalledWith("institution", "%Frota%");
            expect(builder.range).toHaveBeenCalledWith(5, 9);

            expect(result).toEqual({
                data: fakeRows,
                page: 2,
                pageSize: 5,
                total: 2,
                totalPages: 1,
            });
        });

        test("should use default pagination", async () => {
            const builder = {
                select: jest.fn(() => builder),
                eq: jest.fn(() => builder),
                ilike: jest.fn(() => builder),
                range: jest.fn(() =>
                    Promise.resolve({
                        data: [],
                        error: null,
                        count: 0,
                    })
                ),
            };

            supabase.from.mockReturnValue(builder);

            const result = await getAllAdminsService({});

            expect(builder.range).toHaveBeenCalledWith(0, 9);
            expect(result).toEqual({
                data: [],
                page: 1,
                pageSize: 10,
                total: 0,
                totalPages: 0,
            });
        });

        test("should clamp pageSize to 100", async () => {
            const builder = {
                select: jest.fn(() => builder),
                eq: jest.fn(() => builder),
                ilike: jest.fn(() => builder),
                range: jest.fn(() =>
                    Promise.resolve({
                        data: [],
                        error: null,
                        count: 0,
                    })
                ),
            };

            supabase.from.mockReturnValue(builder);

            const result = await getAllAdminsService({
                page: "1",
                pageSize: "1000",
            });

            expect(builder.range).toHaveBeenCalledWith(0, 99);
            expect(result.pageSize).toBe(100);
        });

        test("should throw when query fails", async () => {
            const builder = {
                select: jest.fn(() => builder),
                eq: jest.fn(() => builder),
                ilike: jest.fn(() => builder),
                range: jest.fn(() =>
                    Promise.resolve({
                        data: null,
                        error: new Error("query failed"),
                        count: 0,
                    })
                ),
            };

            supabase.from.mockReturnValue(builder);

            await expect(getAllAdminsService({})).rejects.toThrow("query failed");
        });
    });
});