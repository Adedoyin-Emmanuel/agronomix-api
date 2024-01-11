"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = require("../controllers");
const middlewares_1 = require("./../middlewares");
const productRouter = express_1.default.Router();
productRouter.post("/", [middlewares_1.useAuth, (0, middlewares_1.useCheckRole)("merchant")], controllers_1.ProductController.createProduct);
productRouter.get("/me", [middlewares_1.useAuth, (0, middlewares_1.useCheckRole)("merchant")], controllers_1.ProductController.getAllMerchantProducts);
productRouter.get("/latest", [middlewares_1.useAuth, (0, middlewares_1.useCheckRole)("merchant")], controllers_1.ProductController.getAllMerchantProducts);
productRouter.get("/search", controllers_1.ProductController.searchProduct);
productRouter.get("/:id", controllers_1.ProductController.getProductById);
productRouter.get("/", controllers_1.ProductController.getAllProducts);
productRouter.put("/", [middlewares_1.useAuth, (0, middlewares_1.useCheckRole)("merchant")], controllers_1.ProductController.updateProduct);
/**
 * Todo
 * Add Filter product endpoint, basically sort products
 */
productRouter.delete("/", [middlewares_1.useAuth, (0, middlewares_1.useCheckRole)("merchant")], controllers_1.ProductController.deleteProduct);
exports.default = productRouter;
