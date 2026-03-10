const { testUploadController, testDeleteUploadController, testMultipleUploadController } = require("../controllers/testUpload.controller");
const upload = require("../middlewares/multer");

module.exports = (router) => {
    router.post(
        "/test-upload",
        upload.single("file"),
        async (req, res) => await testUploadController(req, res)
    );

    router.post(
        "/test-upload-docs",
        upload.fields([
            { name: "cnh", maxCount: 1 },
            { name: "cnpj", maxCount: 1 },
            { name: "crlv", maxCount: 1 },
            { name: "comprovante_residencia", maxCount: 1 },
        ]),
        async (req, res) => await testMultipleUploadController(req, res)
    );

    router.delete(
        "/test-upload",
        async (req, res) => await testDeleteUploadController(req, res)
    );
};