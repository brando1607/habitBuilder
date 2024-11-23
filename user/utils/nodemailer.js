import nodemailer from "nodemailer";
process.loadEnvFile();
export const sendEmail = async (email, text, subject) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailSettings = {
    from: "Habit Builder Assistant habitbuilder.assistant@gmail.com",
    to: email,
    subject: subject,
    text: text,
  };
  await transporter.sendMail(mailSettings);
};
