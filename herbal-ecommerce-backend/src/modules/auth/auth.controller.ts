// src/modules/auth/auth.controller.ts
import { Request, Response, NextFunction } from 'express'
import * as authService from './auth.service'
import { sendSuccess, sendError } from '../../utils/response'
import { AuthRequest } from '../../types'

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.register(req.body)
    return sendSuccess(res, result, 'Đăng ký thành công', 201)
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status)
    next(err)
  }
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.login(req.body)
    return sendSuccess(res, result, 'Đăng nhập thành công')
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status)
    next(err)
  }
}

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tokens = await authService.refreshToken(req.body)
    return sendSuccess(res, tokens, 'Làm mới token thành công')
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status)
    next(err)
  }
}

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body
    if (refreshToken) await authService.logout(refreshToken)
    return sendSuccess(res, null, 'Đăng xuất thành công')
  } catch (err) {
    next(err)
  }
}

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authService.forgotPassword(req.body)
    return sendSuccess(
      res,
      null,
      'Nếu email tồn tại, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu'
    )
  } catch (err) {
    next(err)
  }
}

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authService.resetPassword(req.body)
    return sendSuccess(res, null, 'Đặt lại mật khẩu thành công')
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status)
    next(err)
  }
}

export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await authService.changePassword(req.user!.sub, req.body)
    return sendSuccess(res, null, 'Đổi mật khẩu thành công')
  } catch (err: any) {
    if (err.status) return sendError(res, err.message, err.status)
    next(err)
  }
}

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await authService.getMe(req.user!.sub)
    return sendSuccess(res, user)
  } catch (err) {
    next(err)
  }
}
