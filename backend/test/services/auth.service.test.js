jest.mock("../../src/config/supabase", () => ({
    from: jest.fn(),
}));

jest.mock("../../src/utils/hash", () => ({
    verifyPassword: jest.fn(),
}));

jest.mock("../../src/utils/jwt", () => ({
    createToken: jest.fn(),
}));

const supabase = require("../../src/config/supabase");
const { verifyPassword } = require("../../src/utils/hash");
const { createToken } = require("../../src/utils/jwt");

const {
    getProfileByUserId,
    loginService,
} = require("../../src/services/auth.service");

describe("auth.service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("getProfileByUserId", () => {
        test("should return admin profile when found in admins table", async () => {
            const maybeSingle = jest
                .fn()
                .mockResolvedValueOnce({
                    data: { id: "1", name: "Admin User" },
                    error: null,
                });

            const eq = jest.fn(() => ({ maybeSingle }));
            const select = jest.fn(() => ({ eq }));

            supabase.from.mockReturnValue({ select });

            const result = await getProfileByUserId("1");

            expect(supabase.from).toHaveBeenCalledWith("admins");
            expect(result).toEqual({
                role: "ADMIN",
                profile: { id: "1", name: "Admin User" },
            });
        });

        test("should return mechanic profile when not found in admins but found in mechanics", async () => {
            const adminsMaybeSingle = jest.fn().mockResolvedValue({
                data: null,
                error: null,
            });

            const mechanicsMaybeSingle = jest.fn().mockResolvedValue({
                data: { id: "2", name: "Mechanic User" },
                error: null,
            });

            supabase.from
                .mockReturnValueOnce({
                    select: jest.fn(() => ({
                        eq: jest.fn(() => ({ maybeSingle: adminsMaybeSingle })),
                    })),
                })
                .mockReturnValueOnce({
                    select: jest.fn(() => ({
                        eq: jest.fn(() => ({ maybeSingle: mechanicsMaybeSingle })),
                    })),
                });

            const result = await getProfileByUserId("2");

            expect(supabase.from).toHaveBeenNthCalledWith(1, "admins");
            expect(supabase.from).toHaveBeenNthCalledWith(2, "mechanics");
            expect(result).toEqual({
                role: "MECHANIC",
                profile: { id: "2", name: "Mechanic User" },
            });
        });

        test("should return null when user is not found in any table", async () => {
            const makeBuilder = () => ({
                select: jest.fn(() => ({
                    eq: jest.fn(() => ({
                        maybeSingle: jest.fn().mockResolvedValue({
                            data: null,
                            error: null,
                        }),
                    })),
                })),
            });

            supabase.from
                .mockReturnValueOnce(makeBuilder())
                .mockReturnValueOnce(makeBuilder())
                .mockReturnValueOnce(makeBuilder());

            const result = await getProfileByUserId("999");

            expect(result).toBeNull();
        });

        test("should throw when supabase returns error", async () => {
            const maybeSingle = jest.fn().mockResolvedValue({
                data: null,
                error: new Error("profile query failed"),
            });

            supabase.from.mockReturnValue({
                select: jest.fn(() => ({
                    eq: jest.fn(() => ({ maybeSingle })),
                })),
            });

            await expect(getProfileByUserId("1")).rejects.toThrow("profile query failed");
        });
    });

    describe("loginService", () => {
        test("should throw 400 when email or password is missing", async () => {
            await expect(loginService({ email: "", password: "" })).rejects.toMatchObject({
                message: "Email and password required",
                statusCode: 400,
            });
        });

        test("should login admin successfully", async () => {
            const foundUser = {
                id: "1",
                email: "admin@email.com",
                password_hash: "hashed-password",
                name: "Admin",
            };

            supabase.from.mockReturnValueOnce({
                select: jest.fn(() => ({
                    eq: jest.fn(() => ({
                        maybeSingle: jest.fn().mockResolvedValue({
                            data: foundUser,
                            error: null,
                        }),
                    })),
                })),
            });

            verifyPassword.mockResolvedValue(true);
            createToken.mockReturnValue("fake-jwt-token");

            const result = await loginService({
                email: "admin@email.com",
                password: "123456",
            });

            expect(supabase.from).toHaveBeenCalledWith("admins");
            expect(verifyPassword).toHaveBeenCalledWith("123456", "hashed-password");
            expect(createToken).toHaveBeenCalledWith({
                sub: "1",
                role: "ADMIN",
                email: "admin@email.com",
            });

            expect(result).toEqual({
                token: "fake-jwt-token",
                user: {
                    id: "1",
                    email: "admin@email.com",
                    name: "Admin",
                    role: "ADMIN",
                },
            });
        });

        test("should continue searching tables until finds user", async () => {
            supabase.from
                .mockReturnValueOnce({
                    select: jest.fn(() => ({
                        eq: jest.fn(() => ({
                            maybeSingle: jest.fn().mockResolvedValue({
                                data: null,
                                error: null,
                            }),
                        })),
                    })),
                })
                .mockReturnValueOnce({
                    select: jest.fn(() => ({
                        eq: jest.fn(() => ({
                            maybeSingle: jest.fn().mockResolvedValue({
                                data: {
                                    id: "2",
                                    email: "mec@email.com",
                                    password_hash: "hash",
                                    name: "Mechanic",
                                },
                                error: null,
                            }),
                        })),
                    })),
                });

            verifyPassword.mockResolvedValue(true);
            createToken.mockReturnValue("token-mechanic");

            const result = await loginService({
                email: "mec@email.com",
                password: "123456",
            });

            expect(supabase.from).toHaveBeenNthCalledWith(1, "admins");
            expect(supabase.from).toHaveBeenNthCalledWith(2, "mechanics");
            expect(result.user.role).toBe("MECHANIC");
        });

        test("should throw 401 when user is not found", async () => {
            const makeBuilder = () => ({
                select: jest.fn(() => ({
                    eq: jest.fn(() => ({
                        maybeSingle: jest.fn().mockResolvedValue({
                            data: null,
                            error: null,
                        }),
                    })),
                })),
            });

            supabase.from
                .mockReturnValueOnce(makeBuilder())
                .mockReturnValueOnce(makeBuilder())
                .mockReturnValueOnce(makeBuilder());

            await expect(
                loginService({
                    email: "notfound@email.com",
                    password: "123456",
                })
            ).rejects.toMatchObject({
                message: "Invalid credentials",
                statusCode: 401,
            });
        });

        test("should throw 401 when password is invalid", async () => {
            supabase.from.mockReturnValueOnce({
                select: jest.fn(() => ({
                    eq: jest.fn(() => ({
                        maybeSingle: jest.fn().mockResolvedValue({
                            data: {
                                id: "1",
                                email: "admin@email.com",
                                password_hash: "wrong-hash",
                            },
                            error: null,
                        }),
                    })),
                })),
            });

            verifyPassword.mockResolvedValue(false);

            await expect(
                loginService({
                    email: "admin@email.com",
                    password: "wrong-password",
                })
            ).rejects.toMatchObject({
                message: "Invalid credentials",
                statusCode: 401,
            });
        });

        test("should throw when supabase returns error", async () => {
            supabase.from.mockReturnValueOnce({
                select: jest.fn(() => ({
                    eq: jest.fn(() => ({
                        maybeSingle: jest.fn().mockResolvedValue({
                            data: null,
                            error: new Error("db failed"),
                        }),
                    })),
                })),
            });

            await expect(
                loginService({
                    email: "admin@email.com",
                    password: "123456",
                })
            ).rejects.toThrow("db failed");
        });
    });
});