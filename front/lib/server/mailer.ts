import "server-only";
import nodemailer from "nodemailer";
import type { MailConfig } from "@/lib/mail-config";

export type MailAttachment = {
  filename: string;
  path: string;
  cid?: string;
  contentDisposition?: "inline" | "attachment";
};

export async function sendMail(
  config: MailConfig,
  message: {
    to: string;
    subject: string;
    html: string;
    text: string;
    attachments?: MailAttachment[];
  },
): Promise<{ messageId: string }> {
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass },
  });

  const info = await transporter.sendMail({
    from: config.from,
    replyTo: config.replyTo ?? undefined,
    to: message.to,
    subject: message.subject,
    html: message.html,
    text: message.text,
    attachments: message.attachments,
  });

  return { messageId: info.messageId };
}
