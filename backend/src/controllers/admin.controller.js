const { createAdminService, getAllAdminsService } = require("../services/admin.service");

const createAdminController = async (req, res) => {
  try {
    const data = req.body;

    if (!data.name || !data.email || !data.password || !data.institution || !data.cnpj) {
      return res.status(400).json({ success: false, message: 'Name, email, password, institution and cnpj are required' });
    }

    const result = await createAdminService(data);
    res.status(201).json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
}

const getAllAdminsController = async (req, res) => {
  try {
    const { email, name, cnpj, institution, page, pageSize } = req.query;
    const data = await getAllAdminsService({
      email,
      name,
      cnpj,
      institution,
      page,
      pageSize,
    });
    res.status(200).json({ success: true, data });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  createAdminController,
  getAllAdminsController
}