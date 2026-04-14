const { attachUser } = require("../../src/middlewares/attachUser.middleware");
const { getProfileByUserId } = require("../../src/services/auth.service");

jest.mock("../../src/services/auth.service", () => ({
    getProfileByUserId: jest.fn(),
}));

describe("attachUser middleware", () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
        jest.clearAllMocks();

        req = {
            auth: {},
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };

        next = jest.fn();
    });

    test("should return 401 when token has no id, userId or sub", async () => {
        req.auth = {};

        await attachUser(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            error: "Missing sub in token",
        });
        expect(next).not.toHaveBeenCalled();
    });

    test("should use req.auth.id when available", async () => {
        req.auth = {
            id: "user-1",
            email: "user1@email.com",
        };

        getProfileByUserId.mockResolvedValue({
            role: "ADMIN",
            profile: { id: "user-1", name: "Admin One" },
        });

        await attachUser(req, res, next);

        expect(getProfileByUserId).toHaveBeenCalledWith("user-1");
        expect(req.user).toEqual({
            id: "user-1",
            email: "user1@email.com",
            role: "ADMIN",
            profile: { id: "user-1", name: "Admin One" },
        });
        expect(next).toHaveBeenCalled();
    });

    test("should use req.auth.userId when id is not available", async () => {
        req.auth = {
            userId: "user-2",
            email: "user2@email.com",
        };

        getProfileByUserId.mockResolvedValue({
            role: "DRIVER",
            profile: { id: "user-2", name: "Driver Two" },
        });

        await attachUser(req, res, next);

        expect(getProfileByUserId).toHaveBeenCalledWith("user-2");
        expect(req.user).toEqual({
            id: "user-2",
            email: "user2@email.com",
            role: "DRIVER",
            profile: { id: "user-2", name: "Driver Two" },
        });
        expect(next).toHaveBeenCalled();
    });

    test("should use req.auth.sub when id and userId are not available", async () => {
        req.auth = {
            sub: "user-3",
            email: "user3@email.com",
        };

        getProfileByUserId.mockResolvedValue({
            role: "MECHANIC",
            profile: { id: "user-3", name: "Mechanic Three" },
        });

        await attachUser(req, res, next);

        expect(getProfileByUserId).toHaveBeenCalledWith("user-3");
        expect(req.user).toEqual({
            id: "user-3",
            email: "user3@email.com",
            role: "MECHANIC",
            profile: { id: "user-3", name: "Mechanic Three" },
        });
        expect(next).toHaveBeenCalled();
    });

    test("should return 403 when user has no profile", async () => {
        req.auth = {
            sub: "user-4",
            email: "user4@email.com",
        };

        getProfileByUserId.mockResolvedValue(null);

        await attachUser(req, res, next);

        expect(getProfileByUserId).toHaveBeenCalledWith("user-4");
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            error: "User has no profile (driver/mechanic/admin)",
        });
        expect(next).not.toHaveBeenCalled();
    });

    test("should return 500 when getProfileByUserId throws", async () => {
        req.auth = {
            sub: "user-5",
            email: "user5@email.com",
        };

        getProfileByUserId.mockRejectedValue(new Error("db failed"));

        await attachUser(req, res, next);

        expect(getProfileByUserId).toHaveBeenCalledWith("user-5");
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: "Failed to load profile",
        });
        expect(next).not.toHaveBeenCalled();
    });
});