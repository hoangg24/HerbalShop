// src/modules/cart/cart.service.ts
import { prisma } from "../../config/prisma";
import { AddCartItemInput, SyncCartInput } from "../cart/cart.schema";

// ── Select dùng chung ─────────────────────────────────────────
const cartItemSelect = {
  id: true,
  productId: true,
  quantity: true,
  product: {
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      salePrice: true,
      stock: true,
      unit: true,
      status: true,
      vendor: {
        select: { id: true, shopName: true, slug: true, status: true },
      },
      images: {
        where: { isPrimary: true },
        take: 1,
        select: { url: true, altText: true },
      },
    },
  },
};

// ── Helpers ───────────────────────────────────────────────────
const getOrCreateCart = async (userId: string) => {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (cart) return cart;
  return prisma.cart.create({ data: { userId } });
};

const assertProductAvailable = async (productId: string, quantity: number) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { vendor: { select: { status: true } } },
  });
  if (!product) throw { status: 404, message: "Không tìm thấy sản phẩm" };
  if (product.status !== "active")
    throw { status: 400, message: "Sản phẩm hiện không khả dụng" };
  if (product.vendor.status !== "active")
    throw {
      status: 400,
      message: "Shop của sản phẩm này hiện không hoạt động",
    };
  if (product.stock < quantity)
    throw {
      status: 400,
      message: `Chỉ còn ${product.stock} sản phẩm trong kho`,
    };
  return product;
};

const buildCartResponse = async (cartId: string) => {
  const items = await prisma.cartItem.findMany({
    where: { cartId },
    orderBy: { createdAt: "desc" },
    select: cartItemSelect,
  });

  let subtotal = 0;
  let totalItems = 0;

  const data = items.map((item) => {
    const unitPrice = item.product.salePrice
      ? item.product.salePrice.toNumber()
      : item.product.price.toNumber();
    const itemTotal = unitPrice * item.quantity;
    subtotal += itemTotal;
    totalItems += item.quantity;

    return {
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice,
      itemTotal,
      isAvailable:
        item.product.status === "active" &&
        item.product.vendor.status === "active" &&
        item.product.stock >= item.quantity,
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        stock: item.product.stock,
        unit: item.product.unit,
        status: item.product.status,
        image: item.product.images[0]?.url ?? null,
        vendor: item.product.vendor,
      },
    };
  });

  return { items: data, totalItems, subtotal };
};

// ── Lấy giỏ hàng ──────────────────────────────────────────────
export const getCart = async (userId: string) => {
  const cart = await getOrCreateCart(userId);
  return buildCartResponse(cart.id);
};

// ── Thêm sản phẩm vào giỏ ────────────────────────────────────
export const addCartItem = async (userId: string, input: AddCartItemInput) => {
  const cart = await getOrCreateCart(userId);

  const existing = await prisma.cartItem.findUnique({
    where: {
      cartId_productId: { cartId: cart.id, productId: input.productId },
    },
  });

  const newQuantity = (existing?.quantity ?? 0) + input.quantity;
  await assertProductAvailable(input.productId, newQuantity);

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: newQuantity },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: input.productId,
        quantity: newQuantity,
      },
    });
  }

  return buildCartResponse(cart.id);
};

// ── Cập nhật số lượng ────────────────────────────────────────
export const updateCartItem = async (
  userId: string,
  productId: string,
  quantity: number,
) => {
  const cart = await getOrCreateCart(userId);

  const existing = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });
  if (!existing)
    throw { status: 404, message: "Sản phẩm không có trong giỏ hàng" };

  await assertProductAvailable(productId, quantity);

  await prisma.cartItem.update({
    where: { id: existing.id },
    data: { quantity },
  });

  return buildCartResponse(cart.id);
};

// ── Xóa 1 sản phẩm khỏi giỏ ──────────────────────────────────
export const removeCartItem = async (userId: string, productId: string) => {
  const cart = await getOrCreateCart(userId);

  const existing = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });
  if (!existing)
    throw { status: 404, message: "Sản phẩm không có trong giỏ hàng" };

  await prisma.cartItem.delete({ where: { id: existing.id } });

  return buildCartResponse(cart.id);
};

// ── Xóa toàn bộ giỏ hàng ─────────────────────────────────────
export const clearCart = async (userId: string) => {
  const cart = await getOrCreateCart(userId);
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
};

// ── Đồng bộ giỏ hàng guest sau khi đăng nhập ─────────────────
export const syncCart = async (userId: string, input: SyncCartInput) => {
  const cart = await getOrCreateCart(userId);

  for (const guestItem of input.items) {
    const product = await prisma.product.findUnique({
      where: { id: guestItem.productId },
    });
    // Bỏ qua sản phẩm không còn tồn tại hoặc đã bị ẩn
    if (!product || product.status !== "active") continue;

    const existing = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: { cartId: cart.id, productId: guestItem.productId },
      },
    });

    const mergedQuantity = Math.min(
      (existing?.quantity ?? 0) + guestItem.quantity,
      product.stock,
    );
    if (mergedQuantity <= 0) continue;

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: mergedQuantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: guestItem.productId,
          quantity: mergedQuantity,
        },
      });
    }
  }

  return buildCartResponse(cart.id);
};
