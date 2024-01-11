"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = require("../controllers");
const middlewares_1 = require("../middlewares");
const buyerRouter = express_1.default.Router();
buyerRouter.post("/", [middlewares_1.useCreateUserLimiter], controllers_1.BuyerController.createBuyer);
buyerRouter.get("/search", controllers_1.BuyerController.searchBuyer);
buyerRouter.get("/online", controllers_1.BuyerController.getOnlineBuyers);
buyerRouter.put("/", [middlewares_1.useAuth, (0, middlewares_1.useCheckRole)("buyer")], controllers_1.BuyerController.updateBuyer);
buyerRouter.get("/me", [middlewares_1.useAuth], controllers_1.BuyerController.getMe);
buyerRouter.get("/", [middlewares_1.useAuth], controllers_1.BuyerController.getAllBuyers);
buyerRouter.get("/:id", [middlewares_1.useAuth], controllers_1.BuyerController.getBuyerById);
buyerRouter.delete("/:id", [middlewares_1.useAuth, (0, middlewares_1.useCheckRole)("buyer")], controllers_1.BuyerController.deleteBuyer);
exports.default = buyerRouter;
