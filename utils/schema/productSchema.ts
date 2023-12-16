import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    merchantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Merchant',
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['clothing', 'electronics', 'cosmetics'],
        required: true
    },
    sub_category: {
        type: String,
        enum: ['laptops', 'monitors', 'kitchenware'],
        required:true
    },
    price: {
        type: Number,
        required: true
    },
    quantity_available: {
        type: Number,
        required:true
    },
    image: {
        type:String,
        required: true
    },
    specifications:{
        size: {
            type: String
        },
        color: {
            type: String
        },
        material: {
            type: String
        }
    },
    brand: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    modifiedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Product', productSchema);