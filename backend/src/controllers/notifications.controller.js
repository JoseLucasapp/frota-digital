const {
    createNotificationsService,
    getAllNotificationsService,
    getNotificationByIdService,
    updateNotificationService,
    deleteNotificationService,
} = require("../services/notifications.service");

const createNotificationController = async (req, res) => {
    try {
        const data = req.body;

        if (!data.title || !data.type || !data.message) {
            return res.status(400).json({
                success: false,
                message: "title, type and message are required",
            });
        }

        const result = await createNotificationsService(data, req.user);
        return res.status(201).json(result);
    } catch (error) {
        return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
};

const getAllNotificationsController = async (req, res) => {
    try {
        const result = await getAllNotificationsService(req.query, req.user);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
};

const getNotificationByIdController = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await getNotificationByIdService(id, req.user);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Notification not found",
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

const updateNotificationController = async (req, res) => {
    try {
        const id = req.params.id;
        const data = req.body;
        const result = await updateNotificationService(id, data, req.user);

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
};

const deleteNotificationController = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await deleteNotificationService(id, req.user);

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createNotificationController,
    getAllNotificationsController,
    getNotificationByIdController,
    updateNotificationController,
    deleteNotificationController,
};