// src/modules/users/users.schema.ts
import { z } from "zod";

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Tên phải có ít nhất 2 ký tự").max(100).optional(),
    phone: z
      .string()
      .regex(/^(0|\+84)[0-9]{9}$/, "Số điện thoại không hợp lệ")
      .optional(),
    avatar: z.string().url("Avatar không hợp lệ").optional(),
  }),
});

export const updateRoleSchema = z.object({
  body: z.object({
    role: z.enum(["admin", "vendor", "buyer"]),
  }),
});

export const createAddressSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
    phone: z.string().regex(/^(0|\+84)[0-9]{9}$/, "Số điện thoại không hợp lệ"),
    addressLine: z.string().min(5, "Địa chỉ phải có ít nhất 5 ký tự"),
    ward: z.string().optional(),
    district: z.string().min(1, "Vui lòng nhập quận/huyện"),
    city: z.string().min(1, "Vui lòng nhập tỉnh/thành phố"),
    isDefault: z.boolean().optional().default(false),
  }),
});

export const updateAddressSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).optional(),
    phone: z
      .string()
      .regex(/^(0|\+84)[0-9]{9}$/, "Số điện thoại không hợp lệ")
      .optional(),
    addressLine: z.string().min(5).optional(),
    ward: z.string().optional(),
    district: z.string().optional(),
    city: z.string().optional(),
    isDefault: z.boolean().optional(),
  }),
});

export const getUsersQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().default("1"),
    limit: z.string().optional().default("10"),
    search: z.string().optional(),
    role: z.enum(["admin", "vendor", "buyer"]).optional(),
    isActive: z.enum(["true", "false"]).optional(),
  }),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>["body"];
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>["body"];
export type CreateAddressInput = z.infer<typeof createAddressSchema>["body"];
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>["body"];
export type GetUsersQuery = z.infer<typeof getUsersQuerySchema>["query"];
