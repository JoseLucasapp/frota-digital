const path = require("path");
const { uploadFileToBucket, deleteFileFromBucket } = require("../utils/supabaseBucket");

const testUploadController = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "file is required",
            });
        }

        const ext = path.extname(req.file.originalname || "");
        const user = "1234567777"

        const result = await uploadFileToBucket({
            bucket: "reports",
            file: req.file,
            fileName: `${Date.now()}${user}-${ext}`,
            folder: "reports",
            isPublic: true,
        });

        return res.status(200).json({
            success: true,
            message: "File uploaded successfully",
            data: result,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const testMultipleUploadController = async (req, res) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({
                success: false,
                message: "at least one file is required",
            });
        }

        const uploads = [];

        for (const fieldName of Object.keys(req.files)) {
            const file = req.files[fieldName][0];
            const ext = path.extname(file.originalname || "");
            const user = "1234567777"

            const result = await uploadFileToBucket({
                bucket: "reports",
                file,
                fileName: `${user}-${fieldName}-${Date.now()}${ext}`,
                folder: `reports/${fieldName}`,
                isPublic: true,
            });

            uploads.push({
                field: fieldName,
                originalName: file.originalname,
                ...result,
            });
        }

        return res.status(200).json({
            success: true,
            message: "Files uploaded successfully",
            data: uploads,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const testDeleteUploadController = async (req, res) => {
    try {
        const { filePath } = req.body;

        if (!filePath) {
            return res.status(400).json({
                success: false,
                message: "filePath is required",
            });
        }

        const result = await deleteFileFromBucket({
            bucket: "reports",
            filePath,
        });

        return res.status(200).json({
            success: true,
            message: "File deleted successfully",
            data: result,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};



module.exports = { testUploadController, testDeleteUploadController, testMultipleUploadController };