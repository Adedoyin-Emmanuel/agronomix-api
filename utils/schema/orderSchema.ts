import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PaymentMethod'
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
    }, createdAt: {
        type: Date,
        default:Date.now
    },
    modifiedAt: {
        type:Date,
        default:Date.now
    },
})

module.exports = mongoose.model('Order', orderSchema);