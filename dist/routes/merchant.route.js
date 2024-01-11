"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = require("../controllers");
const middlewares_1 = require("../middlewares");
const merchantRouter = express_1.default.Router();
merchantRouter.post("/", [middlewares_1.useCreateUserLimiter], controllers_1.MerchantController.createMerchant);
merchantRouter.get("/search", controllers_1.MerchantController.searchMerchants);
merchantRouter.get("/online", controllers_1.MerchantController.getOnlineMerchants);
merchantRouter.put("/", [middlewares_1.useAuth, (0, middlewares_1.useCheckRole)("merchant")], controllers_1.MerchantController.updateMerchant);
merchantRouter.get("/me", [middlewares_1.useAuth], controllers_1.MerchantController.getMe);
merchantRouter.get("/", [middlewares_1.useAuth], controllers_1.MerchantController.getAllMerchants);
merchantRouter.get("/:id", [middlewares_1.useAuth], controllers_1.MerchantController.getMerchantById);
merchantRouter.delete("/:id", [middlewares_1.useAuth, (0, middlewares_1.useCheckRole)("merchant")], controllers_1.MerchantController.deleteMerchant);
exports.default = merchantRouter;
