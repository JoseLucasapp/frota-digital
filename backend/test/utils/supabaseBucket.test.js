jest.mock("../../src/config/supabase", () => ({
    storage: {
        from: jest.fn(),
    },
}));

const supabase = require("../../src/config/supabase");
const {
    uploadFileToBucket,
    deleteFileFromBucket,
} = require("../../src/utils/supabaseBucket");

describe("supabasebucket utils", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("uploadFileToBucket", () => {
        test("should throw when bucket is missing", async () => {
            await expect(
                uploadFileToBucket({
                    file: { originalname: "test.png", buffer: Buffer.from("abc") },
                })
            ).rejects.toThrow("bucket is required");
        });

        test("should throw when file is missing", async () => {
            await expect(
                uploadFileToBucket({
                    bucket: "documents",
                })
            ).rejects.toThrow("file is required");
        });

        test("should upload file and return public url", async () => {
            const upload = jest.fn().mockResolvedValue({
                data: { id: "1", fullPath: "docs/file.png" },
                error: null,
            });

            const getPublicUrl = jest.fn(() => ({
                data: {
                    publicUrl: "https://cdn.test/docs/file.png",
                },
            }));

            supabase.storage.from.mockReturnValue({
                upload,
                getPublicUrl,
            });

            const file = {
                originalname: "file.png",
                mimetype: "image/png",
                buffer: Buffer.from("fake-image"),
            };

            const result = await uploadFileToBucket({
                bucket: "documents",
                file,
                folder: "docs",
                fileName: "file.png",
            });

            expect(supabase.storage.from).toHaveBeenCalledWith("documents");
            expect(upload).toHaveBeenCalledWith(
                "docs/file.png",
                file.buffer,
                {
                    contentType: "image/png",
                    upsert: false,
                    cacheControl: "3600",
                }
            );

            expect(getPublicUrl).toHaveBeenCalledWith("docs/file.png");
            expect(result).toEqual({
                id: "1",
                fullPath: "docs/file.png",
                path: "docs/file.png",
                publicUrl: "https://cdn.test/docs/file.png",
            });
        });

        test("should upload file without public url when isPublic is false", async () => {
            const upload = jest.fn().mockResolvedValue({
                data: { id: "2", fullPath: "private/file.pdf" },
                error: null,
            });

            const getPublicUrl = jest.fn();

            supabase.storage.from.mockReturnValue({
                upload,
                getPublicUrl,
            });

            const file = {
                originalname: "file.pdf",
                mimetype: "application/pdf",
                buffer: Buffer.from("fake-pdf"),
            };

            const result = await uploadFileToBucket({
                bucket: "documents",
                file,
                folder: "private",
                fileName: "file.pdf",
                isPublic: false,
            });

            expect(upload).toHaveBeenCalled();
            expect(getPublicUrl).not.toHaveBeenCalled();
            expect(result).toEqual({
                id: "2",
                fullPath: "private/file.pdf",
                path: "private/file.pdf",
            });
        });

        test("should normalize folder slashes", async () => {
            const upload = jest.fn().mockResolvedValue({
                data: { id: "3" },
                error: null,
            });

            const getPublicUrl = jest.fn(() => ({
                data: {
                    publicUrl: "https://cdn.test/docs/file.png",
                },
            }));

            supabase.storage.from.mockReturnValue({
                upload,
                getPublicUrl,
            });

            const file = {
                originalname: "file.png",
                mimetype: "image/png",
                buffer: Buffer.from("abc"),
            };

            await uploadFileToBucket({
                bucket: "documents",
                file,
                folder: "/docs/",
                fileName: "file.png",
            });

            expect(upload).toHaveBeenCalledWith(
                "docs/file.png",
                file.buffer,
                expect.any(Object)
            );
        });

        test("should throw when upload returns error", async () => {
            const upload = jest.fn().mockResolvedValue({
                data: null,
                error: new Error("upload failed"),
            });

            supabase.storage.from.mockReturnValue({
                upload,
                getPublicUrl: jest.fn(),
            });

            const file = {
                originalname: "file.png",
                mimetype: "image/png",
                buffer: Buffer.from("abc"),
            };

            await expect(
                uploadFileToBucket({
                    bucket: "documents",
                    file,
                    fileName: "file.png",
                })
            ).rejects.toThrow("upload failed");
        });
    });

    describe("deleteFileFromBucket", () => {
        test("should throw when bucket is missing", async () => {
            await expect(
                deleteFileFromBucket({
                    filePath: "docs/file.png",
                })
            ).rejects.toThrow("bucket is required");
        });

        test("should throw when filePath is missing", async () => {
            await expect(
                deleteFileFromBucket({
                    bucket: "documents",
                })
            ).rejects.toThrow("filePath is required");
        });

        test("should delete file and return success", async () => {
            const remove = jest.fn().mockResolvedValue({
                data: [{ name: "file.png" }],
                error: null,
            });

            supabase.storage.from.mockReturnValue({
                remove,
            });

            const result = await deleteFileFromBucket({
                bucket: "documents",
                filePath: "docs/file.png",
            });

            expect(supabase.storage.from).toHaveBeenCalledWith("documents");
            expect(remove).toHaveBeenCalledWith(["docs/file.png"]);
            expect(result).toEqual({
                success: true,
                data: [{ name: "file.png" }],
                path: "docs/file.png",
            });
        });

        test("should throw when remove returns error", async () => {
            const remove = jest.fn().mockResolvedValue({
                data: null,
                error: new Error("delete failed"),
            });

            supabase.storage.from.mockReturnValue({
                remove,
            });

            await expect(
                deleteFileFromBucket({
                    bucket: "documents",
                    filePath: "docs/file.png",
                })
            ).rejects.toThrow("delete failed");
        });
    });
});