"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = require("../controllers");
const middlewares_1 = require("./../middlewares");
const collectionRouter = express_1.default.Router();
/**
 * @note Only a buyer should be allowed to create a collection.
 * And should be authenticated
 */
collectionRouter.post("/", [middlewares_1.useAuth, (0, middlewares_1.useCheckRole)("buyer")], controllers_1.CollectionController.addProduct);
collectionRouter.delete("/", [middlewares_1.useAuth, (0, middlewares_1.useCheckRole)("buyer")], controllers_1.CollectionController.deleteProduct);
exports.default = collectionRouter;
