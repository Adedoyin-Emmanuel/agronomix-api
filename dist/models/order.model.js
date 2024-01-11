"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const OrderSchema = new mongoose_1.default.Schema({
    buyerId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Buyer",
        required: true,
    },
    companyId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Merchant",
        required: true,
    },
    totalPrice: {
        type: Number,
        required: true,
    },
    shippingAddress: {
        type: String,
        required: true,
    },
    paymentMethod: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "PaymentMethod",
    },
    products: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Product",
        },
    ],
    status: {
        type: String,
        enum: ["pending", "processing", "delivered"],
        default: "pending",
    },
}, { timestamps: true });
exports.Order = mongoose_1.default.model("Order", OrderSchema);
