const mockSendMail = jest.fn();

jest.mock("nodemailer", () => ({
    createTransport: jest.fn(() => ({
        sendMail: mockSendMail,
    })),
}));

const { sendEmail } = require("../../src/utils/sentEmail");

describe("sendEmail utils", () => {
    let consoleLogSpy;
    let consoleErrorSpy;

    beforeEach(() => {
        jest.clearAllMocks();

        consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => { });
        consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => { });
    });

    afterEach(() => {
        consoleLogSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });

    test("sendEmail should send email with replaced html content", async () => {
        mockSendMail.mockResolvedValue({});

        await sendEmail("user@email.com", "Welcome");

        expect(mockSendMail).toHaveBeenCalledTimes(1);

        const callArg = mockSendMail.mock.calls[0][0];

        expect(callArg.to).toBe("user@email.com");
        expect(callArg.subject).toBe("Welcome");
        expect(callArg.from).toBe(process.env.EMAIL_USER);
        expect(callArg.html).toContain("<a>user@email.com</a>");
        expect(consoleLogSpy).toHaveBeenCalledWith("Email sent to user@email.com");
    });

    test("sendEmail should log error when sendMail fails", async () => {
        const fakeError = new Error("smtp failed");
        mockSendMail.mockRejectedValue(fakeError);

        await sendEmail("user@email.com", "Welcome");

        expect(consoleErrorSpy).toHaveBeenCalledWith(
            "Failed to send email to user@email.com:",
            fakeError
        );
    });
});