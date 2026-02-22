const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function sendEmailNotification(toEmail, subject, text) {
    if (!toEmail) return;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: toEmail,
        subject,
        text
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`📧 Email sent to ${toEmail}`);
    } catch (error) {
        console.error('❌ Email failed:', error);
    }
}

module.exports = sendEmailNotification;
