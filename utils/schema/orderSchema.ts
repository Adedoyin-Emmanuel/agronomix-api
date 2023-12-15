import { required } from "joi";
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default:Date.now
    },
    modifiedAt: {
        type:Date,
        default:Date.now
    },
    total_price: {
        type:Number,
        required:true
    },
    shipping_address: {
        type: String,
        required: true
    },
    payment_method: {
        type: String,
        required:true
    },
    order_items: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:'Product'
        }
    ],
    order_status: {
        type: String,
        enum: ['pending', 'processing', 'delivered'],
        default: 'pending'
    },
    referece: {
        type: String
    }
})

module.exports = mongoose.model('Order', orderSchema);