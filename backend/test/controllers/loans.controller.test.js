jest.mock("../../src/services/loans.service", () => ({
    createLoansService: jest.fn(),
    getAllLoansService: jest.fn(),
    getLoanByIdService: jest.fn(),
    updateLoanService: jest.fn(),
    deleteLoanService: jest.fn(),
}));

const loansService = require("../../src/services/loans.service");

const {
    createLoanController,
    getAllLoansController,
    getLoanByIdController,
    updateLoanController,
    deleteLoanController,
} = require("../../src/controllers/loans.controller");

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe("loans.controller", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("createLoanController", () => {
        const validBody = {
            start_date: "2023-01-01",
            end_date: "2023-12-31",
            reason: "Loan reason",
            vehicle_id: "veh-1",
            driver_id: "drv-1",
        };

        test("should return 400 when required fields are missing", async () => {
            const req = {
                body: {
                    start_date: "2023-01-01",
                },
            };
            const res = mockRes();

            await createLoanController(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message:
                    "start_date, end_date, reason, vehicle_id and driver_id are required",
            });
            expect(loansService.createLoansService).not.toHaveBeenCalled();
        });

        test("should return 201 when loan is created", async () => {
            const created = { id: "1", ...validBody };
            loansService.createLoansService.mockResolvedValue(created);

            const req = { body: validBody };
            const res = mockRes();

            await createLoanController(req, res);

            expect(loansService.createLoansService).toHaveBeenCalledWith(validBody);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(created);
        });

        test("should return 500 when service throws", async () => {
            loansService.createLoansService.mockRejectedValue(new Error("db error"));

            const req = { body: validBody };
            const res = mockRes();

            await createLoanController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "db error",
            });
        });
    });

    describe("getAllLoansController", () => {
        test("should return 200 with loans list", async () => {
            const result = {
                data: [{ id: "1", reason: "Loan A" }],
                pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
            };

            loansService.getAllLoansService.mockResolvedValue(result);

            const req = {
                query: {
                    vehicle_id: "veh-1",
                    driver_id: "drv-1",
                },
            };
            const res = mockRes();

            await getAllLoansController(req, res);

            expect(loansService.getAllLoansService).toHaveBeenCalledWith({
                vehicle_id: "veh-1",
                driver_id: "drv-1",
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(result);
        });

        test("should return 500 when service throws", async () => {
            loansService.getAllLoansService.mockRejectedValue(new Error("db error"));

            const req = { query: {} };
            const res = mockRes();

            await getAllLoansController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "db error",
            });
        });
    });

    describe("getLoanByIdController", () => {
        test("should return 404 when loan is not found", async () => {
            loansService.getLoanByIdService.mockResolvedValue(null);

            const req = { params: { id: "999" } };
            const res = mockRes();

            await getLoanByIdController(req, res);

            expect(loansService.getLoanByIdService).toHaveBeenCalledWith("999");
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Loan not found",
            });
        });

        test("should return 200 when loan is found", async () => {
            const loan = { id: "1", reason: "Loan A" };
            loansService.getLoanByIdService.mockResolvedValue(loan);

            const req = { params: { id: "1" } };
            const res = mockRes();

            await getLoanByIdController(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: loan,
            });
        });

        test("should return 500 when service throws", async () => {
            loansService.getLoanByIdService.mockRejectedValue(new Error("db error"));

            const req = { params: { id: "1" } };
            const res = mockRes();

            await getLoanByIdController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "db error",
            });
        });
    });

    describe("updateLoanController", () => {
        test("should return 200 when loan is updated", async () => {
            const updated = { id: "1", reason: "Updated loan" };
            loansService.updateLoanService.mockResolvedValue(updated);

            const req = {
                params: { id: "1" },
                body: { reason: "Updated loan" },
            };
            const res = mockRes();

            await updateLoanController(req, res);

            expect(loansService.updateLoanService).toHaveBeenCalledWith("1", {
                reason: "Updated loan",
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: updated,
            });
        });

        test("should return 500 when service throws", async () => {
            loansService.updateLoanService.mockRejectedValue(new Error("db error"));

            const req = {
                params: { id: "1" },
                body: { reason: "Updated loan" },
            };
            const res = mockRes();

            await updateLoanController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "db error",
            });
        });
    });

    describe("deleteLoanController", () => {
        test("should return 200 when loan is deleted", async () => {
            loansService.deleteLoanService.mockResolvedValue({ success: true });

            const req = { params: { id: "1" } };
            const res = mockRes();

            await deleteLoanController(req, res);

            expect(loansService.deleteLoanService).toHaveBeenCalledWith("1");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: { success: true },
            });
        });

        test("should return 500 when service throws", async () => {
            loansService.deleteLoanService.mockRejectedValue(new Error("db error"));

            const req = { params: { id: "1" } };
            const res = mockRes();

            await deleteLoanController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "db error",
            });
        });
    });
});