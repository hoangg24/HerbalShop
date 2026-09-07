import { z } from "zod";

export const addCartItemSchema = z.object({
  body: z.object({
    productId: z.string().uuid("Sản phẩm không hợp lệ"),
    quantity: z.number().int().positive("Số lượng phải lớn hơn 0").default(1),
  }),
});

export const updateCartItemSchema = z.object({
  params: z.object({
    productId: z.string().uuid("Sản phẩm không hợp lệ"),
  }),
  body: z.object({
    quantity: z.number().int().positive("Số lượng phải lớn hơn 0"),
  }),
});

export const syncCartSchema = z.object({
  body: z.object({
    items: z
      .array(
        z.object({
          productId: z.string().uuid("Sản phẩm không hợp lệ"),
          quantity: z.number().int().positive("Số lượng phải lớn hơn 0"),
        }),
      )
      .default([]),
  }),
});

export type AddCartItemInput = z.infer<typeof addCartItemSchema>["body"];
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>["body"];
export type SyncCartInput = z.infer<typeof syncCartSchema>["body"];
