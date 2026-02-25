const adminRoutes = require("./admin.routes")
const driverRoutes = require("./driver.routes")
const mechanicRoutes = require("./mechanic.routes")

module.exports = (router) =>{
    adminRoutes(router)
    mechanicRoutes(router)
    driverRoutes(router)
}