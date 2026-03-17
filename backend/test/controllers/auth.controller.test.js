jest.mock("../../src/services/auth.service.js", () => ({
    loginService: jest.fn(),
}));

const { loginService } = require("../../src/services/auth.service.js");
const { loginController } = require("../../src/controllers/auth.controller");

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe("auth.controller", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("loginController", () => {
        test("should return login result when credentials are valid", async () => {
            loginService.mockResolvedValue({
                success: true,
                token: "fake-jwt-token",
                user: {
                    id: "1",
                    email: "user@email.com",
                },
            });

            const req = {
                body: {
                    email: "user@email.com",
                    password: "123456",
                },
            };
            const res = mockRes();

            await loginController(req, res);

            expect(loginService).toHaveBeenCalledWith({
                email: "user@email.com",
                password: "123456",
            });

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                token: "fake-jwt-token",
                user: {
                    id: "1",
                    email: "user@email.com",
                },
            });

            expect(res.status).not.toHaveBeenCalled();
        });

        test("should return error status and message when service throws known error", async () => {
            const error = new Error("Invalid credentials");
            error.statusCode = 401;

            loginService.mockRejectedValue(error);

            const req = {
                body: {
                    email: "user@email.com",
                    password: "wrong-password",
                },
            };
            const res = mockRes();

            await loginController(req, res);

            expect(loginService).toHaveBeenCalledWith({
                email: "user@email.com",
                password: "wrong-password",
            });

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Invalid credentials",
            });
        });

        test("should return 500 when service throws error without statusCode", async () => {
            loginService.mockRejectedValue(new Error("Unexpected error"));

            const req = {
                body: {
                    email: "user@email.com",
                    password: "123456",
                },
            };
            const res = mockRes();

            await loginController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Unexpected error",
            });
        });

        test("should pass undefined values to service if body is missing fields", async () => {
            loginService.mockResolvedValue({
                success: true,
            });

            const req = {
                body: {},
            };
            const res = mockRes();

            await loginController(req, res);

            expect(loginService).toHaveBeenCalledWith({
                email: undefined,
                password: undefined,
            });

            expect(res.json).toHaveBeenCalledWith({
                success: true,
            });
        });
    });
});