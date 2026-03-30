const {
    createFuelingService,
    getAllFuelingsService,
    getFuelingByIdService,
    updateFuelingService,
    uploadFuelingReceiptService,
    deleteFuelingReceiptService,
    deleteFuelingService,
} = require("../services/fueling.service");

const createFuelingController = async (req, res) => {
    try {
        const data = req.body;

        if (
            !data.vehicle_id ||
            !data.fuel_type ||
            data.liters == null ||
            data.price_per_liter == null ||
            data.current_km == null ||
            !data.station
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "vehicle_id, fuel_type, liters, price_per_liter, current_km and station are required",
            });
        }

        const result = req.user ? await createFuelingService(data, req.user) : await createFuelingService(data);
        return res.status(201).json(result);
    } catch (error) {
        return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
};

const getAllFuelingsController = async (req, res) => {
    try {
        const result = req.user ? await getAllFuelingsService(req.query, req.user) : await getAllFuelingsService(req.query);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
};

const getFuelingByIdController = async (req, res) => {
    try {
        const id = req.params.id;
        const result = req.user ? await getFuelingByIdService(id, req.user) : await getFuelingByIdService(id);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Fueling not found",
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

const updateFuelingController = async (req, res) => {
    try {
        const id = req.params.id;
        const data = req.body;
        const result = req.user ? await updateFuelingService(id, data, req.user) : await updateFuelingService(id, data);

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
};

const uploadFuelingReceiptController = async (req, res) => {
    try {
        const { id } = req.params;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "file is required",
            });
        }

        const result = await uploadFuelingReceiptService({
            fuelingId: id,
            file: req.file,
            ...(req.user ? { user: req.user } : {}),
        });

        return res.status(200).json({
            success: true,
            message: "Receipt uploaded successfully",
            data: result,
        });
    } catch (error) {
        const status =
            error.message === "Fueling not found"
                ? 404
                : error.statusCode || 500;

        return res.status(status).json({
            success: false,
            message: error.message,
        });
    }
};

const deleteFuelingReceiptController = async (req, res) => {
    try {
        const { id } = req.params;

        const result = req.user ? await deleteFuelingReceiptService(id, req.user) : await deleteFuelingReceiptService(id);

        return res.status(200).json({
            success: true,
            message: "Receipt deleted successfully",
            data: result,
        });
    } catch (error) {
        let status = error.statusCode || 500;

        if (error.message === "Fueling not found") status = 404;
        if (error.message === "receipt not found") status = 404;

        return res.status(status).json({
            success: false,
            message: error.message,
        });
    }
};

const deleteFuelingController = async (req, res) => {
    try {
        const id = req.params.id;
        const result = req.user ? await deleteFuelingService(id, req.user) : await deleteFuelingService(id);

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createFuelingController,
    getAllFuelingsController,
    getFuelingByIdController,
    updateFuelingController,
    uploadFuelingReceiptController,
    deleteFuelingReceiptController,
    deleteFuelingController,
};