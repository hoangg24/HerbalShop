// src/modules/products/products.schema.ts
import { z } from 'zod'

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Tên sản phẩm phải có ít nhất 3 ký tự').max(200),
    categoryId: z.string().uuid('Category không hợp lệ'),
    description: z.string().optional(),
    price: z.number().positive('Giá phải lớn hơn 0'),
    salePrice: z.number().positive().optional(),
    stock: z.number().int().min(0, 'Số lượng không hợp lệ').default(0),
    unit: z.string().default('gói'),
    weight: z.number().positive().optional(),
    status: z.enum(['draft', 'active', 'inactive']).default('draft'),
  }),
})

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(3).max(200).optional(),
    categoryId: z.string().uuid().optional(),
    description: z.string().optional(),
    price: z.number().positive().optional(),
    salePrice: z.number().positive().nullable().optional(),
    stock: z.number().int().min(0).optional(),
    unit: z.string().optional(),
    weight: z.number().positive().optional(),
    status: z.enum(['draft', 'active', 'inactive']).optional(),
  }),
})

export const getProductsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('12'),
    search: z.string().optional(),
    categoryId: z.string().optional(),
    vendorId: z.string().optional(),
    status: z.enum(['draft', 'active', 'inactive']).optional(),
    minPrice: z.string().optional(),
    maxPrice: z.string().optional(),
    sortBy: z.enum(['createdAt', 'price', 'soldCount', 'viewCount']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
})

export const addProductImagesSchema = z.object({
  body: z.object({
    images: z.array(
      z.object({
        url: z.string().url('URL ảnh không hợp lệ'),
        altText: z.string().optional(),
        isPrimary: z.boolean().optional().default(false),
        sortOrder: z.number().int().optional().default(0),
      })
    ).min(1, 'Phải có ít nhất 1 ảnh'),
  }),
})

export type CreateProductInput = z.infer<typeof createProductSchema>['body']
export type UpdateProductInput = z.infer<typeof updateProductSchema>['body']
export type GetProductsQuery = z.infer<typeof getProductsQuerySchema>['query']
export type AddProductImagesInput = z.infer<typeof addProductImagesSchema>['body']
