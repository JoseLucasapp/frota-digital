jest.mock("jsonwebtoken", () => ({
    verify: jest.fn(),
    sign: jest.fn(),
}));

const jwt = require("jsonwebtoken");
const { requireAuth, createToken } = require("../../src/utils/jwt");

describe("jwt utils", () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env = {
            ...OLD_ENV,
            JWT_SECRET: "test-secret",
        };
    });

    afterAll(() => {
        process.env = OLD_ENV;
    });

    test("createToken should sign payload with secret and expiresIn 7d", () => {
        jwt.sign.mockReturnValue("fake-token");

        const payload = { sub: "1", role: "ADMIN" };
        const token = createToken(payload);

        expect(jwt.sign).toHaveBeenCalledWith(payload, "test-secret", {
            expiresIn: "7d",
        });
        expect(token).toBe("fake-token");
    });

    test("requireAuth should return 401 when token is missing", () => {
        const req = {
            headers: {},
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        const next = jest.fn();

        requireAuth(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: "Missing token" });
        expect(next).not.toHaveBeenCalled();
    });

    test("requireAuth should return 401 when token is invalid", () => {
        jwt.verify.mockImplementation(() => {
            throw new Error("invalid token");
        });

        const req = {
            headers: {
                authorization: "Bearer invalid-token",
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        const next = jest.fn();

        requireAuth(req, res, next);

        expect(jwt.verify).toHaveBeenCalledWith("invalid-token", "test-secret");
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: "Invalid or expired token" });
        expect(next).not.toHaveBeenCalled();
    });

    test("requireAuth should set req.user and req.auth and call next when token is valid", () => {
        const decoded = {
            sub: "1",
            email: "admin@email.com",
            role: "ADMIN",
        };

        jwt.verify.mockReturnValue(decoded);

        const req = {
            headers: {
                authorization: "Bearer valid-token",
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        const next = jest.fn();

        requireAuth(req, res, next);

        expect(jwt.verify).toHaveBeenCalledWith("valid-token", "test-secret");
        expect(req.user).toEqual(decoded);
        expect(req.auth).toEqual(decoded);
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });
});