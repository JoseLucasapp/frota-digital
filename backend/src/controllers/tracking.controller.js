const {
  createTrackingLogService,
  getTrackingLogsService,
  getTrackingOverviewService,
} = require("../services/tracking.service");

const createTrackingLogController = async (req, res) => {
  try {
    const result = await createTrackingLogService(req.body, req.user);
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

const getTrackingLogsController = async (req, res) => {
  try {
    const result = await getTrackingLogsService(req.query, req.user);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

const getTrackingOverviewController = async (req, res) => {
  try {
    const result = await getTrackingOverviewService(req.query, req.user);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createTrackingLogController,
  getTrackingLogsController,
  getTrackingOverviewController,
};
