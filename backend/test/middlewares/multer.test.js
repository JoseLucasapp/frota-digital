const upload = require("../../src/middlewares/multer");

describe("upload middleware", () => {
    test("should export a multer instance", () => {
        expect(upload).toBeDefined();
        expect(typeof upload.single).toBe("function");
        expect(typeof upload.array).toBe("function");
        expect(typeof upload.fields).toBe("function");
    });

    test("should create middleware with single()", () => {
        const middleware = upload.single("file");

        expect(middleware).toBeDefined();
        expect(typeof middleware).toBe("function");
    });
});