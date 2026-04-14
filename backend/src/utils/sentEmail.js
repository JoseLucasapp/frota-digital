require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});



const mailOptions = {
  from: process.env.EMAIL_USER,
  to: '',
  subject: '',
  html: `<p>Seu email foi cadastrado com sucesso no <strong>Frota Digital</strong>. Agora você pode acessar sua conta e aproveitar os recursos disponíveis.<br> Use o email: <a></a>, ao efetuar o primeiro acesso não é necessário informar a senha.</p>`,
};

const sendEmail = async (to, subject) => {
  try {
    let htmlContent = mailOptions.html.replace('<a></a>', `<a>${to}</a>`);
    const options = { ...mailOptions, to, subject, html: htmlContent };
    await transporter.sendMail(options);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
  }
}

module.exports = {
  sendEmail,
}