"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const joi_1 = __importDefault(require("joi"));
const _ = __importStar(require("lodash"));
const models_1 = require("../models");
const utils_1 = require("./../utils");
class MerchantController {
    static createMerchant(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const validationSchema = joi_1.default.object({
                companyName: joi_1.default.string().required().max(50),
                username: joi_1.default.string().required().max(20),
                email: joi_1.default.string().required().email(),
                password: joi_1.default.string().required().min(6).max(30),
            });
            const { error, value } = validationSchema.validate(req.body);
            if (error)
                return (0, utils_1.response)(res, 400, error.details[0].message);
            //check if email has been taken by another buyer
            const { email: emailTaken, username: usernameTaken } = value;
            const existingEmailMerchant = yield models_1.Merchant.findOne({ email: emailTaken });
            if (existingEmailMerchant)
                return (0, utils_1.response)(res, 400, "Email already taken");
            const existingUsernameMerchant = yield models_1.Merchant.findOne({
                username: usernameTaken,
            });
            if (existingUsernameMerchant)
                return (0, utils_1.response)(res, 400, "Username already taken");
            const salt = yield bcryptjs_1.default.genSalt(10);
            const password = yield bcryptjs_1.default.hash(value.password, salt);
            const { companyName, username, email } = value;
            const profilePicture = `https://api.dicebear.com/7.x/micah/svg?seed=${username || companyName}`;
            const valuesToStore = {
                companyName,
                username,
                email,
                password,
                profilePicture,
            };
            const merchant = yield models_1.Merchant.create(valuesToStore);
            const filteredMerchant = _.pick(merchant, [
                "companyName",
                "username",
                "email",
                "createdAt",
                "updatedAt",
                "profilePicture",
            ]);
            return (0, utils_1.response)(res, 201, "Account created successfully", filteredMerchant);
        });
    }
    static getAllMerchants(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const allBuyers = yield models_1.Merchant.find();
            return (0, utils_1.response)(res, 200, "Merchants fetched successfully", allBuyers);
        });
    }
    static getMerchantById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestSchema = joi_1.default.object({
                id: joi_1.default.string().required(),
            });
            const { error, value } = requestSchema.validate(req.params);
            if (error)
                return (0, utils_1.response)(res, 400, error.details[0].message);
            const merchant = yield models_1.Merchant.findById(value.id);
            if (!merchant)
                return (0, utils_1.response)(res, 404, "Merchant with given id not found");
            return (0, utils_1.response)(res, 200, "Merchant fetched successfully", merchant);
        });
    }
    static getMe(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const merchant = yield models_1.Merchant.findById((_a = req.merchant) === null || _a === void 0 ? void 0 : _a._id);
            if (!merchant)
                return (0, utils_1.response)(res, 404, "Merchant with given id not found");
            return (0, utils_1.response)(res, 200, "Merchant info fetched successfully", merchant);
        });
    }
    static getOnlineMerchants(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const onlineMerchants = yield models_1.Merchant.find({ online: true });
            return (0, utils_1.response)(res, 200, "Online merchants fetched successfully", onlineMerchants);
        });
    }
    static searchMerchants(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestSchema = joi_1.default.object({
                searchTerm: joi_1.default.string().required(),
            });
            const { error, value } = requestSchema.validate(req.query);
            if (error)
                return (0, utils_1.response)(res, 400, error.details[0].message);
            const { searchTerm } = value;
            const merchant = yield models_1.Merchant.find({
                $or: [
                    { companyName: { $regex: searchTerm, $options: "i" } },
                    { username: { $regex: searchTerm, $options: "i" } },
                ],
            });
            if (merchant.length == 0)
                return (0, utils_1.response)(res, 404, "No merchants found", []);
            if (!merchant)
                return (0, utils_1.response)(res, 400, "Couldn't get merchant");
            return (0, utils_1.response)(res, 200, "Merchants fetched successfully", merchant);
        });
    }
    static updateMerchant(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const requestSchema = joi_1.default.object({
                name: joi_1.default.string().max(50),
                username: joi_1.default.string().max(20),
                bio: joi_1.default.string().max(500),
                email: joi_1.default.string().email(),
                location: joi_1.default.string().max(50),
                profilePicture: joi_1.default.string()
            });
            const { error: requestBodyError, value: requestBodyValue } = requestSchema.validate(req.body);
            if (requestBodyError)
                return (0, utils_1.response)(res, 400, requestBodyError.details[0].message);
            //check if user with id exist
            const id = (_a = req.merchant) === null || _a === void 0 ? void 0 : _a._id;
            const existingMerchant = yield models_1.Merchant.findById(id);
            if (!existingMerchant)
                return (0, utils_1.response)(res, 404, "Merchant with given id not found");
            //check if email has been taken by another user
            const { username, email } = requestBodyValue;
            if (email && email !== existingMerchant.email) {
                const existingEmailMerchant = yield models_1.Merchant.findOne({ email });
                if (existingEmailMerchant)
                    return (0, utils_1.response)(res, 400, "Email already taken");
            }
            // Check if username has been taken by another user
            if (username && username !== existingMerchant.username) {
                const existingUsernameMerchant = yield models_1.Merchant.findOne({ username });
                if (existingUsernameMerchant) {
                    return (0, utils_1.response)(res, 400, "Username has already been taken by another merchant");
                }
            }
            //update the merchant
            const options = { new: true, runValidators: true };
            const updatedMerchant = yield models_1.Merchant.findByIdAndUpdate(id, requestBodyValue, options);
            return (0, utils_1.response)(res, 200, "Account details updated successfully", updatedMerchant);
        });
    }
    static deleteMerchant(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestSchema = joi_1.default.object({
                id: joi_1.default.string().required(),
            });
            const { error, value } = requestSchema.validate(req.params);
            if (error)
                return (0, utils_1.response)(res, 200, error.details[0].message);
            const deletedMerchant = yield models_1.Merchant.findByIdAndDelete(value.id);
            if (!deletedMerchant)
                return (0, utils_1.response)(res, 404, "Merchant with given id not found!");
            return (0, utils_1.response)(res, 200, "Merchant deleted successfully");
        });
    }
}
exports.default = MerchantController;
