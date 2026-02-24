const adminRoutes = require("./admin.routes")
const mechanicRoutes = require("./mechanic.routes")

module.exports = (router) =>{
    adminRoutes(router)
    mechanicRoutes(router)
}