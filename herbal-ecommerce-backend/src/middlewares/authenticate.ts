// src/middlewares/authenticate.ts
import { Response, NextFunction } from 'express'
import { verifyAccessToken } from '../utils/jwt'
import { sendError } from '../utils/response'
import { AuthRequest } from '../types'
import { Role } from '@prisma/client'

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return sendError(res, 'Bạn chưa đăng nhập', 401)
    }

    const token = authHeader.split(' ')[1]
    const payload = verifyAccessToken(token)
    req.user = payload
    next()
  } catch {
    return sendError(res, 'Token không hợp lệ hoặc đã hết hạn', 401)
  }
}

export const authorize = (...roles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'Bạn chưa đăng nhập', 401)
    }
    if (!roles.includes(req.user.role)) {
      return sendError(res, 'Bạn không có quyền thực hiện hành động này', 403)
    }
    next()
  }
}
