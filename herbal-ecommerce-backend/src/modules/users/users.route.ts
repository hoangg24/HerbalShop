// src/modules/users/users.route.ts
import { Router } from 'express'
import * as usersController from './users.controller'
import { authenticate, authorize } from '../../middlewares/authenticate'
import { validate } from '../../middlewares/validate'
import {
  updateProfileSchema,
  updateRoleSchema,
  createAddressSchema,
  updateAddressSchema,
  getUsersQuerySchema,
} from './users.schema'

const router = Router()

// ── Profile (tất cả user đã đăng nhập) ───────────────────────

// GET  /api/users/profile
router.get('/profile', authenticate, usersController.getProfile)

// PATCH /api/users/profile
router.patch('/profile', authenticate, validate(updateProfileSchema), usersController.updateProfile)

// ── Addresses ─────────────────────────────────────────────────

// GET  /api/users/addresses
router.get('/addresses', authenticate, usersController.getAddresses)

// POST /api/users/addresses
router.post('/addresses', authenticate, validate(createAddressSchema), usersController.createAddress)

// PATCH /api/users/addresses/:id
router.patch('/addresses/:id', authenticate, validate(updateAddressSchema), usersController.updateAddress)

// DELETE /api/users/addresses/:id
router.delete('/addresses/:id', authenticate, usersController.deleteAddress)

// PATCH /api/users/addresses/:id/set-default
router.patch('/addresses/:id/set-default', authenticate, usersController.setDefaultAddress)

// ── Admin only ────────────────────────────────────────────────

// GET  /api/users — danh sách users
router.get('/', authenticate, authorize('admin'), validate(getUsersQuerySchema), usersController.getUsers)

// GET  /api/users/:id — chi tiết user
router.get('/:id', authenticate, authorize('admin'), usersController.getUserById)

// PATCH /api/users/:id/role — đổi role
router.patch('/:id/role', authenticate, authorize('admin'), validate(updateRoleSchema), usersController.updateUserRole)

// PATCH /api/users/:id/toggle-active — khoá/mở tài khoản
router.patch('/:id/toggle-active', authenticate, authorize('admin'), usersController.toggleUserActive)

export default router
