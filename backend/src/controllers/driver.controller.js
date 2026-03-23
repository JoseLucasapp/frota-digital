const { createDriverService, getAllDriversService, getDriverByIdService, updateDriverService, uploadDriverDocumentService, deleteDriverDocumentService, deleteDriverService } = require("../services/driver.service");

const createDriverController = async (req, res) => {
  try {
    const data = req.body;

    if (
      !data.name ||
      !data.email ||
      !data.phone ||
      !data.cpf
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Name, email, phone, password and cpf are required",
        });
    }

    const result = await createDriverService(data);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllDriversController = async (req, res) => {
  try {
    const result = await getAllDriversService(req.query);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getDriverByIdController = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await getDriverByIdService(id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateDriverController = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body || {};
    const result = await updateDriverService(id, data);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const uploadDriverDocumentController = async (req, res) => {
  try {
    const { id, documentType } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "file is required",
      });
    }

    const result = await uploadDriverDocumentService({
      driverId: id,
      documentType,
      file: req.file,
    });

    return res.status(200).json({
      success: true,
      message: "Document uploaded successfully",
      data: result,
    });
  } catch (error) {
    let status = 500;

    if (error.message === "Driver not found") status = 404;
    if (error.message === "invalid document type") status = 400;

    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteDriverDocumentController = async (req, res) => {
  try {
    const { id, documentType } = req.params;

    const result = await deleteDriverDocumentService({
      driverId: id,
      documentType,
    });

    return res.status(200).json({
      success: true,
      message: "Document deleted successfully",
      data: result,
    });
  } catch (error) {
    let status = 500;

    if (error.message === "Driver not found") status = 404;
    if (error.message === "document not found") status = 404;
    if (error.message === "invalid document type") status = 400;

    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteDriverController = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await deleteDriverService(id);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createDriverController,
  getAllDriversController,
  getDriverByIdController,
  updateDriverController,
  uploadDriverDocumentController,
  deleteDriverDocumentController,
  deleteDriverController
};
