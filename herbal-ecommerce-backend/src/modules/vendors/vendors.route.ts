// src/modules/vendors/vendors.route.ts
import { Router } from 'express'
import * as vendorsController from './vendors.controller'
import { authenticate, authorize } from '../../middlewares/authenticate'
import { validate } from '../../middlewares/validate'
import {
  registerVendorSchema,
  updateVendorSchema,
  reviewVendorSchema,
  getVendorsQuerySchema,
} from './vendors.schema'

const router = Router()

// ── Public ────────────────────────────────────────────────────

// GET /api/vendors/shop/:slug — xem thông tin shop public
router.get('/shop/:slug', vendorsController.getVendorBySlug)

// ── Buyer (đã đăng nhập) ──────────────────────────────────────

// POST /api/vendors/register — đăng ký trở thành vendor
router.post(
  '/register',
  authenticate,
  validate(registerVendorSchema),
  vendorsController.registerVendor
)

// GET /api/vendors/me — xem thông tin shop của mình
router.get('/me', authenticate, vendorsController.getMyVendor)

// PATCH /api/vendors/me — cập nhật thông tin shop
router.patch(
  '/me',
  authenticate,
  authorize('vendor'),
  validate(updateVendorSchema),
  vendorsController.updateMyVendor
)

// ── Admin only ────────────────────────────────────────────────

// GET /api/vendors — danh sách tất cả vendors
router.get(
  '/',
  authenticate,
  authorize('admin'),
  validate(getVendorsQuerySchema),
  vendorsController.getVendors
)

// GET /api/vendors/:id — chi tiết vendor
router.get('/:id', authenticate, authorize('admin'), vendorsController.getVendorById)

// PATCH /api/vendors/:id/review — duyệt / tạm ngưng
router.patch(
  '/:id/review',
  authenticate,
  authorize('admin'),
  validate(reviewVendorSchema),
  vendorsController.reviewVendor
)

// PATCH /api/vendors/:id/commission — cập nhật hoa hồng
router.patch(
  '/:id/commission',
  authenticate,
  authorize('admin'),
  vendorsController.updateCommissionRate
)

export default router
