const { sendEmail } = require("../../src/utils/sentEmail");

describe("sendEmail utils", () => {
    let consoleLogSpy;
    let consoleErrorSpy;
    let consoleWarnSpy;
    const originalFetch = global.fetch;
    const originalApiKey = process.env.SENDGRID_API_KEY;
    const originalFromEmail = process.env.SENDGRID_FROM_EMAIL;

    beforeEach(() => {
        jest.clearAllMocks();

        process.env.SENDGRID_API_KEY = "test-sendgrid-key";
        process.env.SENDGRID_FROM_EMAIL = "support@frota-digital.online";
        global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 202, text: jest.fn().mockResolvedValue("") });

        consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => { });
        consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => { });
        consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => { });
    });

    afterEach(() => {
        global.fetch = originalFetch;
        process.env.SENDGRID_API_KEY = originalApiKey;
        process.env.SENDGRID_FROM_EMAIL = originalFromEmail;
        consoleLogSpy.mockRestore();
        consoleErrorSpy.mockRestore();
        consoleWarnSpy.mockRestore();
    });

    test("sendEmail should send email through SendGrid with replaced html content", async () => {
        await sendEmail("user@email.com", "Welcome");

        expect(global.fetch).toHaveBeenCalledTimes(1);

        const [url, options] = global.fetch.mock.calls[0];
        const body = JSON.parse(options.body);

        expect(url).toBe("https://api.sendgrid.com/v3/mail/send");
        expect(options.method).toBe("POST");
        expect(options.headers.Authorization).toBe("Bearer test-sendgrid-key");
        expect(body.personalizations[0].to[0].email).toBe("user@email.com");
        expect(body.from.email).toBe("support@frota-digital.online");
        expect(body.subject).toBe("Welcome");
        expect(body.content[0].value).toContain("<a>user@email.com</a>");
        expect(consoleLogSpy).toHaveBeenCalledWith("Email sent to user@email.com");
    });

    test("sendEmail should log error when SendGrid fails", async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 401,
            text: jest.fn().mockResolvedValue("invalid api key"),
        });

        await sendEmail("user@email.com", "Welcome");

        expect(consoleErrorSpy).toHaveBeenCalledWith(
            "Failed to send email to user@email.com:",
            expect.any(Error)
        );
    });

    test("sendEmail should skip sending when SENDGRID_API_KEY is missing", async () => {
        delete process.env.SENDGRID_API_KEY;

        await sendEmail("user@email.com", "Welcome");

        expect(global.fetch).not.toHaveBeenCalled();
        expect(consoleWarnSpy).toHaveBeenCalledWith("SENDGRID_API_KEY não configurada. Email não enviado.");
    });
});
