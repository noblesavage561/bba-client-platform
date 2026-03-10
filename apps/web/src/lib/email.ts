import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT ?? "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  const from = `BBA Tax Intelligence Platform <${process.env.SMTP_USER ?? "bruce@bbaservices.org"}>`;

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    html,
    text: text ?? html.replace(/<[^>]*>/g, ""),
  });

  return info;
}

export function renderTemplate(template: string, variables: Record<string, string>): string {
  return Object.entries(variables).reduce(
    (acc, [key, value]) => acc.replace(new RegExp(`\\{${key}\\}`, "g"), value),
    template
  );
}

export async function sendWelcomeEmail(to: string, clientName: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #3f4147; padding: 20px; text-align: center;">
        <h1 style="color: #2f97cf; margin: 0;">BBA Services</h1>
      </div>
      <div style="padding: 30px 20px;">
        <h2>Welcome, ${clientName}!</h2>
        <p>Thank you for joining the BBA Tax Intelligence Platform. Your intake has been received and our team will be in touch shortly.</p>
        <p>Here's what happens next:</p>
        <ol>
          <li>Our team reviews your intake (1-2 business days)</li>
          <li>AI begins document classification and confidence scoring</li>
          <li>Your preparer launches your tax workflow and checklist</li>
        </ol>
        <p>In the meantime, you can access your client portal to upload documents and track your progress.</p>
        <a href="${process.env.NEXTAUTH_URL}/portal"
           style="display: inline-block; background: #2f97cf; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">
          Access Your Portal
        </a>
        <p style="margin-top: 30px; color: #666;">Have questions? Email us at bruce@bbaservices.org</p>
      </div>
    </div>
  `;

  return sendEmail({ to, subject: "Welcome to BBA Tax Intelligence", html });
}
