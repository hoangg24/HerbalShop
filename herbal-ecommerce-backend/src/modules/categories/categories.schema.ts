// src/modules/categories/categories.schema.ts
import { z } from 'zod'

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Tên danh mục phải có ít nhất 2 ký tự').max(100),
    parentId: z.string().uuid().optional(),
    imageUrl: z.string().url().optional(),
    sortOrder: z.number().int().optional().default(0),
  }),
})

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    parentId: z.string().uuid().nullable().optional(),
    imageUrl: z.string().url().optional(),
    sortOrder: z.number().int().optional(),
  }),
})

export type CreateCategoryInput = z.infer<typeof createCategorySchema>['body']
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>['body']
