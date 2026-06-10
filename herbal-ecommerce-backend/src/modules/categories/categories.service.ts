// src/modules/categories/categories.service.ts
import slugify from 'slugify'
import { prisma } from '../../config/prisma'
import { CreateCategoryInput, UpdateCategoryInput } from './categories.schema'

const generateSlug = async (name: string, excludeId?: string): Promise<string> => {
  let slug = slugify(name, { lower: true, strict: true, locale: 'vi' })
  const existing = await prisma.category.findFirst({
    where: { slug, ...(excludeId && { NOT: { id: excludeId } }) },
  })
  if (existing) slug = `${slug}-${Date.now()}`
  return slug
}

// ── Public ────────────────────────────────────────────────────
export const getCategories = async () => {
  // Lấy danh mục cha kèm danh mục con
  return prisma.category.findMany({
    where: { parentId: null },
    orderBy: { sortOrder: 'asc' },
    include: {
      children: {
        orderBy: { sortOrder: 'asc' },
        include: { _count: { select: { products: true } } },
      },
      _count: { select: { products: true } },
    },
  })
}

export const getCategoryBySlug = async (slug: string) => {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      children: { orderBy: { sortOrder: 'asc' } },
      parent: true,
      _count: { select: { products: true } },
    },
  })
  if (!category) throw { status: 404, message: 'Không tìm thấy danh mục' }
  return category
}

// ── Admin ─────────────────────────────────────────────────────
export const createCategory = async (input: CreateCategoryInput) => {
  const slug = await generateSlug(input.name)

  // Nếu có parentId thì kiểm tra cha tồn tại
  if (input.parentId) {
    const parent = await prisma.category.findUnique({ where: { id: input.parentId } })
    if (!parent) throw { status: 404, message: 'Danh mục cha không tồn tại' }
    // Không cho phép nested quá 2 cấp
    if (parent.parentId) throw { status: 400, message: 'Chỉ hỗ trợ tối đa 2 cấp danh mục' }
  }

  return prisma.category.create({
    data: { ...input, slug },
  })
}

export const updateCategory = async (id: string, input: UpdateCategoryInput) => {
  await prisma.category.findUniqueOrThrow({ where: { id } })

  const slug = input.name ? await generateSlug(input.name, id) : undefined

  return prisma.category.update({
    where: { id },
    data: { ...input, ...(slug && { slug }) },
  })
}

export const deleteCategory = async (id: string) => {
  const category = await prisma.category.findUniqueOrThrow({
    where: { id },
    include: { _count: { select: { products: true, children: true } } },
  })

  if (category._count.products > 0) {
    throw { status: 400, message: 'Không thể xóa danh mục đang có sản phẩm' }
  }
  if (category._count.children > 0) {
    throw { status: 400, message: 'Không thể xóa danh mục đang có danh mục con' }
  }

  await prisma.category.delete({ where: { id } })
}
