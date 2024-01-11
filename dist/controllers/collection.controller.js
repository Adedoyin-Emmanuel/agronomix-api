"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const joi_1 = __importDefault(require("joi"));
const models_1 = require("../models");
class CollectionController {
    static addProduct(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const requestSchema = joi_1.default.object({
                productId: joi_1.default.string().required(),
            });
            const { error, value } = requestSchema.validate(req.body);
            if (error)
                return (0, utils_1.response)(res, 400, error.details[0].message);
            const buyerId = (_a = req.buyer) === null || _a === void 0 ? void 0 : _a._id;
            const { productId } = value;
            // check if the product is a valid product
            const product = yield models_1.Product.findById(productId);
            if (!product)
                return (0, utils_1.response)(res, 400, "Product does not exist");
            const collection = yield models_1.Buyer.findByIdAndUpdate(buyerId, { $push: { collections: productId } }, { new: true });
            console.log(collection);
            return (0, utils_1.response)(res, 200, "Product added to collection successfully", collection);
        });
    }
    static deleteProduct(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const requestSchema = joi_1.default.object({
                productId: joi_1.default.string().required(),
            });
            const { error, value } = requestSchema.validate(req.body);
            if (error)
                return (0, utils_1.response)(res, 400, error.details[0].message);
            const buyerId = (_a = req.buyer) === null || _a === void 0 ? void 0 : _a._id;
            const { productId } = value;
            // check if the product is a valid product
            const product = yield models_1.Product.findById(productId);
            if (!product)
                return (0, utils_1.response)(res, 400, "Product does not exist");
            const collection = yield models_1.Buyer.findByIdAndUpdate(buyerId, { $pull: { collections: productId } }, { new: true });
            console.log(collection);
            return (0, utils_1.response)(res, 200, "Product removed from collection", collection);
        });
    }
}
exports.default = CollectionController;
