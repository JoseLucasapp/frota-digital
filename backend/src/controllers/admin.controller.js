const {
  createAdminService,
  getAllAdminsService,
  updateAdminService,
} = require("../services/admin.service");
const {
  requestAdminPasswordCodeService,
  verifyAdminPasswordCodeService,
  confirmAdminPasswordChangeService,
} = require("../services/auth.service");

const createAdminController = async (req, res) => {
  try {
    const data = req.body;

    if (!data.name || !data.email || !data.password || !data.institution || !data.cnpj) {
      return res.status(400).json({ success: false, message: 'Nome, email, senha, instituição e CNPJ são obrigatórios.' });
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

const updateAdminController = async (req, res) => {
  try {
    if (req.user?.id !== req.params.id) {
      return res.status(403).json({ success: false, message: "Você não tem permissão para alterar este perfil." });
    }

    const data = await updateAdminService(req.params.id, req.body || {});
    res.status(200).json({ success: true, message: "Perfil atualizado com sucesso.", data });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

const requestAdminPasswordCodeController = async (req, res) => {
  try {
    const result = await requestAdminPasswordCodeService(req.user?.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

const verifyAdminPasswordCodeController = async (req, res) => {
  try {
    const result = await verifyAdminPasswordCodeService(req.user?.id, req.body?.code);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

const confirmAdminPasswordChangeController = async (req, res) => {
  try {
    const result = await confirmAdminPasswordChangeService(req.user?.id, req.body?.code, req.body?.password);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createAdminController,
  getAllAdminsController,
  updateAdminController,
  requestAdminPasswordCodeController,
  verifyAdminPasswordCodeController,
  confirmAdminPasswordChangeController,
}
