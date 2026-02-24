const {createAdminController} = require('../controllers/admin.controller')

module.exports = (router) => {
    router.post('/admin', async (req, res) => await createAdminController(req, res))
}