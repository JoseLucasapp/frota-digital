const { createVehicleService, getAllVehiclesService, getVehicleByIdService, updateVehicleService, deleteVehicleService } = require("../services/vehicle.service");

const createVehicleController = async (req, res) => {
    try {
        const data = req.body;

        if (
            !data.plate ||
            !data.make ||
            !data.model ||
            !data.year ||
            !data.fuel_type ||
            !data.current_km ||
            !data.status
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "plate, make, model, year, fuel_type, current_km and status are required",
            });
        }
        const result = await createVehicleService(data);
        res.status(201).json(result);

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const getAllVehiclesController = async (req, res) => {
    try {
        const query = req.query;
        const result = await getAllVehiclesService(query);
        res.status(200).json(result);

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const getVehicleByIdController = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await getVehicleByIdService(id);
        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: result,
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}


const updateVehicleController = async (req, res) => {
    try {
        const id = req.params.id;
        const data = req.body;
        const result = await updateVehicleService(id, data);

        return res.status(200).json({
            success: true,
            data: result,
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const deleteVehicleController = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await deleteVehicleService(id);

        return res.status(200).json({
            success: true,
            data: result,
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = { createVehicleController, getAllVehiclesController, getVehicleByIdController, updateVehicleController, deleteVehicleController }