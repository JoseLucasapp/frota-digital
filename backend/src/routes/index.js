const adminRoutes = require("./admin.routes")
const authRoutes = require("./auth.routes")
const driverRoutes = require("./driver.routes")
const mechanicRoutes = require("./mechanic.routes")

module.exports = (router) =>{
    authRoutes(router)
    adminRoutes(router)
    mechanicRoutes(router)
    driverRoutes(router)
}