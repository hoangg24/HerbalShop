// src/modules/products/products.controller.ts
import { Request, Response, NextFunction } from "express";
import * as productsService from "./products.service";
import { sendSuccess, sendError } from "../../utils/response";
import { AuthRequest } from "../../types";

// ── Public ────────────────────────────────────────────────────
export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { data, meta } = await productsService.getProducts(req.query as any);
    return sendSuccess(res, data, "Success", 200, meta);
  } catch (err) {
    next(err);
  }
};

interface GetProductRequest extends Request {
  params: {
    slug: string; // Khai báo rõ ràng là string đơn, không lo bị dính mảng string[]
  };
}

// 2. Gắn Interface vào req và đổi err từ 'any' sang 'unknown'
export const getProductBySlug = async (
  req: GetProductRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    // TypeScript lúc này hiểu chắc chắn req.params.slug là string, gọi service xanh mượt!
    const product = await productsService.getProductBySlug(req.params.slug);

    return sendSuccess(res, product);
  } catch (err: unknown) {
    // Ép kiểu phòng vệ an toàn để kiểm tra thuộc tính lỗi mà không dùng any
    const error = err as { status?: number; message?: string };

    if (error.status) {
      return sendError(
        res,
        error.message || "Đã xảy ra lỗi khi tải sản phẩm",
        error.status,
      );
    }

    next(err);
  }
};

// ── Vendor ────────────────────────────────────────────────────
export const getMyProducts = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { products, meta } = await productsService.getMyProducts(
      req.user!.sub,
      req.query as any,
    );
    return sendSuccess(res, products, "Success", 200, meta);
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
};

export const createProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const product = await productsService.createProduct(
      req.user!.sub,
      req.body,
    );
    return sendSuccess(res, product, "Tạo sản phẩm thành công", 201);
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
};

export const updateProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const product = await productsService.updateProduct(
      req.user!.sub,
      req.params.id,
      req.body,
    );
    return sendSuccess(res, product, "Cập nhật sản phẩm thành công");
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
};

export const deleteProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    await productsService.deleteProduct(req.user!.sub, req.params.id);
    return sendSuccess(res, null, "Xóa sản phẩm thành công");
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
};

export const addProductImages = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    await productsService.addProductImages(
      req.user!.sub,
      req.params.id,
      req.body,
    );
    return sendSuccess(res, null, "Thêm ảnh thành công", 201);
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
};

export const deleteProductImage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    await productsService.deleteProductImage(req.user!.sub, req.params.imageId);
    return sendSuccess(res, null, "Xóa ảnh thành công");
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
};

// ── Admin ─────────────────────────────────────────────────────
export const adminGetProducts = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { products, meta } = await productsService.adminGetProducts(
      req.query as any,
    );
    return sendSuccess(res, products, "Success", 200, meta);
  } catch (err) {
    next(err);
  }
};

export const adminToggleProductStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const product = await productsService.adminToggleProductStatus(
      req.params.id,
      req.body.status,
    );
    const message =
      req.body.status === "active" ? "Đã hiện sản phẩm" : "Đã ẩn sản phẩm";
    return sendSuccess(res, product, message);
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
};
