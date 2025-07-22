// lib/sendMail.ts

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export default function sendMail(options: { to: string; subject: string; html: string }) {
  return transporter.sendMail({
    from: `"Kram" <no-reply@kram.one>`,
    ...options,
  });
}
