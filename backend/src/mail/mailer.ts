// src/mailer.ts

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'mail.wcg-mail.com',
    port: 587,
    secure: false,
    auth: {
        user: 'info@pladdypus.com',
        pass: 'PureMoods1994'
    },
    tls: {
        rejectUnauthorized: false // ignore ssl
    }
});

export const sendMail = async (to: string, subject: string, text: string, html?: string) => {
    const mailOptions = {
        from: 'no-reply Pladdypus" <info@pladdypus.com>',
        to,
        subject,
        text,
        html
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
    } catch (error) {
        console.error('Error sending email: ', error);
    }
};
