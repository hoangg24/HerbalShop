// src/modules/cart/cart.route.ts
import { Router } from "express";
import * as cartController from "./cart.controller";
import { authenticate } from "../../middlewares/authenticate";
import { validate } from "../../middlewares/validate";
import {
  addCartItemSchema,
  updateCartItemSchema,
  syncCartSchema,
} from "./cart.schema";

const router = Router();

router.use(authenticate); // chỉ user đã login mới có cart lưu DB

router.get("/", cartController.getCart);
router.post("/items", validate(addCartItemSchema), cartController.addCartItem);
router.patch(
  "/items/:productId",
  validate(updateCartItemSchema),
  cartController.updateCartItem,
);
router.delete("/items/:productId", cartController.removeCartItem);
router.delete("/", cartController.clearCart);
router.post("/sync", validate(syncCartSchema), cartController.syncCart);

export default router;
