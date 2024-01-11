"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ProductSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
        ma: 20,
    },
    merchantId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Merchant",
        required: true,
    },
    description: {
        type: String,
        required: true,
        max: 500,
    },
    category: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    tags: {
        type: [String],
        default: [],
    },
    reviews: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
    rating: {
        type: Number,
        required: false,
        default: 0,
    },
    unpublish: {
        type: Boolean,
        required: false,
        default: false,
    },
}, { timestamps: true, versionKey: false });
exports.Product = mongoose_1.default.model("Product", ProductSchema);
