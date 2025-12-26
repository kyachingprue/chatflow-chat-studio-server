// verifyEmail.js
import nodemailer from 'nodemailer';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import handlebars from 'handlebars';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const verifyEmail = async (token, email) => {
  // ✅ token
  try {
    const emailTemplateSource = fs.readFileSync(
      path.join(__dirname, 'template.hbs'),
      'utf-8'
    );

    const template = handlebars.compile(emailTemplateSource);
    const htmlToSend = template({ TOKEN: encodeURIComponent(token) }); // ✅ use TOKEN in template

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const emailConfigurations = {
      from: process.env.MAIL_USER,
      to: email,
      subject: 'Email Verification',
      html: htmlToSend,
    };

    await transporter.sendMail(emailConfigurations);
  } catch (error) {
    console.error('Email sending failed:', error.message);
  }
};
