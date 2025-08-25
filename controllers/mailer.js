const nodemailer = require("nodemailer");

// Example using Gmail (but you can use any SMTP provider)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ma453935@gmail.com",     // your email
    pass: "xrho absd ieun argv"         // app password (not your Gmail password)
  }
});

async function sendMail(to, subject, text) {
  try {
    const info = await transporter.sendMail({
      from: '"Foody App" <ma453935@gmail.com>',
      to,
      subject,
      text,
    });
    console.log("Email sent:", info.messageId);
  } catch (err) {
    console.error("Error sending email:", err);
  }
}

module.exports = sendMail;
