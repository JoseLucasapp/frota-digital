const {
  createMechanicService,
  getAllMechanicsService,
  getMechanicByIdService,
  updateMechanicService,
  uploadMechanicDocumentService,
  deleteMechanicDocumentService,
  deleteMechanicService,
} = require("../services/mechanic.service");

const createMechanicController = async (req, res) => {
  try {
    const data = req.body;

    if (!data.name || !data.email || !data.phone || !data.cnpj) {
      return res.status(400).json({
        success: false,
        message: "Name, email, phone and cnpj are required",
      });
    }

    const result = await createMechanicService(data);
    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAllMechanicsController = async (req, res) => {
  try {
    const result = await getAllMechanicsService(req.query);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getMechanicByIdController = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await getMechanicByIdService(id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Mechanic not found",
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

const updateMechanicController = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body || {};
    const result = await updateMechanicService(id, data);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const uploadMechanicDocumentController = async (req, res) => {
  try {
    const { id, documentType } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "file is required",
      });
    }

    const result = await uploadMechanicDocumentService({
      mechanicId: id,
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

    if (error.message === "Mechanic not found") status = 404;
    if (error.message === "invalid document type") status = 400;

    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteMechanicDocumentController = async (req, res) => {
  try {
    const { id, documentType } = req.params;

    const result = await deleteMechanicDocumentService({
      mechanicId: id,
      documentType,
    });

    return res.status(200).json({
      success: true,
      message: "Document deleted successfully",
      data: result,
    });
  } catch (error) {
    let status = 500;

    if (error.message === "Mechanic not found") status = 404;
    if (error.message === "document not found") status = 404;
    if (error.message === "invalid document type") status = 400;

    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteMechanicController = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await deleteMechanicService(id);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createMechanicController,
  getAllMechanicsController,
  getMechanicByIdController,
  updateMechanicController,
  uploadMechanicDocumentController,
  deleteMechanicDocumentController,
  deleteMechanicController,
};