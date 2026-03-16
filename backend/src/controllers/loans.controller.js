const { createLoansService,getLoanByIdService,getAllLoansService,updateLoanService,deleteLoanService } = require("../services/loans.service");


const createLoanController = async (req, res) => {
    try {
        const data = req.body;

        if (
            !data.start_date ||
            !data.end_date ||
            !data.reason ||
            !data.vehicle_id ||
            !data.driver_id
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "start_date, end_date, reason, vehicle_id and driver_id are required",
            });
        }
        const result = await createLoansService(data);
        res.status(201).json(result);

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const getAllLoansController = async (req, res) => {
    try {
        const query = req.query;
        const result = await getAllLoansService(query);
        res.status(200).json(result);

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const getLoanByIdController = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await getLoanByIdService(id);
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
        res.status(500).json({ success: false, message: error.message });
    }
}

const updateLoanController = async (req, res) => {
    try {
        const id = req.params.id;
        const data = req.body;
        const result = await updateLoanService(id, data);

        return res.status(200).json({
            success: true,
            data: result,
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const deleteLoanController = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await deleteLoanService(id);

        return res.status(200).json({
            success: true,
            data: result,
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = { createLoanController, getAllLoansController, getLoanByIdController, updateLoanController, deleteLoanController }