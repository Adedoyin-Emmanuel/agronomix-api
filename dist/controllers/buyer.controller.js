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
class BuyerController {
    static createBuyer(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const validationSchema = joi_1.default.object({
                name: joi_1.default.string().required().max(50),
                username: joi_1.default.string().required().max(20),
                email: joi_1.default.string().required().email(),
                password: joi_1.default.string().required().min(6).max(30),
            });
            const { error, value } = validationSchema.validate(req.body);
            if (error)
                return (0, utils_1.response)(res, 400, error.details[0].message);
            //check if email has been taken by another buyer
            const { email: emailTaken, username: usernameTaken } = value;
            const existingEmailBuyer = yield models_1.Buyer.findOne({ email: emailTaken });
            if (existingEmailBuyer)
                return (0, utils_1.response)(res, 400, "Email already taken");
            const existingUsernameBuyer = yield models_1.Buyer.findOne({
                username: usernameTaken,
            });
            if (existingUsernameBuyer)
                return (0, utils_1.response)(res, 400, "Username already taken");
            const salt = yield bcryptjs_1.default.genSalt(10);
            const password = yield bcryptjs_1.default.hash(value.password, salt);
            const { name, username, email } = value;
            const profilePicture = `https://api.dicebear.com/7.x/micah/svg?seed=${username || name}`;
            const valuesToStore = {
                name,
                username,
                email,
                password,
                profilePicture,
            };
            const buyer = yield models_1.Buyer.create(valuesToStore);
            const filteredBuyer = _.pick(buyer, [
                "name",
                "username",
                "email",
                "createdAt",
                "updatedAt",
                "profilePicture",
            ]);
            return (0, utils_1.response)(res, 201, "Account created successfully", filteredBuyer);
        });
    }
    static getAllBuyers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const allBuyers = yield models_1.Buyer.find();
            return (0, utils_1.response)(res, 200, "Buyers fetched successfully", allBuyers);
        });
    }
    static getBuyerById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestSchema = joi_1.default.object({
                id: joi_1.default.string().required(),
            });
            const { error, value } = requestSchema.validate(req.params);
            if (error)
                return (0, utils_1.response)(res, 400, error.details[0].message);
            const buyer = yield models_1.Buyer.findById(value.id);
            if (!buyer)
                return (0, utils_1.response)(res, 404, "Buyer with given id not found");
            return (0, utils_1.response)(res, 200, "Buyer fetched successfully", buyer);
        });
    }
    static getMe(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const buyer = yield models_1.Buyer.findById(req.buyer._id);
            if (!buyer)
                return (0, utils_1.response)(res, 404, "Buyer with given id not found");
            return (0, utils_1.response)(res, 200, "Buyer info fetched successfully", buyer);
        });
    }
    static getOnlineBuyers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const onlineBuyers = yield models_1.Buyer.find({ online: true });
            return (0, utils_1.response)(res, 200, "Online buyers fetched successfully", onlineBuyers);
        });
    }
    static searchBuyer(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestSchema = joi_1.default.object({
                searchTerm: joi_1.default.string().required(),
            });
            const { error, value } = requestSchema.validate(req.query);
            if (error)
                return (0, utils_1.response)(res, 400, error.details[0].message);
            const { searchTerm } = value;
            const buyer = yield models_1.Buyer.find({
                $or: [
                    { name: { $regex: searchTerm, $options: "i" } },
                    { username: { $regex: searchTerm, $options: "i" } },
                ],
            });
            if (buyer.length == 0)
                return (0, utils_1.response)(res, 404, "No buyers found", []);
            if (!buyer)
                return (0, utils_1.response)(res, 400, "Couldn't get buyer");
            return (0, utils_1.response)(res, 200, "Buyer fetched successfully", buyer);
        });
    }
    static updateBuyer(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const requestSchema = joi_1.default.object({
                name: joi_1.default.string().max(50),
                username: joi_1.default.string().max(20),
                bio: joi_1.default.string().max(500),
                email: joi_1.default.string().email(),
                location: joi_1.default.string().max(50),
                profilePicture: joi_1.default.string(),
            });
            const { error: requestBodyError, value: requestBodyValue } = requestSchema.validate(req.body);
            if (requestBodyError)
                return (0, utils_1.response)(res, 400, requestBodyError.details[0].message);
            //check if user with id exist
            const id = (_a = req.buyer) === null || _a === void 0 ? void 0 : _a._id;
            const existingBuyer = yield models_1.Buyer.findById(id);
            if (!existingBuyer)
                return (0, utils_1.response)(res, 404, "Buyer with given id not found");
            //check if email has been taken by another user
            const { username, email } = requestBodyValue;
            if (email && email !== existingBuyer.email) {
                const existingEmailUser = yield models_1.Buyer.findOne({ email });
                if (existingEmailUser)
                    return (0, utils_1.response)(res, 400, "Email already taken");
            }
            // Check if username has been taken by another user
            if (username && username !== existingBuyer.username) {
                const existingUsernameUser = yield models_1.Buyer.findOne({ username });
                if (existingUsernameUser) {
                    return (0, utils_1.response)(res, 400, "Username has already been taken by another buyer");
                }
            }
            //update the user
            const options = { new: true, runValidators: true };
            const updatedBuyer = yield models_1.Buyer.findByIdAndUpdate(id, requestBodyValue, options);
            return (0, utils_1.response)(res, 200, "Account details updated successfully", updatedBuyer);
        });
    }
    static deleteBuyer(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestSchema = joi_1.default.object({
                id: joi_1.default.string().required(),
            });
            const { error, value } = requestSchema.validate(req.params);
            if (error)
                return (0, utils_1.response)(res, 200, error.details[0].message);
            const deletedBuyer = yield models_1.Buyer.findByIdAndDelete(value.id);
            if (!deletedBuyer)
                return (0, utils_1.response)(res, 404, "Buyer with given id not found!");
            return (0, utils_1.response)(res, 200, "Buyer deleted successfully");
        });
    }
}
exports.default = BuyerController;
