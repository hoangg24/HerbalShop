// src/modules/categories/categories.controller.ts
import { Request, Response, NextFunction } from "express";
import * as categoriesService from "./categories.service";
import { sendSuccess, sendError } from "../../utils/response";
import { AuthRequest } from "../../types";

export const getCategories = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const categories = await categoriesService.getCategories();
    return sendSuccess(res, categories);
  } catch (err) {
    next(err);
  }
};

interface GetCategoryRequest extends Request {
  params: {
    slug: string; // Chốt chặn string đơn, gạt bỏ hoàn toàn nguy cơ mảng string[]
  };
}

// 2. Gắn Interface mới vào req và dọn sạch 'any' ở catch
export const getCategoryBySlug = async (
  req: GetCategoryRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    // TypeScript tự tin hiểu req.params.slug là string sạch, không một vết gạch đỏ!
    const category = await categoriesService.getCategoryBySlug(req.params.slug);

    return sendSuccess(res, category);
  } catch (err: unknown) {
    // Ép kiểu phòng vệ an toàn để bắt các thuộc tính lỗi tập trung
    const error = err as { status?: number; message?: string };

    if (error.status) {
      return sendError(
        res,
        error.message || "Đã xảy ra lỗi khi tải danh mục",
        error.status,
      );
    }

    next(err);
  }
};

export const createCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const category = await categoriesService.createCategory(req.body);
    return sendSuccess(res, category, "Tạo danh mục thành công", 201);
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
};

export const updateCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const category = await categoriesService.updateCategory(
      req.params.id,
      req.body,
    );
    return sendSuccess(res, category, "Cập nhật danh mục thành công");
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
};

export const deleteCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    await categoriesService.deleteCategory(req.params.id);
    return sendSuccess(res, null, "Xóa danh mục thành công");
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
};
