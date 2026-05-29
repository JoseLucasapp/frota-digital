require("dotenv").config();

const SENDGRID_URL = "https://api.sendgrid.com/v3/mail/send";
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || "support@frota-digital.online";

const defaultHtml = (to) => `
  <p>
    Seu email foi cadastrado com sucesso no <strong>Frota Digital</strong>.
    Agora você pode acessar sua conta e aproveitar os recursos disponíveis.<br>
    Use o email: <a>${to}</a>, ao efetuar o primeiro acesso não é necessário informar a senha.
  </p>
`;

const sendEmail = async (to, subject) => {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.warn("SENDGRID_API_KEY não configurada. Email não enviado.");
      return;
    }

    const response = await fetch(SENDGRID_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: FROM_EMAIL, name: "Frota Digital" },
        subject,
        content: [{ type: "text/html", value: defaultHtml(to) }],
      }),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `SendGrid retornou status ${response.status}`);
    }

    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
  }
};

module.exports = {
  sendEmail,
};
