import { Request, Response, NextFunction } from "express";
import { ZodTypeAny, z } from "zod";

export const validate = <T extends ZodTypeAny>(schema: T) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      return res.status(422).json({
        success: false,
        message: "Dữ liệu không hợp lệ",
        errors: result.error.issues.map((e) => ({
          // Sửa nhẹ chỗ này: Cắt bỏ chữ "body", "params" hoặc "query" ở đầu path để tạo field name sạch cho client đọc
          field: e.path.slice(1).join("."),
          message: e.message,
        })),
      });
    }

    const validatedData = result.data as any; // Chỗ này bắt buộc phải ép tạm hoặc dùng giải pháp chuẩn dưới đây

    if (validatedData && typeof validatedData === "object") {
      if ("body" in validatedData) req.body = validatedData.body;

      // Thay vì gán đè cả object req.params, ta chỉ cập nhật các key có bên trong nó
      if ("params" in validatedData && validatedData.params) {
        Object.assign(req.params, validatedData.params);
      }

      // Tương tự với query, dùng Object.assign để copy thuộc tính mà không làm mất kiểu gốc của Express
      if ("query" in validatedData && validatedData.query) {
        Object.assign(req.query, validatedData.query);
      }
    }

    next();
  };
};
