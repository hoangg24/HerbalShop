// src/modules/users/users.service.ts
import { Role } from "@prisma/client";
import { prisma } from "../../config/prisma";
import {
  UpdateProfileInput,
  UpdateRoleInput,
  CreateAddressInput,
  UpdateAddressInput,
  GetUsersQuery,
} from "./users.schema";

// ── Helpers ───────────────────────────────────────────────────
const safeUser = (user: any) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  avatar: user.avatar,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  vendor: user.vendor ?? undefined,
});

// ── Profile ───────────────────────────────────────────────────
export const getProfile = async (userId: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: {
      vendor: {
        select: {
          id: true,
          shopName: true,
          slug: true,
          status: true,
          logoUrl: true,
        },
      },
    },
  });
  return safeUser(user);
};

export const updateProfile = async (
  userId: string,
  input: UpdateProfileInput,
) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(input.name && { name: input.name }),
      ...(input.phone && { phone: input.phone }),
      ...(input.avatar && { avatar: input.avatar }),
    },
    include: {
      vendor: {
        select: { id: true, shopName: true, slug: true, status: true },
      },
    },
  });
  return safeUser(user);
};

// ── Address ───────────────────────────────────────────────────
export const getAddresses = async (userId: string) => {
  return prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { id: "asc" }],
  });
};

export const createAddress = async (
  userId: string,
  input: CreateAddressInput,
) => {
  // Nếu isDefault = true thì bỏ default của các địa chỉ khác
  if (input.isDefault) {
    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
  }

  // Nếu chưa có địa chỉ nào thì tự động set default
  const count = await prisma.address.count({ where: { userId } });
  const isDefault = input.isDefault || count === 0;

  return prisma.address.create({
    data: { ...input, userId, isDefault },
  });
};

export const updateAddress = async (
  userId: string,
  addressId: string,
  input: UpdateAddressInput,
) => {
  // Kiểm tra địa chỉ có thuộc user không
  const address = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });
  if (!address) throw { status: 404, message: "Không tìm thấy địa chỉ" };

  if (input.isDefault) {
    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
  }

  return prisma.address.update({
    where: { id: addressId },
    data: input,
  });
};

export const deleteAddress = async (userId: string, addressId: string) => {
  const address = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });
  if (!address) throw { status: 404, message: "Không tìm thấy địa chỉ" };
  if (address.isDefault)
    throw {
      status: 400,
      message:
        "Không thể xóa địa chỉ mặc định, hãy đặt địa chỉ khác làm mặc định trước",
    };

  await prisma.address.delete({ where: { id: addressId } });
};

export const setDefaultAddress = async (userId: string, addressId: string) => {
  const address = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });
  if (!address) throw { status: 404, message: "Không tìm thấy địa chỉ" };

  await prisma.address.updateMany({
    where: { userId },
    data: { isDefault: false },
  });

  return prisma.address.update({
    where: { id: addressId },
    data: { isDefault: true },
  });
};

// ── Admin: Quản lý users ──────────────────────────────────────
export const getUsers = async (query: GetUsersQuery) => {
  const page = parseInt(query.page);
  const limit = parseInt(query.limit);
  const skip = (page - 1) * limit;

  const where: any = {};
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { email: { contains: query.search, mode: "insensitive" } },
      { phone: { contains: query.search, mode: "insensitive" } },
    ];
  }
  if (query.role) where.role = query.role;
  if (query.isActive !== undefined) where.isActive = query.isActive === "true";

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        vendor: {
          select: { id: true, shopName: true, status: true },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getUserById = async (userId: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: {
      vendor: true,
      addresses: true,
      _count: {
        select: { orders: true, reviews: true },
      },
    },
  });
  return safeUser({
    ...user,
    orderCount: user._count.orders,
    reviewCount: user._count.reviews,
  });
};

export const updateUserRole = async (
  targetUserId: string,
  input: UpdateRoleInput,
) => {
  // Không cho đổi role của chính mình (admin tự hạ quyền)
  const user = await prisma.user.update({
    where: { id: targetUserId },
    data: { role: input.role as Role },
    select: { id: true, name: true, email: true, role: true },
  });
  return user;
};

export const toggleUserActive = async (targetUserId: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: targetUserId },
  });

  return prisma.user.update({
    where: { id: targetUserId },
    data: { isActive: !user.isActive },
    select: { id: true, name: true, email: true, isActive: true },
  });
};
