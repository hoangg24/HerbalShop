// src/modules/auth/auth.service.ts
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "../../config/prisma";
import { env } from "../../config/env";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt";
import {
  sendMail,
  welcomeEmailHtml,
  resetPasswordEmailHtml,
} from "../../utils/mail";
import {
  RegisterInput,
  LoginInput,
  RefreshTokenInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ChangePasswordInput,
} from "./auth.schema";

// In-memory reset token store (nên dùng Redis trong production)
const resetTokenStore = new Map<string, { userId: string; expiresAt: Date }>();

const SALT_ROUNDS = 12;

const buildTokens = (user: { id: string; email: string; role: any }) => {
  const payload = { sub: user.id, email: user.email, role: user.role };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
};

const safeUser = (user: any) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  avatar: user.avatar,
  createdAt: user.createdAt,
});

// ── Register ──────────────────────────────────────────────────
export const register = async (input: RegisterInput) => {
  const exists = await prisma.user.findUnique({
    where: { email: input.email },
  });
  if (exists) throw { status: 409, message: "Email đã được sử dụng" };

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      phone: input.phone,
    },
  });

  // Gửi email chào mừng (không block response)
  sendMail({
    to: user.email,
    subject: "Chào mừng bạn đến với Herbal Shop 🌿",
    html: welcomeEmailHtml(user.name),
  }).catch(console.error);

  const tokens = buildTokens(user);

  // Lưu refresh token vào DB
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  await prisma.refreshToken.create({
    data: { token: tokens.refreshToken, userId: user.id, expiresAt },
  });

  return { user: safeUser(user), ...tokens };
};

// ── Login ─────────────────────────────────────────────────────
export const login = async (input: LoginInput) => {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  if (!user) {
    throw { status: 401, message: "Email hoặc mật khẩu không đúng" };
  }

  if (!user.isActive) {
    throw { status: 403, message: "Tài khoản đã bị khoá" };
  }

  const isMatch = await bcrypt.compare(input.password, user.passwordHash);
  if (!isMatch) {
    throw { status: 401, message: "Email hoặc mật khẩu không đúng" };
  }

  const tokens = buildTokens(user);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  await prisma.refreshToken.create({
    data: { token: tokens.refreshToken, userId: user.id, expiresAt },
  });

  return { user: safeUser(user), ...tokens };
};

// ── Refresh Token ─────────────────────────────────────────────
export const refreshToken = async (input: RefreshTokenInput) => {
  let payload;
  try {
    payload = verifyRefreshToken(input.refreshToken);
  } catch {
    throw {
      status: 401,
      message: "Refresh token không hợp lệ hoặc đã hết hạn",
    };
  }

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: input.refreshToken },
    include: { user: true },
  });

  if (!storedToken || storedToken.expiresAt < new Date()) {
    throw {
      status: 401,
      message: "Refresh token không tồn tại hoặc đã hết hạn",
    };
  }

  // Rotate token: xóa cũ, tạo mới
  await prisma.refreshToken.delete({ where: { id: storedToken.id } });

  const tokens = buildTokens(storedToken.user);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  await prisma.refreshToken.create({
    data: { token: tokens.refreshToken, userId: storedToken.userId, expiresAt },
  });

  return tokens;
};

// ── Logout ────────────────────────────────────────────────────
export const logout = async (refreshToken: string) => {
  await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
};

// ── Forgot Password ───────────────────────────────────────────
export const forgotPassword = async (input: ForgotPasswordInput) => {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  // Luôn trả về thành công để tránh email enumeration
  if (!user) return;

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 phút

  resetTokenStore.set(token, { userId: user.id, expiresAt });

  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${token}`;

  await sendMail({
    to: user.email,
    subject: "Đặt lại mật khẩu Herbal Shop",
    html: resetPasswordEmailHtml(user.name, resetUrl),
  });
};

// ── Reset Password ────────────────────────────────────────────
export const resetPassword = async (input: ResetPasswordInput) => {
  const record = resetTokenStore.get(input.token);
  if (!record || record.expiresAt < new Date()) {
    throw {
      status: 400,
      message: "Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn",
    };
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  await prisma.user.update({
    where: { id: record.userId },
    data: { passwordHash },
  });

  // Xóa token + tất cả refresh tokens của user
  resetTokenStore.delete(input.token);
  await prisma.refreshToken.deleteMany({ where: { userId: record.userId } });
};

// ── Change Password ───────────────────────────────────────────
export const changePassword = async (
  userId: string,
  input: ChangePasswordInput,
) => {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  const isMatch = await bcrypt.compare(
    input.currentPassword,
    user.passwordHash,
  );
  if (!isMatch) throw { status: 400, message: "Mật khẩu hiện tại không đúng" };

  const passwordHash = await bcrypt.hash(input.newPassword, SALT_ROUNDS);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  // Xóa toàn bộ refresh tokens → đăng xuất tất cả thiết bị
  await prisma.refreshToken.deleteMany({ where: { userId } });
};

// ── Get Me ────────────────────────────────────────────────────
export const getMe = async (userId: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: {
      vendor: {
        select: { id: true, shopName: true, status: true, slug: true },
      },
    },
  });
  return safeUser({ ...user, vendor: user.vendor });
};
