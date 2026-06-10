// src/modules/vendors/vendors.service.ts
import slugify from 'slugify'
import { prisma } from '../../config/prisma'
import {
  RegisterVendorInput,
  UpdateVendorInput,
  ReviewVendorInput,
  GetVendorsQuery,
} from './vendors.schema'

// ── Helpers ───────────────────────────────────────────────────
const generateSlug = async (shopName: string): Promise<string> => {
  let slug = slugify(shopName, { lower: true, strict: true, locale: 'vi' })
  
  // Kiểm tra slug đã tồn tại chưa, nếu có thì thêm số vào sau
  const existing = await prisma.vendor.findUnique({ where: { slug } })
  if (existing) {
    slug = `${slug}-${Date.now()}`
  }
  return slug
}

// ── Buyer: Đăng ký trở thành vendor ──────────────────────────
export const registerVendor = async (userId: string, input: RegisterVendorInput) => {
  // Kiểm tra user đã có shop chưa
  const existing = await prisma.vendor.findUnique({ where: { userId } })
  if (existing) {
    throw { status: 409, message: 'Bạn đã đăng ký shop rồi' }
  }

  const slug = await generateSlug(input.shopName)

  const vendor = await prisma.vendor.create({
    data: {
      userId,
      shopName: input.shopName,
      slug,
      description: input.description,
      bankAccount: input.bankAccount,
      bankName: input.bankName,
      status: 'pending',
    },
  })

  return vendor
}

// ── Vendor: Xem thông tin shop của mình ──────────────────────
export const getMyVendor = async (userId: string) => {
  const vendor = await prisma.vendor.findUnique({
    where: { userId },
    include: {
      _count: { select: { products: true } },
    },
  })
  if (!vendor) throw { status: 404, message: 'Bạn chưa đăng ký shop' }
  return vendor
}

// ── Vendor: Cập nhật thông tin shop ──────────────────────────
export const updateMyVendor = async (userId: string, input: UpdateVendorInput) => {
  const vendor = await prisma.vendor.findUnique({ where: { userId } })
  if (!vendor) throw { status: 404, message: 'Bạn chưa đăng ký shop' }
  if (vendor.status === 'suspended') {
    throw { status: 403, message: 'Shop của bạn đã bị tạm ngưng, không thể cập nhật' }
  }

  // Nếu đổi tên shop thì cập nhật slug
  let slug = vendor.slug
  if (input.shopName && input.shopName !== vendor.shopName) {
    slug = await generateSlug(input.shopName)
  }

  return prisma.vendor.update({
    where: { userId },
    data: { ...input, slug },
  })
}

// ── Public: Xem thông tin shop theo slug ─────────────────────
export const getVendorBySlug = async (slug: string) => {
  const vendor = await prisma.vendor.findUnique({
    where: { slug },
    include: {
      user: { select: { name: true, email: true } },
      _count: { select: { products: true } },
    },
  })
  if (!vendor || vendor.status !== 'active') {
    throw { status: 404, message: 'Không tìm thấy shop' }
  }
  return vendor
}

// ── Admin: Danh sách vendors ──────────────────────────────────
export const getVendors = async (query: GetVendorsQuery) => {
  const page = parseInt(query.page)
  const limit = parseInt(query.limit)
  const skip = (page - 1) * limit

  const where: any = {}
  if (query.search) {
    where.OR = [
      { shopName: { contains: query.search, mode: 'insensitive' } },
      { user: { email: { contains: query.search, mode: 'insensitive' } } },
      { user: { name: { contains: query.search, mode: 'insensitive' } } },
    ]
  }
  if (query.status) where.status = query.status

  const [vendors, total] = await Promise.all([
    prisma.vendor.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        _count: { select: { products: true } },
      },
    }),
    prisma.vendor.count({ where }),
  ])

  return {
    vendors,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

// ── Admin: Chi tiết vendor ────────────────────────────────────
export const getVendorById = async (vendorId: string) => {
  const vendor = await prisma.vendor.findUniqueOrThrow({
    where: { id: vendorId },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      _count: { select: { products: true, payouts: true } },
    },
  })
  return vendor
}

// ── Admin: Duyệt / Tạm ngưng vendor ──────────────────────────
export const reviewVendor = async (vendorId: string, input: ReviewVendorInput) => {
  const vendor = await prisma.vendor.findUniqueOrThrow({ where: { id: vendorId } })

  // Nếu duyệt active thì đổi role user thành vendor
  // Nếu suspended thì đổi lại thành buyer
  const newRole = input.status === 'active' ? 'vendor' : 'buyer'

  const [updatedVendor] = await prisma.$transaction([
    prisma.vendor.update({
      where: { id: vendorId },
      data: { status: input.status },
    }),
    prisma.user.update({
      where: { id: vendor.userId },
      data: { role: newRole },
    }),
  ])

  return updatedVendor
}

// ── Admin: Cập nhật commission rate ──────────────────────────
export const updateCommissionRate = async (vendorId: string, commissionRate: number) => {
  if (commissionRate < 0 || commissionRate > 100) {
    throw { status: 400, message: 'Commission rate phải từ 0 đến 100' }
  }

  return prisma.vendor.update({
    where: { id: vendorId },
    data: { commissionRate },
  })
}
