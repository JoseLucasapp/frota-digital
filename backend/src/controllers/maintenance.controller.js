const {
    createMaintenancesService,
    getAllMaintenancesService,
    getMaintenancesByIdService,
    updateMaintenancesService,
    uploadMaintenancesReceiptService,
    deleteMaintenanceReceiptService,
    deleteMaintenanceService,
} = require("../services/maintenance.service");

const createMaintenancesController = async (req, res) => {
    try {
        const data = req.body;

        if (
            !data.vehicle_id ||
            !data.type ||
            !data.status ||
            !data.description
        ) {
            return res.status(400).json({
                success: false,
                message: "vehicle_id, type, status and description are required",
            });
        }

        const result = req.user ? await createMaintenancesService(data, req.user) : await createMaintenancesService(data);
        return res.status(201).json(result);
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message,
        });
    }
};

const getAllMaintenancesController = async (req, res) => {
    try {
        const result = req.user ? await getAllMaintenancesService(req.query, req.user) : await getAllMaintenancesService(req.query);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message,
        });
    }
};

const getMaintenancesByIdController = async (req, res) => {
    try {
        const id = req.params.id;
        const result = req.user ? await getMaintenancesByIdService(id, req.user) : await getMaintenancesByIdService(id);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Maintenance not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message,
        });
    }
};

const updateMaintenancesController = async (req, res) => {
    try {
        const id = req.params.id;
        const data = req.body;
        const result = req.user ? await updateMaintenancesService(id, data, req.user) : await updateMaintenancesService(id, data);

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message,
        });
    }
};

const uploadMaintenancesReceiptController = async (req, res) => {
    try {
        const { id } = req.params;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "file is required",
            });
        }

        const result = await uploadMaintenancesReceiptService({
            maintenanceId: id,
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
            error.message === "Maintenance not found"
                ? 404
                : error.statusCode || 500;

        return res.status(status).json({
            success: false,
            message: error.message,
        });
    }
};

const deleteMaintenanceReceiptController = async (req, res) => {
    try {
        const { id } = req.params;

        const result = req.user ? await deleteMaintenanceReceiptService(id, req.user) : await deleteMaintenanceReceiptService(id);

        return res.status(200).json({
            success: true,
            message: "Receipt deleted successfully",
            data: result,
        });
    } catch (error) {
        let status = error.statusCode || 500;

        if (error.message === "Maintenance not found") status = 404;
        if (error.message === "receipt not found") status = 404;

        return res.status(status).json({
            success: false,
            message: error.message,
        });
    }
};

const deleteMaintenanceController = async (req, res) => {
    try {
        const id = req.params.id;
        const result = req.user ? await deleteMaintenanceService(id, req.user) : await deleteMaintenanceService(id);

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    createMaintenancesController,
    getAllMaintenancesController,
    getMaintenancesByIdController,
    updateMaintenancesController,
    uploadMaintenancesReceiptController,
    deleteMaintenanceReceiptController,
    deleteMaintenanceController,
};