jest.mock("../../src/services/driver.service", () => ({
    createDriverService: jest.fn(),
    getAllDriversService: jest.fn(),
    getDriverByIdService: jest.fn(),
    updateDriverService: jest.fn(),
    uploadDriverDocumentService: jest.fn(),
    deleteDriverDocumentService: jest.fn(),
    deleteDriverService: jest.fn(),
}));

const driverService = require("../../src/services/driver.service");

const {
    createDriverController,
    getAllDriversController,
    getDriverByIdController,
    updateDriverController,
    uploadDriverDocumentController,
    deleteDriverDocumentController,
    deleteDriverController,
} = require("../../src/controllers/driver.controller");

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe("driver.controller", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("createDriverController", () => {
        test("should return 400 when required fields are missing", async () => {
            const req = {
                body: {
                    name: "José",
                    email: "jose@email.com",
                },
            };
            const res = mockRes();

            await createDriverController(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Name, email, phone and cpf are required",
            });
            expect(driverService.createDriverService).not.toHaveBeenCalled();
        });

        test("should return 201 when driver is created", async () => {
            const req = {
                body: {
                    name: "José",
                    email: "jose@email.com",
                    phone: "83999999999",
                    cpf: "123",
                },
            };
            const res = mockRes();

            driverService.createDriverService.mockResolvedValue({
                success: true,
                data: { id: "1" },
            });

            await createDriverController(req, res);

            expect(driverService.createDriverService).toHaveBeenCalledWith(req.body);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: { id: "1" },
            });
        });

        test("should return 500 when service throws", async () => {
            const req = {
                body: {
                    name: "José",
                    email: "jose@email.com",
                    phone: "83999999999",
                    cpf: "123",
                },
            };
            const res = mockRes();

            driverService.createDriverService.mockRejectedValue(new Error("create error"));

            await createDriverController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "create error",
            });
        });
    });

    describe("getAllDriversController", () => {
        test("should return 200 with drivers list", async () => {
            const req = { query: { name: "Jose" } };
            const res = mockRes();

            driverService.getAllDriversService.mockResolvedValue({
                data: [{ id: "1" }],
                pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
            });

            await getAllDriversController(req, res);

            expect(driverService.getAllDriversService).toHaveBeenCalledWith(req.query);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        test("should return 500 when service throws", async () => {
            const req = { query: {} };
            const res = mockRes();

            driverService.getAllDriversService.mockRejectedValue(new Error("list error"));

            await getAllDriversController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "list error",
            });
        });
    });

    describe("getDriverByIdController", () => {
        test("should return 404 when driver is not found", async () => {
            const req = { params: { id: "999" } };
            const res = mockRes();

            driverService.getDriverByIdService.mockResolvedValue(null);

            await getDriverByIdController(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Driver not found",
            });
        });

        test("should return 200 when driver is found", async () => {
            const req = { params: { id: "1" } };
            const res = mockRes();

            driverService.getDriverByIdService.mockResolvedValue({ id: "1", name: "José" });

            await getDriverByIdController(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: { id: "1", name: "José" },
            });
        });

        test("should return 500 when service throws", async () => {
            const req = { params: { id: "1" } };
            const res = mockRes();

            driverService.getDriverByIdService.mockRejectedValue(new Error("db error"));

            await getDriverByIdController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "db error",
            });
        });
    });

    describe("updateDriverController", () => {
        test("should return 200 when driver is updated", async () => {
            const req = {
                params: { id: "1" },
                body: { name: "Novo" },
            };
            const res = mockRes();

            driverService.updateDriverService.mockResolvedValue({ id: "1", name: "Novo" });

            await updateDriverController(req, res);

            expect(driverService.updateDriverService).toHaveBeenCalledWith("1", {
                name: "Novo",
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: { id: "1", name: "Novo" },
            });
        });

        test("should return 500 when service throws", async () => {
            const req = {
                params: { id: "1" },
                body: { name: "Novo" },
            };
            const res = mockRes();

            driverService.updateDriverService.mockRejectedValue(new Error("update error"));

            await updateDriverController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "update error",
            });
        });
    });

    describe("uploadDriverDocumentController", () => {
        test("should return 400 when file is missing", async () => {
            const req = {
                params: { id: "1", documentType: "cpf" },
                file: null,
            };
            const res = mockRes();

            await uploadDriverDocumentController(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "file is required",
            });
        });

        test("should return 200 when upload succeeds", async () => {
            const req = {
                params: { id: "1", documentType: "cpf" },
                file: { originalname: "cpf.pdf" },
            };
            const res = mockRes();

            driverService.uploadDriverDocumentService.mockResolvedValue({
                driver: { id: "1" },
                documentType: "cpf",
                file: { publicUrl: "https://file-url.com/cpf.pdf" },
            });

            await uploadDriverDocumentController(req, res);

            expect(driverService.uploadDriverDocumentService).toHaveBeenCalledWith({
                driverId: "1",
                documentType: "cpf",
                file: req.file,
            });

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Document uploaded successfully",
                data: {
                    driver: { id: "1" },
                    documentType: "cpf",
                    file: { publicUrl: "https://file-url.com/cpf.pdf" },
                },
            });
        });

        test("should return 404 when driver is not found", async () => {
            const req = {
                params: { id: "1", documentType: "cpf" },
                file: { originalname: "cpf.pdf" },
            };
            const res = mockRes();

            driverService.uploadDriverDocumentService.mockRejectedValue(
                new Error("Driver not found")
            );

            await uploadDriverDocumentController(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Driver not found",
            });
        });

        test("should return 400 when document type is invalid", async () => {
            const req = {
                params: { id: "1", documentType: "invalid" },
                file: { originalname: "cpf.pdf" },
            };
            const res = mockRes();

            driverService.uploadDriverDocumentService.mockRejectedValue(
                new Error("invalid document type")
            );

            await uploadDriverDocumentController(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "invalid document type",
            });
        });
    });

    describe("deleteDriverDocumentController", () => {
        test("should return 200 when delete succeeds", async () => {
            const req = {
                params: { id: "1", documentType: "cpf" },
            };
            const res = mockRes();

            driverService.deleteDriverDocumentService.mockResolvedValue({
                driver: { id: "1" },
                documentType: "cpf",
            });

            await deleteDriverDocumentController(req, res);

            expect(driverService.deleteDriverDocumentService).toHaveBeenCalledWith({
                driverId: "1",
                documentType: "cpf",
            });

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Document deleted successfully",
                data: {
                    driver: { id: "1" },
                    documentType: "cpf",
                },
            });
        });

        test("should return 404 when document is not found", async () => {
            const req = {
                params: { id: "1", documentType: "cpf" },
            };
            const res = mockRes();

            driverService.deleteDriverDocumentService.mockRejectedValue(
                new Error("document not found")
            );

            await deleteDriverDocumentController(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "document not found",
            });
        });

        test("should return 400 when document type is invalid", async () => {
            const req = {
                params: { id: "1", documentType: "invalid" },
            };
            const res = mockRes();

            driverService.deleteDriverDocumentService.mockRejectedValue(
                new Error("invalid document type")
            );

            await deleteDriverDocumentController(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "invalid document type",
            });
        });

        test("should return 404 when driver is not found", async () => {
            const req = {
                params: { id: "1", documentType: "cpf" },
            };
            const res = mockRes();

            driverService.deleteDriverDocumentService.mockRejectedValue(
                new Error("Driver not found")
            );

            await deleteDriverDocumentController(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Driver not found",
            });
        });
    });

    describe("deleteDriverController", () => {
        test("should return 200 when driver is deleted", async () => {
            const req = { params: { id: "1" } };
            const res = mockRes();

            driverService.deleteDriverService.mockResolvedValue({ success: true });

            await deleteDriverController(req, res);

            expect(driverService.deleteDriverService).toHaveBeenCalledWith("1");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: { success: true },
            });
        });

        test("should return 500 when service throws", async () => {
            const req = { params: { id: "1" } };
            const res = mockRes();

            driverService.deleteDriverService.mockRejectedValue(new Error("delete error"));

            await deleteDriverController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "delete error",
            });
        });
    });
});