import nodemailer from 'nodemailer';
import 'dotenv/config';

export const sendOtpMail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: 'OTP Verification',
      html: `<h3>Your OTP code is: <b>${otp}</b></h3>
             <p>This OTP will expire in 10 minutes.</p>`,
    });

    console.log(`OTP sent to ${email}`);
  } catch (error) {
    console.log('Error sending OTP email:', error.message);
    throw new Error('Failed to send OTP email');
  }
};
