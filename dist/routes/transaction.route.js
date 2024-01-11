"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = require("../controllers");
const middlewares_1 = require("./../middlewares");
const transactionRouter = express_1.default.Router();
transactionRouter.post("/intiate", [middlewares_1.useAuth, (0, middlewares_1.useCheckRole)("buyer")], controllers_1.TransactionController.initiate);
transactionRouter.post("/verify", [middlewares_1.useAuth, (0, middlewares_1.useCheckRole)("buyer")], controllers_1.TransactionController.verify);
transactionRouter.post("/refund", [middlewares_1.useAuth, (0, middlewares_1.useCheckRole)("buyer")], controllers_1.TransactionController.refund);
transactionRouter.post("/webhook", controllers_1.TransactionController.receiveWebhook);
/**
 * TODO Add transaction history for merchant and buyer
 * That shouldn't be tough!
 */
exports.default = transactionRouter;
