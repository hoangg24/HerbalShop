// src/modules/products/products.service.ts
import slugify from 'slugify'
import { prisma } from '../../config/prisma'
import {
  CreateProductInput,
  UpdateProductInput,
  GetProductsQuery,
  AddProductImagesInput,
} from './products.schema'

// ── Helpers ───────────────────────────────────────────────────
const generateSlug = async (name: string, excludeId?: string): Promise<string> => {
  let slug = slugify(name, { lower: true, strict: true, locale: 'vi' })
  const existing = await prisma.product.findFirst({
    where: { slug, ...(excludeId && { NOT: { id: excludeId } }) },
  })
  if (existing) slug = `${slug}-${Date.now()}`
  return slug
}

const productSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  price: true,
  salePrice: true,
  stock: true,
  unit: true,
  weight: true,
  status: true,
  soldCount: true,
  viewCount: true,
  createdAt: true,
  updatedAt: true,
  vendor: {
    select: { id: true, shopName: true, slug: true, logoUrl: true },
  },
  category: {
    select: { id: true, name: true, slug: true },
  },
  images: {
    orderBy: { sortOrder: 'asc' as const },
    select: { id: true, url: true, altText: true, isPrimary: true },
  },
  _count: { select: { reviews: true } },
}

// ── Public: Danh sách sản phẩm ────────────────────────────────
export const getProducts = async (query: GetProductsQuery) => {
  const page = parseInt(query.page)
  const limit = parseInt(query.limit)
  const skip = (page - 1) * limit

  const where: any = { status: 'active' } // public chỉ xem active

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } },
    ]
  }
  if (query.categoryId) where.categoryId = query.categoryId
  if (query.vendorId) where.vendorId = query.vendorId
  if (query.minPrice || query.maxPrice) {
    where.price = {}
    if (query.minPrice) where.price.gte = parseFloat(query.minPrice)
    if (query.maxPrice) where.price.lte = parseFloat(query.maxPrice)
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [query.sortBy]: query.sortOrder },
      select: productSelect,
    }),
    prisma.product.count({ where }),
  ])

  return {
    products,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}

// ── Public: Chi tiết sản phẩm ─────────────────────────────────
export const getProductBySlug = async (slug: string) => {
  const product = await prisma.product.findUnique({
    where: { slug },
    select: {
      ...productSelect,
      reviews: {
        where: { isVisible: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          user: { select: { id: true, name: true, avatar: true } },
        },
      },
    },
  })

  if (!product || product.status !== 'active') {
    throw { status: 404, message: 'Không tìm thấy sản phẩm' }
  }

  // Tăng view count (không await để không block response)
  prisma.product.update({
    where: { slug },
    data: { viewCount: { increment: 1 } },
  }).catch(() => {})

  return product
}

// ── Vendor: Lấy sản phẩm của shop mình ───────────────────────
export const getMyProducts = async (userId: string, query: GetProductsQuery) => {
  // Lấy vendorId từ userId — liên kết với module vendors
  const vendor = await prisma.vendor.findUnique({ where: { userId } })
  if (!vendor) throw { status: 404, message: 'Bạn chưa có shop' }
  if (vendor.status !== 'active') throw { status: 403, message: 'Shop của bạn chưa được duyệt' }

  const page = parseInt(query.page)
  const limit = parseInt(query.limit)
  const skip = (page - 1) * limit

  const where: any = { vendorId: vendor.id }
  if (query.search) where.name = { contains: query.search, mode: 'insensitive' }
  if (query.status) where.status = query.status
  if (query.categoryId) where.categoryId = query.categoryId

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: productSelect,
    }),
    prisma.product.count({ where }),
  ])

  return {
    products,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}

// ── Vendor: Tạo sản phẩm ──────────────────────────────────────
export const createProduct = async (userId: string, input: CreateProductInput) => {
  // Lấy vendor từ userId — liên kết với module vendors
  const vendor = await prisma.vendor.findUnique({ where: { userId } })
  if (!vendor) throw { status: 404, message: 'Bạn chưa có shop' }
  if (vendor.status !== 'active') throw { status: 403, message: 'Shop của bạn chưa được duyệt' }

  // Kiểm tra category tồn tại — liên kết với module categories
  const category = await prisma.category.findUnique({ where: { id: input.categoryId } })
  if (!category) throw { status: 404, message: 'Danh mục không tồn tại' }

  // Validate salePrice < price
  if (input.salePrice && input.salePrice >= input.price) {
    throw { status: 400, message: 'Giá khuyến mãi phải nhỏ hơn giá gốc' }
  }

  const slug = await generateSlug(input.name)

  return prisma.product.create({
    data: {
      ...input,
      slug,
      vendorId: vendor.id,
    },
    select: productSelect,
  })
}

