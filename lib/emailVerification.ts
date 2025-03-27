import nodemailer from "nodemailer";
import prisma from "./prisma";

const verificationEmail = async (userEmail: string) => {
  try {
    const token = crypto.randomUUID();
    const transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: Number(process.env.MAILTRAP_PORT),
      secure: false, // true for port 465, false for other ports
      auth: {
        user: process.env.MAILTRAP_USERNAME,
        pass: process.env.MAILTRAP_PASSWORD,
      },
    });

    const user = await prisma.verifyEmailToken.create({
      data: {
        token,
        email: userEmail,
        expireAt: Date.now() + 15 * 60 * 60 * 1000,
      },
    });

    console.log(user);

    await transporter.sendMail({
      from: process.env.MAILTRAP_SENDER,
      to: userEmail,
      subject: "Verify your email",
      text: `Click on this link to verify:  http://localhost:3000/api/user/verifyEmail?token=${token}`,
      html: "<b>Hello world?</b>",
    });
  } catch (error) {
    console.log(error);
  }
};

export default verificationEmail;
