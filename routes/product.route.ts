import express from "express";
import { ProductController } from "../controllers";

const productRouter = express.Router();

productRouter.post("/", ProductController.createProduct);
productRouter.put("/", ProductController.createProduct);

/**
 * Todo
 * Add Delete Product Endpoint, Get Product By Id
 */

productRouter.get("/search", ProductController.searchProduct);

export default productRouter;
