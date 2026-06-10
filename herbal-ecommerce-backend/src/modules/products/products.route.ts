// src/modules/products/products.route.ts
import { Router } from 'express'
import * as productsController from './products.controller'
import { authenticate, authorize } from '../../middlewares/authenticate'
import { validate } from '../../middlewares/validate'
import {
  createProductSchema,
  updateProductSchema,
  getProductsQuerySchema,
  addProductImagesSchema,
} from './products.schema'

const router = Router()

// ── Public ────────────────────────────────────────────────────

// GET /api/products
router.get('/', validate(getProductsQuerySchema), productsController.getProducts)

// GET /api/products/:slug
router.get('/:slug', productsController.getProductBySlug)

// ── Vendor ────────────────────────────────────────────────────

// GET /api/products/vendor/my — sản phẩm của shop mình
router.get(
  '/vendor/my',
  authenticate,
  authorize('vendor'),
  validate(getProductsQuerySchema),
  productsController.getMyProducts
)

// POST /api/products — tạo sản phẩm
router.post(
  '/',
  authenticate,
  authorize('vendor'),
  validate(createProductSchema),
  productsController.createProduct
)

// PATCH /api/products/:id — cập nhật sản phẩm
router.patch(
  '/:id',
  authenticate,
  authorize('vendor'),
  validate(updateProductSchema),
  productsController.updateProduct
)

// DELETE /api/products/:id — xóa sản phẩm
router.delete(
  '/:id',
  authenticate,
  authorize('vendor'),
  productsController.deleteProduct
)

// POST /api/products/:id/images — thêm ảnh
router.post(
  '/:id/images',
  authenticate,
  authorize('vendor'),
  validate(addProductImagesSchema),
  productsController.addProductImages
)

// DELETE /api/products/:id/images/:imageId — xóa ảnh
router.delete(
  '/:id/images/:imageId',
  authenticate,
  authorize('vendor'),
  productsController.deleteProductImage
)

// ── Admin ─────────────────────────────────────────────────────

// GET /api/products/admin/all — admin xem tất cả sản phẩm
router.get(
  '/admin/all',
  authenticate,
  authorize('admin'),
  validate(getProductsQuerySchema),
  productsController.adminGetProducts
)

// PATCH /api/products/admin/:id/status — ẩn/hiện sản phẩm
router.patch(
  '/admin/:id/status',
  authenticate,
  authorize('admin'),
  productsController.adminToggleProductStatus
)

export default router
