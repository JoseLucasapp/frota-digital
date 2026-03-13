jest.mock("../../src/services/mechanic.service", () => ({
    createMechanicService: jest.fn(),
    getAllMechanicsService: jest.fn(),
    getMechanicByIdService: jest.fn(),
    updateMechanicService: jest.fn(),
    uploadMechanicDocumentService: jest.fn(),
    deleteMechanicDocumentService: jest.fn(),
    deleteMechanicService: jest.fn(),
}));

const {
    createMechanicService,
    getAllMechanicsService,
    getMechanicByIdService,
    updateMechanicService,
    uploadMechanicDocumentService,
    deleteMechanicDocumentService,
    deleteMechanicService,
} = require("../../src/services/mechanic.service");

const {
    createMechanicController,
    getAllMechanicsController,
    getMechanicByIdController,
    updateMechanicController,
    uploadMechanicDocumentController,
    deleteMechanicDocumentController,
    deleteMechanicController,
} = require("../../src/controllers/mechanic.controller");

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe("mechanic.controller", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("createMechanicController", () => {
        it("should return 400 when required fields are missing", async () => {
            const req = {
                body: {
                    name: "José",
                    email: "jose@email.com",
                },
            };
            const res = mockRes();

            await createMechanicController(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Name, email, phone and cnpj are required",
            });
        });

        it("should return 201 when mechanic is created", async () => {
            createMechanicService.mockResolvedValue({
                success: true,
                message: { id: "1" },
            });

            const req = {
                body: {
                    name: "José",
                    email: "jose@email.com",
                    phone: "83999999999",
                    cnpj: "123",
                },
            };
            const res = mockRes();

            await createMechanicController(req, res);

            expect(createMechanicService).toHaveBeenCalledWith(req.body);
            expect(res.status).toHaveBeenCalledWith(201);
        });

        it("should return 500 when service throws", async () => {
            createMechanicService.mockRejectedValue(new Error("create error"));

            const req = {
                body: {
                    name: "José",
                    email: "jose@email.com",
                    phone: "83999999999",
                    cnpj: "123",
                },
            };
            const res = mockRes();

            await createMechanicController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "create error",
            });
        });
    });

    describe("getAllMechanicsController", () => {
        it("should return 200 with mechanics list", async () => {
            getAllMechanicsService.mockResolvedValue({
                data: [{ id: "1" }],
                pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
            });

            const req = { query: { page: "1", limit: "10" } };
            const res = mockRes();

            await getAllMechanicsController(req, res);

            expect(getAllMechanicsService).toHaveBeenCalledWith(req.query);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it("should return 500 when service throws", async () => {
            getAllMechanicsService.mockRejectedValue(new Error("list error"));

            const req = { query: {} };
            const res = mockRes();

            await getAllMechanicsController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe("getMechanicByIdController", () => {
        it("should return 404 when mechanic is not found", async () => {
            getMechanicByIdService.mockResolvedValue(null);

            const req = { params: { id: "999" } };
            const res = mockRes();

            await getMechanicByIdController(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        it("should return 200 when mechanic is found", async () => {
            getMechanicByIdService.mockResolvedValue({ id: "1", name: "José" });

            const req = { params: { id: "1" } };
            const res = mockRes();

            await getMechanicByIdController(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
        });

        it("should return 500 when service throws", async () => {
            getMechanicByIdService.mockRejectedValue(new Error("db error"));

            const req = { params: { id: "1" } };
            const res = mockRes();

            await getMechanicByIdController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe("updateMechanicController", () => {
        it("should return 200 when mechanic is updated", async () => {
            updateMechanicService.mockResolvedValue({ id: "1", name: "Novo" });

            const req = {
                params: { id: "1" },
                body: { name: "Novo" },
            };
            const res = mockRes();

            await updateMechanicController(req, res);

            expect(updateMechanicService).toHaveBeenCalledWith("1", { name: "Novo" });
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it("should return 500 when service throws", async () => {
            updateMechanicService.mockRejectedValue(new Error("update error"));

            const req = {
                params: { id: "1" },
                body: { name: "Novo" },
            };
            const res = mockRes();

            await updateMechanicController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe("uploadMechanicDocumentController", () => {
        it("should return 400 when file is missing", async () => {
            const req = {
                params: { id: "1", documentType: "cnpj" },
                file: null,
            };
            const res = mockRes();

            await uploadMechanicDocumentController(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        it("should return 200 when upload succeeds", async () => {
            uploadMechanicDocumentService.mockResolvedValue({
                mechanic: { id: "1" },
                documentType: "cnpj",
                file: { publicUrl: "https://file-url.com/cnpj.pdf" },
            });

            const req = {
                params: { id: "1", documentType: "cnpj" },
                file: { originalname: "cnpj.pdf" },
            };
            const res = mockRes();

            await uploadMechanicDocumentController(req, res);

            expect(uploadMechanicDocumentService).toHaveBeenCalledWith({
                mechanicId: "1",
                documentType: "cnpj",
                file: req.file,
            });

            expect(res.status).toHaveBeenCalledWith(200);
        });

        it("should return 404 when mechanic is not found", async () => {
            uploadMechanicDocumentService.mockRejectedValue(new Error("Mechanic not found"));

            const req = {
                params: { id: "1", documentType: "cnpj" },
                file: { originalname: "cnpj.pdf" },
            };
            const res = mockRes();

            await uploadMechanicDocumentController(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        it("should return 400 when document type is invalid", async () => {
            uploadMechanicDocumentService.mockRejectedValue(new Error("invalid document type"));

            const req = {
                params: { id: "1", documentType: "invalid" },
                file: { originalname: "test.pdf" },
            };
            const res = mockRes();

            await uploadMechanicDocumentController(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    describe("deleteMechanicDocumentController", () => {
        it("should return 200 when delete succeeds", async () => {
            deleteMechanicDocumentService.mockResolvedValue({
                mechanic: { id: "1" },
                documentType: "cnpj",
            });

            const req = {
                params: { id: "1", documentType: "cnpj" },
            };
            const res = mockRes();

            await deleteMechanicDocumentController(req, res);

            expect(deleteMechanicDocumentService).toHaveBeenCalledWith({
                mechanicId: "1",
                documentType: "cnpj",
            });

            expect(res.status).toHaveBeenCalledWith(200);
        });

        it("should return 404 when document is not found", async () => {
            deleteMechanicDocumentService.mockRejectedValue(new Error("document not found"));

            const req = {
                params: { id: "1", documentType: "cnpj" },
            };
            const res = mockRes();

            await deleteMechanicDocumentController(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        it("should return 400 when document type is invalid", async () => {
            deleteMechanicDocumentService.mockRejectedValue(new Error("invalid document type"));

            const req = {
                params: { id: "1", documentType: "invalid" },
            };
            const res = mockRes();

            await deleteMechanicDocumentController(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        it("should return 404 when mechanic is not found", async () => {
            deleteMechanicDocumentService.mockRejectedValue(new Error("Mechanic not found"));

            const req = {
                params: { id: "1", documentType: "cnpj" },
            };
            const res = mockRes();

            await deleteMechanicDocumentController(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe("deleteMechanicController", () => {
        it("should return 200 when mechanic is deleted", async () => {
            deleteMechanicService.mockResolvedValue({ success: true });

            const req = { params: { id: "1" } };
            const res = mockRes();

            await deleteMechanicController(req, res);

            expect(deleteMechanicService).toHaveBeenCalledWith("1");
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it("should return 500 when service throws", async () => {
            deleteMechanicService.mockRejectedValue(new Error("delete error"));

            const req = { params: { id: "1" } };
            const res = mockRes();

            await deleteMechanicController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
});