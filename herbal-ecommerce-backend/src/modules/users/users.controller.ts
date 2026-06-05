// src/modules/users/users.controller.ts
import { Response, NextFunction } from "express";
import * as usersService from "./users.service";
import { sendSuccess, sendError } from "../../utils/response";
import { AuthRequest } from "../../types";

// ── Profile ───────────────────────────────────────────────────
export const getProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await usersService.getProfile(req.user!.sub);
    return sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await usersService.updateProfile(req.user!.sub, req.body);
    return sendSuccess(res, user, "Cập nhật profile thành công");
  } catch (err) {
    next(err);
  }
};

// ── Addresses ─────────────────────────────────────────────────
export const getAddresses = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const addresses = await usersService.getAddresses(req.user!.sub);
    return sendSuccess(res, addresses);
  } catch (err) {
    next(err);
  }
};

export const createAddress = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const address = await usersService.createAddress(req.user!.sub, req.body);
    return sendSuccess(res, address, "Thêm địa chỉ thành công", 201);
  } catch (err) {
    next(err);
  }
};

export const updateAddress = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const address = await usersService.updateAddress(
      req.user!.sub,
      req.params.id,
      req.body,
    );
    return sendSuccess(res, address, "Cập nhật địa chỉ thành công");
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
};

export const deleteAddress = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    await usersService.deleteAddress(req.user!.sub, req.params.id);
    return sendSuccess(res, null, "Xóa địa chỉ thành công");
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
};

export const setDefaultAddress = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const address = await usersService.setDefaultAddress(
      req.user!.sub,
      req.params.id,
    );
    return sendSuccess(res, address, "Đã đặt làm địa chỉ mặc định");
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
};

// ── Admin ─────────────────────────────────────────────────────
export const getUsers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { users, meta } = await usersService.getUsers(req.query as any);
    return sendSuccess(res, users, "Success", 200, meta);
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await usersService.getUserById(req.params.id);
    return sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
};

export const updateUserRole = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Admin không thể tự đổi role của chính mình
    if (req.params.id === req.user!.sub) {
      return sendError(res, "Không thể thay đổi role của chính mình", 400);
    }
    const user = await usersService.updateUserRole(req.params.id, req.body);
    return sendSuccess(res, user, "Cập nhật role thành công");
  } catch (err) {
    next(err);
  }
};

export const toggleUserActive = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.params.id === req.user!.sub) {
      return sendError(res, "Không thể khoá tài khoản của chính mình", 400);
    }
    const user = await usersService.toggleUserActive(req.params.id);
    const message = user.isActive
      ? "Đã mở khoá tài khoản"
      : "Đã khoá tài khoản";
    return sendSuccess(res, user, message);
  } catch (err) {
    next(err);
  }
};
