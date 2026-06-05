// src/middlewares/errorHandler.ts
import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.error("[Error]", err);

  // Zod validation error
  if (err instanceof ZodError) {
    return res.status(422).json({
      success: false,
      message: "Dữ liệu không hợp lệ",
      errors: err.issues.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
  }

  // Prisma unique constraint
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Dữ liệu đã tồn tại trong hệ thống",
      });
    }
    if (err.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy dữ liệu",
      });
    }
  }

  // Default
  return res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Lỗi hệ thống, vui lòng thử lại sau"
        : err.message,
  });
};

export const notFound = (_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: "Route không tồn tại" });
};