// ── Vendor: Cập nhật sản phẩm ────────────────────────────────
export const updateProduct = async (userId: string, productId: string, input: UpdateProductInput) => {
  const vendor = await prisma.vendor.findUnique({ where: { userId } })
  if (!vendor) throw { status: 404, message: 'Bạn chưa có shop' }

  // Kiểm tra sản phẩm thuộc vendor này không
  const product = await prisma.product.findFirst({
    where: { id: productId, vendorId: vendor.id },
  })
  if (!product) throw { status: 404, message: 'Không tìm thấy sản phẩm' }

  if (input.salePrice && input.salePrice >= (input.price ?? product.price.toNumber())) {
    throw { status: 400, message: 'Giá khuyến mãi phải nhỏ hơn giá gốc' }
  }

  const slug = input.name ? await generateSlug(input.name, productId) : undefined

  return prisma.product.update({
    where: { id: productId },
    data: { ...input, ...(slug && { slug }) },
    select: productSelect,
  })
}

// ── Vendor: Xóa sản phẩm ─────────────────────────────────────
export const deleteProduct = async (userId: string, productId: string) => {
  const vendor = await prisma.vendor.findUnique({ where: { userId } })
  if (!vendor) throw { status: 404, message: 'Bạn chưa có shop' }

  const product = await prisma.product.findFirst({
    where: { id: productId, vendorId: vendor.id },
  })
  if (!product) throw { status: 404, message: 'Không tìm thấy sản phẩm' }

  // Không cho xóa sản phẩm đã có đơn hàng
  const orderCount = await prisma.orderItem.count({ where: { productId } })
  if (orderCount > 0) {
    throw { status: 400, message: 'Không thể xóa sản phẩm đã có trong đơn hàng, hãy ẩn đi thay thế' }
  }

  await prisma.product.delete({ where: { id: productId } })
}

// ── Vendor: Quản lý ảnh sản phẩm ─────────────────────────────
export const addProductImages = async (
  userId: string,
  productId: string,
  input: AddProductImagesInput
) => {
  const vendor = await prisma.vendor.findUnique({ where: { userId } })
  if (!vendor) throw { status: 404, message: 'Bạn chưa có shop' }

  const product = await prisma.product.findFirst({
    where: { id: productId, vendorId: vendor.id },
  })
  if (!product) throw { status: 404, message: 'Không tìm thấy sản phẩm' }

  // Nếu có ảnh primary mới thì bỏ primary cũ
  const hasPrimary = input.images.some((img) => img.isPrimary)
  if (hasPrimary) {
    await prisma.productImage.updateMany({
      where: { productId },
      data: { isPrimary: false },
    })
  }

  return prisma.productImage.createMany({
    data: input.images.map((img) => ({ ...img, productId })),
  })
}

export const deleteProductImage = async (userId: string, imageId: string) => {
  const vendor = await prisma.vendor.findUnique({ where: { userId } })
  if (!vendor) throw { status: 404, message: 'Bạn chưa có shop' }

  const image = await prisma.productImage.findFirst({
    where: { id: imageId, product: { vendorId: vendor.id } },
  })
  if (!image) throw { status: 404, message: 'Không tìm thấy ảnh' }
  if (image.isPrimary) throw { status: 400, message: 'Không thể xóa ảnh chính, hãy đặt ảnh khác làm chính trước' }

  await prisma.productImage.delete({ where: { id: imageId } })
}

// ── Admin: Quản lý tất cả sản phẩm ───────────────────────────
export const adminGetProducts = async (query: GetProductsQuery) => {
  const page = parseInt(query.page)
  const limit = parseInt(query.limit)
  const skip = (page - 1) * limit

  const where: any = {}
  if (query.search) where.name = { contains: query.search, mode: 'insensitive' }
  if (query.status) where.status = query.status
  if (query.vendorId) where.vendorId = query.vendorId
  if (query.categoryId) where.categoryId = query.categoryId

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: productSelect,
    }),
    prisma.product.count({ where }),
  ])

  return {
    products,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}

export const adminToggleProductStatus = async (
  productId: string,
  status: 'active' | 'inactive'
) => {
  return prisma.product.update({
    where: { id: productId },
    data: { status },
    select: { id: true, name: true, status: true },
  })
}
