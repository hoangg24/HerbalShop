// src/modules/vendors/vendors.controller.ts
import { Request, Response, NextFunction } from "express";
import * as vendorsService from "./vendors.service";
import { sendSuccess, sendError } from "../../utils/response";
import { AuthRequest } from "../../types";

// ── Buyer ─────────────────────────────────────────────────────
export const registerVendor = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const vendor = await vendorsService.registerVendor(req.user!.sub, req.body);
    return sendSuccess(
      res,
      vendor,
      "Đăng ký shop thành công, vui lòng chờ admin duyệt",
      201,
    );
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
};

export const getMyVendor = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const vendor = await vendorsService.getMyVendor(req.user!.sub);
    return sendSuccess(res, vendor);
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
};

export const updateMyVendor = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const vendor = await vendorsService.updateMyVendor(req.user!.sub, req.body);
    return sendSuccess(res, vendor, "Cập nhật thông tin shop thành công");
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
};

// ── Public ────────────────────────────────────────────────────
// 1. Định nghĩa cấu trúc params chuẩn cho API này
interface GetVendorRequest extends Request {
  params: {
    slug: string; // Khai báo rõ ràng là string đơn, không cho phép mảng string[]
  };
}

// 2. Thay Request bằng GetVendorRequest, đổi 'any' thành 'unknown' ở catch
export const getVendorBySlug = async (
  req: GetVendorRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    // TypeScript giờ đã biết chắc chắn slug là string, gọi service cực mượt không bị báo đỏ!
    const vendor = await vendorsService.getVendorBySlug(req.params.slug);

    return sendSuccess(res, vendor);
  } catch (err: unknown) {
    // Ép kiểu an toàn cho err để check thuộc tính .status mà không dùng 'any'
    const error = err as { status?: number; message?: string };

    if (error.status) {
      return sendError(res, error.message || "Đã xảy ra lỗi", error.status);
    }

    next(err);
  }
};

// ── Admin ─────────────────────────────────────────────────────
export const getVendors = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { vendors, meta } = await vendorsService.getVendors(req.query as any);
    return sendSuccess(res, vendors, "Success", 200, meta);
  } catch (err) {
    next(err);
  }
};

export const getVendorById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const vendor = await vendorsService.getVendorById(req.params.id);
    return sendSuccess(res, vendor);
  } catch (err) {
    next(err);
  }
};

export const reviewVendor = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const vendor = await vendorsService.reviewVendor(req.params.id, req.body);
    const message =
      req.body.status === "active"
        ? "Đã duyệt shop thành công"
        : "Đã tạm ngưng shop";
    return sendSuccess(res, vendor, message);
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
};

export const updateCommissionRate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const vendor = await vendorsService.updateCommissionRate(
      req.params.id,
      parseFloat(req.body.commissionRate),
    );
    return sendSuccess(res, vendor, "Cập nhật commission rate thành công");
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
};
