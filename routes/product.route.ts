import express from "express";
import { ProductController } from "../controllers";
import { useAuth, useCheckRole } from "./../middlewares";

const productRouter = express.Router();

productRouter.post(
  "/",
  [useAuth, useCheckRole("merchant")],
  ProductController.createProduct
);
productRouter.get("/me", ProductController.getAllMerchantProducts);
productRouter.get("/latest", ProductController.getAllMerchantProducts);
productRouter.get("/search", ProductController.searchProduct);
productRouter.get("/:id", ProductController.getProductById);
productRouter.get("/", ProductController.getAllProducts);

productRouter.put(
  "/",
  [useAuth, useCheckRole("merchant")],
  ProductController.updateProduct
);

/**
 * Todo
 * Add Filter product endpoint, basically sort products
 */

productRouter.delete(
  "/",
  [useAuth, useCheckRole("merchant")],
  ProductController.deleteProduct
);

export default productRouter;
