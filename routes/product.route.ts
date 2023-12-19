import express from "express";
import { ProductController } from "../controllers";


const productRouter = express.Router();

productRouter.post("/createproduct", ProductController.createProduct);
productRouter.get("/searchproduct", ProductController.searchProduct);

export default productRouter;