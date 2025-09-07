const nodemailer = require('nodemailer');

async function sendEmail(userEmail , subject , html ) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.AUTH_EMAIL,
            pass: process.env.AUTH_PASSOWRD,
        }
    });

    const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: userEmail,
        subject: subject ,
        html: html
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Verfication email sent");
    } catch (error) {
        console.log("Email sending failed with a error:", error);
    }
}

module.exports = sendEmail;