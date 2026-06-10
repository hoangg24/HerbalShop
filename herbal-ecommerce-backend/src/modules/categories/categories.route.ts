// src/modules/categories/categories.route.ts
import { Router } from 'express'
import * as categoriesController from './categories.controller'
import { authenticate, authorize } from '../../middlewares/authenticate'
import { validate } from '../../middlewares/validate'
import { createCategorySchema, updateCategorySchema } from './categories.schema'

const router = Router()

// ── Public ────────────────────────────────────────────────────
router.get('/', categoriesController.getCategories)
router.get('/:slug', categoriesController.getCategoryBySlug)

// ── Admin only ────────────────────────────────────────────────
router.post('/', authenticate, authorize('admin'), validate(createCategorySchema), categoriesController.createCategory)
router.patch('/:id', authenticate, authorize('admin'), validate(updateCategorySchema), categoriesController.updateCategory)
router.delete('/:id', authenticate, authorize('admin'), categoriesController.deleteCategory)

export default router
