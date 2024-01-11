"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Merchant = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = __importDefault(require("config"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const MerchantSchema = new mongoose_1.default.Schema({
    companyName: {
        type: String,
        max: 50,
        required: true,
    },
    username: {
        type: String,
        max: 10,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        min: 6,
        max: 30,
        required: true,
        select: false,
    },
    profilePicture: {
        type: String,
        required: true,
    },
    bio: {
        type: String,
        required: false,
        default: "Agronomix Merchant",
        max: 500,
    },
    address: {
        type: String,
        required: false,
    },
    phoneNumber: {
        type: Number,
        required: false,
        unique: true,
    },
    token: {
        type: String,
        select: false,
        required: false,
    },
    isVerified: {
        type: Boolean,
        required: false,
        default: false,
    },
    location: {
        type: String,
        required: false,
        max: 50,
        default: "",
    },
    online: {
        type: Boolean,
        required: false,
        default: false,
    },
    role: {
        type: String,
        required: false,
        default: "merchant",
    },
    verifyEmailTokenExpire: {
        type: Date,
        required: false,
        select: false,
    },
    resetPasswordToken: {
        type: String,
        required: false,
        select: false,
    },
    resetPasswordTokenExpire: {
        type: Date,
        required: false,
        select: false,
    },
    orders: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Orders",
        },
    ],
    customers: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Buyer",
        },
    ],
    reviews: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
    orderHistory: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "OrderHistory",
        },
    ],
    products: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Products",
        },
    ],
}, { timestamps: true, versionKey: false });
MerchantSchema.methods.generateAccessToken = function () {
    const payload = {
        _id: this._id,
        username: this.username,
        clinicName: this.name,
        role: "merchant",
    };
    const JWT_SECRET = process.env.JWT_PRIVATE_KEY;
    const tokenExpiration = config_1.default.get("App.tokenExpiration");
    const options = {
        expiresIn: tokenExpiration,
    };
    const token = jsonwebtoken_1.default.sign(payload, JWT_SECRET, options);
    return token;
};
MerchantSchema.methods.generateRefreshToken = function () {
    const payload = {
        _id: this._id,
        username: this.username,
        clinicName: this.name,
        role: "merchant",
    };
    const JWT_SECRET = process.env.JWT_PRIVATE_KEY;
    const options = {
        expiresIn: config_1.default.get("App.refreshTokenExpiration"),
    };
    const token = jsonwebtoken_1.default.sign(payload, JWT_SECRET, options);
    return token;
};
exports.Merchant = mongoose_1.default.model("Merchant", MerchantSchema);
