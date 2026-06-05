// prisma/seed.ts
import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Admin
  const adminPassword = await bcrypt.hash('Admin@123456', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@herbalshop.vn' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@herbalshop.vn',
      passwordHash: adminPassword,
      role: Role.admin,
    },
  })

  // Demo buyer
  const buyerPassword = await bcrypt.hash('Buyer@123456', 12)
  const buyer = await prisma.user.upsert({
    where: { email: 'buyer@herbalshop.vn' },
    update: {},
    create: {
      name: 'Nguyễn Văn A',
      email: 'buyer@herbalshop.vn',
      passwordHash: buyerPassword,
      role: Role.buyer,
    },
  })

  // Demo vendor user
  const vendorPassword = await bcrypt.hash('Vendor@123456', 12)
  const vendorUser = await prisma.user.upsert({
    where: { email: 'vendor@herbalshop.vn' },
    update: {},
    create: {
      name: 'Trần Thị B',
      email: 'vendor@herbalshop.vn',
      passwordHash: vendorPassword,
      role: Role.buyer,
    },
  })

  // Vendor
  const vendor = await prisma.vendor.upsert({
    where: { slug: 'thao-moc-truong-son' },
    update: {},
    create: {
      userId: vendorUser.id,
      shopName: 'Thảo Mộc Trường Sơn',
      slug: 'thao-moc-truong-son',
      description: 'Chuyên cung cấp thảo mộc tự nhiên từ núi rừng Trường Sơn',
      commissionRate: 10,
    },
  })

  // Categories
  const rootCat = await prisma.category.upsert({
    where: { slug: 'thao-moc' },
    update: {},
    create: { name: 'Thảo Mộc', slug: 'thao-moc', sortOrder: 1 },
  })

  const cat1 = await prisma.category.upsert({
    where: { slug: 'thao-moc-kho' },
    update: {},
    create: { name: 'Thảo mộc khô', slug: 'thao-moc-kho', parentId: rootCat.id, sortOrder: 1 },
  })

  const cat2 = await prisma.category.upsert({
    where: { slug: 'tinh-dau' },
    update: {},
    create: { name: 'Tinh dầu', slug: 'tinh-dau', parentId: rootCat.id, sortOrder: 2 },
  })

  // Products
  await prisma.product.upsert({
    where: { slug: 'gung-kho-nguyen-chat' },
    update: {},
    create: {
      vendorId: vendor.id,
      categoryId: cat1.id,
      name: 'Gừng khô nguyên chất',
      slug: 'gung-kho-nguyen-chat',
      description: 'Gừng khô được sấy tự nhiên, giữ nguyên tinh chất, hỗ trợ tiêu hóa và làm ấm cơ thể.',
      price: 45000,
      stock: 200,
      unit: 'gói 100g',
      status: 'active',
    },
  })

  await prisma.product.upsert({
    where: { slug: 'tinh-dau-tram-tra' },
    update: {},
    create: {
      vendorId: vendor.id,
      categoryId: cat2.id,
      name: 'Tinh dầu tràm trà nguyên chất',
      slug: 'tinh-dau-tram-tra',
      description: 'Tinh dầu tràm trà 100% thiên nhiên, kháng khuẩn, làm dịu da.',
      price: 120000,
      salePrice: 99000,
      stock: 80,
      unit: 'chai 10ml',
      status: 'active',
    },
  })

  console.log('✅ Seeding complete!')
  console.log('---')
  console.log('Admin:  admin@herbalshop.vn / Admin@123456')
  console.log('Buyer:  buyer@herbalshop.vn / Buyer@123456')
  console.log('Vendor: vendor@herbalshop.vn / Vendor@123456')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
