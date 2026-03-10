const path = require("path");
const crypto = require("crypto");
const supabase = require("../config/supabase");

const uploadFileToBucket = async ({
    bucket,
    file,
    folder = "",
    fileName,
    upsert = false,
    cacheControl = "3600",
    isPublic = true
}) => {
    if (!bucket) {
        throw new Error("bucket is required");
    }

    if (!file) {
        throw new Error("file is required");
    }

    const ext = path.extname(file.originalname || file.name || "");
    const safeFileName =
        fileName || `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;

    const normalizedFolder = folder.replace(/^\/+|\/+$/g, "");
    const filePath = normalizedFolder ? `${normalizedFolder}/${safeFileName}` : safeFileName;

    const fileBuffer = file.buffer || file;
    const contentType = file.mimetype || "application/octet-stream";

    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, fileBuffer, {
            contentType,
            upsert,
            cacheControl,
        });

    if (error) {
        throw error;
    }

    const response = {
        ...data,
        path: filePath,
    };

    if (isPublic) {
        const { data: publicUrlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        response.publicUrl = publicUrlData.publicUrl;
    }

    return response;
}

const deleteFileFromBucket = async ({ bucket, filePath }) => {
    if (!bucket) {
        throw new Error("bucket is required");
    }

    if (!filePath) {
        throw new Error("filePath is required");
    }

    const { data, error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

    if (error) {
        throw error;
    }

    return {
        success: true,
        data,
        path: filePath,
    };
};

module.exports = {
    uploadFileToBucket,
    deleteFileFromBucket,
};