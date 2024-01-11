"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentInfo = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const PaymentInfoSchema = new mongoose_1.default.Schema({
    paymentMethod: {
        type: String,
        enum: ["Mobile money", "cardPayment"],
        required: true,
    },
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Buyer",
    },
    mobileMoneyNumber: {
        type: Number,
        required: true,
    },
    accountNumber: {
        type: Number,
        required: true,
    },
}, { timestamps: true, versionKey: false });
exports.PaymentInfo = mongoose_1.default.model("PaymentInfo", PaymentInfoSchema);
