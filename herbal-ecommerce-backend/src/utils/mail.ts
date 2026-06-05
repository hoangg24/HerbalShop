// src/utils/mail.ts
import nodemailer from 'nodemailer'
import { env } from '../config/env'

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
})

interface SendMailOptions {
  to: string
  subject: string
  html: string
}

export const sendMail = async ({ to, subject, html }: SendMailOptions) => {
  await transporter.sendMail({
    from: env.MAIL_FROM,
    to,
    subject,
    html,
  })
}

// ── Email templates ───────────────────────────────────────────
export const welcomeEmailHtml = (name: string) => `
  <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
    <h2 style="color: #2d6a4f;">Chào mừng đến với Herbal Shop 🌿</h2>
    <p>Xin chào <strong>${name}</strong>,</p>
    <p>Tài khoản của bạn đã được tạo thành công. Cảm ơn bạn đã đăng ký!</p>
    <hr/>
    <p style="color: #888; font-size: 12px;">Herbal Shop — Thiên nhiên cho sức khỏe của bạn</p>
  </div>
`

export const resetPasswordEmailHtml = (name: string, resetUrl: string) => `
  <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
    <h2 style="color: #2d6a4f;">Đặt lại mật khẩu 🔐</h2>
    <p>Xin chào <strong>${name}</strong>,</p>
    <p>Bạn vừa yêu cầu đặt lại mật khẩu. Nhấn vào nút bên dưới để tiếp tục:</p>
    <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#2d6a4f;color:#fff;border-radius:6px;text-decoration:none;margin:16px 0;">
      Đặt lại mật khẩu
    </a>
    <p style="color:#888;font-size:12px;">Link có hiệu lực trong 15 phút. Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
  </div>
`
