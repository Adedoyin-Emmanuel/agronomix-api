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
const models_1 = require("../models");
const joi_1 = __importDefault(require("joi"));
const utils_1 = require("./../utils");
class ProductController {
    static createProduct(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const requestSchema = joi_1.default.object({
                name: joi_1.default.string().required().max(20),
                description: joi_1.default.string().required().max(500),
                category: joi_1.default.string().required(),
                price: joi_1.default.number().required(),
                quantity: joi_1.default.number().required(),
                tags: joi_1.default.array().items(joi_1.default.string()).default([]),
                image: joi_1.default.string().required(),
                unpublish: joi_1.default.boolean().default(false),
            });
            /**
             * @params {image}
                We would be expecting the ImageURL from the client,
               the URL of the image uploaded on
               uploadfly
             */
            const { error, value } = requestSchema.validate(req.body);
            if (error)
                (0, utils_1.response)(res, 400, error.details[0].message);
            const merchantId = (_a = req.merchant) === null || _a === void 0 ? void 0 : _a._id;
            value.merchantId = merchantId;
            console.log(value.merchantId);
            const newProduct = yield models_1.Product.create(value);
            yield models_1.Merchant.findByIdAndUpdate(merchantId, { $push: { products: newProduct._id } }, { new: true });
            return (0, utils_1.response)(res, 200, "Product created successfully");
        });
    }
    static getProductById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestSchema = joi_1.default.object({
                id: joi_1.default.string().required(),
            });
            const { error, value } = requestSchema.validate(req.params);
            if (error)
                return (0, utils_1.response)(res, 400, error.details[0].message);
            const product = yield models_1.Product.findById(value.id);
            if (!product)
                return (0, utils_1.response)(res, 404, "Product with given id not found");
            return (0, utils_1.response)(res, 200, "Product fetched successfully", product);
        });
    }
    static getAllProducts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const allProducts = yield models_1.Product.find();
            return (0, utils_1.response)(res, 200, "Products fetched successfully", allProducts);
        });
    }
    static getAllMerchantProducts(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const merchantId = (_a = req.merchant) === null || _a === void 0 ? void 0 : _a._id;
            const allProducts = yield models_1.Product.find({ merchantId });
            if (!allProducts)
                return (0, utils_1.response)(res, 404, "Merchant with given id not found!");
            return (0, utils_1.response)(res, 200, "Products fetched successfully", allProducts);
        });
    }
    static getMerchantLatestProducts(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const merchantId = (_a = req.merchant) === null || _a === void 0 ? void 0 : _a._id;
            const topLatestProducts = yield models_1.Product.find({ merchantId })
                .sort({ dateCreated: -1 })
                .limit(5);
            if (!topLatestProducts || topLatestProducts.length === 0) {
                return (0, utils_1.response)(res, 404, "Merchant with given id not found or no products found!");
            }
            return (0, utils_1.response)(res, 200, "Merchant top products fetched successfully", topLatestProducts);
        });
    }
    static searchProduct(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestSchema = joi_1.default.object({
                searchTerm: joi_1.default.string().required(),
            });
            const { error, value } = requestSchema.validate(req.query);
            if (error)
                return (0, utils_1.response)(res, 400, error.details[0].message);
            const { searchTerm } = value;
            const product = yield models_1.Product.find({
                $or: [
                    { name: { $regex: searchTerm, $options: "i" } },
                    { tags: { $regex: searchTerm, $options: "i" } },
                ],
            });
            if (product.length == 0)
                return (0, utils_1.response)(res, 404, "No products found", []);
            if (!product)
                return (0, utils_1.response)(res, 400, "Could not get produt");
            return (0, utils_1.response)(res, 200, "Products fetched successfully", product);
        });
    }
    static updateProduct(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const requestSchema = joi_1.default.object({
                name: joi_1.default.string().max(20),
                description: joi_1.default.string().max(500),
                category: joi_1.default.string(),
                price: joi_1.default.number(),
                quantity: joi_1.default.number(),
                tags: joi_1.default.array().items(joi_1.default.string()),
                image: joi_1.default.string(),
            });
            const productIdSchema = joi_1.default.object({
                productId: joi_1.default.string().required(),
            });
            const { error: productIdError, value: productIdValue } = productIdSchema.validate(req.params);
            if (productIdError)
                return (0, utils_1.response)(res, 400, productIdError.details[0].message);
            const productId = productIdValue.productId;
            const { error, value } = requestSchema.validate(req.body);
            if (error)
                return (0, utils_1.response)(res, 400, error.details[0].message);
            const merchantId = (_a = req.merchant) === null || _a === void 0 ? void 0 : _a._id;
            // Check if the product belongs to the merchant
            const product = yield models_1.Product.findOne({ _id: productId, merchantId });
            if (!product) {
                return (0, utils_1.response)(res, 404, "Product not found");
            }
            // Update the product
            const updateProduct = yield models_1.Product.findByIdAndUpdate(productId, value, {
                new: true,
            });
            return (0, utils_1.response)(res, 200, "Product updated successfully", updateProduct);
        });
    }
    static deleteProduct(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const requestSchema = joi_1.default.object({
                id: joi_1.default.string().required(),
            });
            const { error, value } = requestSchema.validate(req.params);
            if (error)
                return (0, utils_1.response)(res, 200, error.details[0].message);
            //delete the product from the merchant document
            const deletedProduct = yield models_1.Product.findByIdAndDelete(value.id);
            const merchantId = (_a = req.merchant) === null || _a === void 0 ? void 0 : _a._id;
            if (!deletedProduct)
                return (0, utils_1.response)(res, 404, "Product with given id not found!");
            try {
                yield models_1.Merchant.findByIdAndUpdate(merchantId, {
                    $pull: { products: value.id },
                });
                return (0, utils_1.response)(res, 200, "Product deleted successfully");
            }
            catch (error) {
                return (0, utils_1.response)(res, 400, "An error occured while deleting the product!");
            }
        });
    }
}
exports.default = ProductController;
