const adminRoutes = require("./admin.routes")
const authRoutes = require("./auth.routes")
const driverRoutes = require("./driver.routes")
const fuelingsRoutes = require("./fuelings.routes")
const mechanicRoutes = require("./mechanic.routes")
const testUpload = require("./testUpload.routes")
const vehicleRoutes = require("./vehicle.routes")

module.exports = (router) => {
    testUpload(router)
    authRoutes(router)
    adminRoutes(router)
    mechanicRoutes(router)
    driverRoutes(router)
    fuelingsRoutes(router)
    vehicleRoutes(router)

}