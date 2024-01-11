"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const PaymentSchema = new mongoose_1.default.Schema({
    orderId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Order",
        required: true,
    },
    buyerId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Buyer",
        required: true,
    },
    merchantId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Merchant",
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    paymentMethod: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        default: "pending",
        enum: {
            values: ["pending", "fulfilled"],
            message: "{VALUE} is not supported",
        },
    },
}, { timestamps: true, versionKey: false });
exports.Payment = mongoose_1.default.model("Payment", PaymentSchema);
