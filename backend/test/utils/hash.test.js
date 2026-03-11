const { hashPassword, verifyPassword } = require("../../src/utils/hash");

describe("hash utils", () => {
    test("hashPassword should return a hashed string", async () => {
        const plainPassword = "123456";

        const hash = await hashPassword(plainPassword);

        expect(typeof hash).toBe("string");
        expect(hash).not.toBe(plainPassword);
        expect(hash.length).toBeGreaterThan(0);
    });

    test("verifyPassword should return true for correct password", async () => {
        const plainPassword = "123456";
        const hash = await hashPassword(plainPassword);

        const result = await verifyPassword(plainPassword, hash);

        expect(result).toBe(true);
    });

    test("verifyPassword should return false for wrong password", async () => {
        const plainPassword = "123456";
        const wrongPassword = "654321";
        const hash = await hashPassword(plainPassword);

        const result = await verifyPassword(wrongPassword, hash);

        expect(result).toBe(false);
    });

    test("hashPassword should generate different hashes for the same password", async () => {
        const plainPassword = "123456";

        const hash1 = await hashPassword(plainPassword);
        const hash2 = await hashPassword(plainPassword);

        expect(hash1).not.toBe(hash2);
    });
});