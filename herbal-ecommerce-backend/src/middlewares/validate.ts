import { Request, Response, NextFunction } from "express";
import { ZodTypeAny, z } from "zod"; // 1. Import ZodTypeAny thay vì ZodAny

// 2. Sử dụng Generic <T ứng với ZodTypeAny> để TypeScript tự suy luận kiểu dữ liệu động
export const validate = <T extends ZodTypeAny>(schema: T) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Ép kiểu cho cục object đưa vào safeParse để Zod hiểu cấu trúc
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
          field: e.path.slice(1).join("."), // bỏ "body" ở đầu path
          message: e.message,
        })),
      });
    }

    // 3. Sử dụng z.infer<T> để TypeScript tự bóc tách dữ liệu chuẩn chỉnh 100%
    const validatedData = result.data as z.infer<T>;

    // Kiểm tra xem dữ liệu sau validate có chứa thuộc tính body không rồi gán lại
    if (
      validatedData &&
      typeof validatedData === "object" &&
      "body" in validatedData
    ) {
      req.body = validatedData.body ?? req.body;
    }

    next();
  };
};
