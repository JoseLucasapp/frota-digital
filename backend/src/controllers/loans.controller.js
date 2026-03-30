const {
    createLoansService,
    getAllLoansService,
    getLoanByIdService,
    updateLoanService,
    deleteLoanService,
} = require("../services/loans.service");

const createLoanController = async (req, res) => {
    try {
        const data = req.body;

        if (!data.start_date || !data.vehicle_id || !data.driver_id) {
            return res.status(400).json({
                success: false,
                message: "start_date, vehicle_id and driver_id are required",
            });
        }

        const result = await createLoansService(data, req.user);
        return res.status(201).json(result);
    } catch (error) {
        return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
};

const getAllLoansController = async (req, res) => {
    try {
        const result = await getAllLoansService(req.query, req.user);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
};

const getLoanByIdController = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await getLoanByIdService(id, req.user);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Loan not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
};

const updateLoanController = async (req, res) => {
    try {
        const id = req.params.id;
        const data = req.body;
        const result = await updateLoanService(id, data, req.user);

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
};

const deleteLoanController = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await deleteLoanService(id, req.user);

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createLoanController,
    getAllLoansController,
    getLoanByIdController,
    updateLoanController,
    deleteLoanController,
};