const { createAdminService } = require("../services/admin.service");

const createAdminController = async (req, res) => {
    try {
        const data = req.body;

        if(!data.name || !data.email || !data.password || !data.phone || !data.institution || !data.cnpj) {
            return res.status(400).json({ success: false, message: 'Name, email, password, institution and cnpj are required' });
        }

        const result = await createAdminService(data);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = {
    createAdminController
}