const { createFuelingService, getAllFuelingsService, getFuelingByIdService, updateFuelingService, deleteFuelingService } = require("../services/fueling.service");

const createFuelingController = async (req, res) => {
    try {
        const data = req.body;

        if (
            !data.vehicle_id ||
            !data.fuel_type ||
            data.liters == null ||
            data.price_per_liter == null ||
            data.current_km == null ||
            !data.station
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "vehicle_id, fuel_type, liters, price_per_liter, current_km and station are required",
            });
        }
        const result = await createFuelingService(data);
        res.status(201).json(result);

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const getAllFuelingsController = async (req, res) => {
    try {
        const query = req.query;
        const result = await getAllFuelingsService(query);
        res.status(200).json(result);

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const getFuelingByIdController = async (req, res) => {
    try {
        const id = req.params.id;
        console.log(id)
        const result = await getFuelingByIdService(id);
        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Fueling not found",
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

const updateFuelingController = async (req, res) => {
    try {
        const id = req.params.id;
        const data = req.body;
        const result = await updateFuelingService(id, data);

        return res.status(200).json({
            success: true,
            data: result,
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const deleteFuelingController = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await deleteFuelingService(id);

        return res.status(200).json({
            success: true,
            data: result,
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}


module.exports = { createFuelingController, getAllFuelingsController, getFuelingByIdController, updateFuelingController, deleteFuelingController };