// src/modules/cart/cart.controller.ts
import { Response, NextFunction } from "express";
import * as cartService from "./cart.service";
import { sendSuccess, sendError } from "../../utils/response";
import { AuthRequest } from "../../types";

export const getCart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const cart = await cartService.getCart(req.user!.sub);
    return sendSuccess(res, cart);
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
};

export const addCartItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const cart = await cartService.addCartItem(req.user!.sub, req.body);
    return sendSuccess(res, cart, "Đã thêm vào giỏ hàng", 201);
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
};

export const updateCartItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const cart = await cartService.updateCartItem(
      req.user!.sub,
      req.params.productId,
      req.body.quantity,
    );
    return sendSuccess(res, cart, "Đã cập nhật giỏ hàng");
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
};

export const removeCartItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const cart = await cartService.removeCartItem(
      req.user!.sub,
      req.params.productId,
    );
    return sendSuccess(res, cart, "Đã xóa sản phẩm khỏi giỏ hàng");
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
};

export const clearCart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    await cartService.clearCart(req.user!.sub);
    return sendSuccess(res, null, "Đã xóa toàn bộ giỏ hàng");
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
};

export const syncCart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const cart = await cartService.syncCart(req.user!.sub, req.body);
    return sendSuccess(res, cart, "Đã đồng bộ giỏ hàng");
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status);
    next(err);
  }
};
