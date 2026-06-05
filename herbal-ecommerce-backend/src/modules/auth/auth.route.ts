// src/modules/auth/auth.route.ts
import { Router } from 'express'
import * as authController from './auth.controller'
import { validate } from '../../middlewares/validate'
import { authenticate } from '../../middlewares/authenticate'
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from './auth.schema'

const router = Router()

// POST /api/auth/register
router.post('/register', validate(registerSchema), authController.register)

// POST /api/auth/login
router.post('/login', validate(loginSchema), authController.login)

// POST /api/auth/refresh
router.post('/refresh', validate(refreshTokenSchema), authController.refreshToken)

// POST /api/auth/logout
router.post('/logout', authController.logout)

// POST /api/auth/forgot-password
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword)

// POST /api/auth/reset-password
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword)

// POST /api/auth/change-password  (cần đăng nhập)
router.post(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword
)

// GET /api/auth/me  (cần đăng nhập)
router.get('/me', authenticate, authController.getMe)

export default router
