import nodemailer from "nodemailer";

export const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });
  }

  // Fallback: log to console
  return {
    sendMail: async (options: { from?: string; to: string; subject: string; html: string }) => {
      console.log("==================================================");
      console.log("MAIL MOCK (No SMTP credentials found in environment)");
      console.log(`To: ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log("Content:");
      console.log(options.html);
      console.log("==================================================");
      return { messageId: "mock-message-id" };
    },
  } as any;
};
