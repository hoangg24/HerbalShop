// src/modules/vendors/vendors.schema.ts
import { z } from 'zod'

export const registerVendorSchema = z.object({
  body: z.object({
    shopName: z.string().min(3, 'Tên shop phải có ít nhất 3 ký tự').max(100),
    description: z.string().max(1000).optional(),
    bankAccount: z.string().min(6, 'Số tài khoản không hợp lệ').optional(),
    bankName: z.string().optional(),
  }),
})

export const updateVendorSchema = z.object({
  body: z.object({
    shopName: z.string().min(3).max(100).optional(),
    description: z.string().max(1000).optional(),
    logoUrl: z.string().url('Logo URL không hợp lệ').optional(),
    bannerUrl: z.string().url('Banner URL không hợp lệ').optional(),
    bankAccount: z.string().min(6).optional(),
    bankName: z.string().optional(),
  }),
})

export const reviewVendorSchema = z.object({
  body: z.object({
    status: z.enum(['active', 'suspended']),
    reason: z.string().optional(),
  }),
})

export const getVendorsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('10'),
    search: z.string().optional(),
    status: z.enum(['pending', 'active', 'suspended']).optional(),
  }),
})

export type RegisterVendorInput = z.infer<typeof registerVendorSchema>['body']
export type UpdateVendorInput = z.infer<typeof updateVendorSchema>['body']
export type ReviewVendorInput = z.infer<typeof reviewVendorSchema>['body']
export type GetVendorsQuery = z.infer<typeof getVendorsQuerySchema>['query']
