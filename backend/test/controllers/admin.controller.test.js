jest.mock("../../src/services/admin.service", () => ({
    createAdminService: jest.fn(),
    getAllAdminsService: jest.fn(),
}));

const adminService = require("../../src/services/admin.service");

const {
    createAdminController,
    getAllAdminsController,
} = require("../../src/controllers/admin.controller");

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe("admin.controller", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("createAdminController", () => {
        const validBody = {
            name: "José",
            email: "jose@email.com",
            password: "123456",
            phone: "83999999999",
            institution: "Frota Digital",
            cnpj: "123",
        };

        test("should return 400 when required fields are missing", async () => {
            const req = {
                body: {
                    name: "José",
                    email: "jose@email.com",
                },
            };
            const res = mockRes();

            await createAdminController(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Name, email, password, institution and cnpj are required",
            });
            expect(adminService.createAdminService).not.toHaveBeenCalled();
        });

        test("should return 201 when admin is created", async () => {
            adminService.createAdminService.mockResolvedValue({
                success: true,
                message: "Admin created successfully",
            });

            const req = { body: validBody };
            const res = mockRes();

            await createAdminController(req, res);

            expect(adminService.createAdminService).toHaveBeenCalledWith(validBody);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Admin created successfully",
            });
        });

        test("should return 500 when service throws", async () => {
            adminService.createAdminService.mockRejectedValue(new Error("db error"));

            const req = { body: validBody };
            const res = mockRes();

            await createAdminController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "db error",
            });
        });
    });

    describe("getAllAdminsController", () => {
        test("should return 200 with admins list", async () => {
            const serviceResult = {
                data: [{ id: "1", name: "José" }],
                page: 1,
                pageSize: 10,
                total: 1,
                totalPages: 1,
            };

            adminService.getAllAdminsService.mockResolvedValue(serviceResult);

            const req = {
                query: {
                    email: "jose@email.com",
                    name: "Jos",
                    cnpj: "123",
                    institution: "Frota",
                    page: "1",
                    pageSize: "10",
                },
            };
            const res = mockRes();

            await getAllAdminsController(req, res);

            expect(adminService.getAllAdminsService).toHaveBeenCalledWith({
                email: "jose@email.com",
                name: "Jos",
                cnpj: "123",
                institution: "Frota",
                page: "1",
                pageSize: "10",
            });

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: serviceResult,
            });
        });

        test("should return 500 when service throws", async () => {
            adminService.getAllAdminsService.mockRejectedValue(new Error("db error"));

            const req = { query: {} };
            const res = mockRes();

            await getAllAdminsController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "db error",
            });
        });
    });
});