import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host:   process.env.MAIL_HOST,
  port:   parseInt(process.env.MAIL_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export const verifyMailerConnection = async () => {
  try {
    await transporter.verify();
    console.log("Mailer ready");
  } catch (error) {
    console.error("Mailer connection failed:", error.message);
  }
};