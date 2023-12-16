import mongoose from "mongoose";

const PaymentInfoSchema = new mongoose.Schema({
    paymentMethod: {
        type: String,
        enum: ['Mobile money', 'cardPayment'],
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Merchant'
    },
    mobileMoneyNumber: {
        type: Number,
        required: true
    },
    accountNumber: {
        type: Number,
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
})

export default mongoose.model('PaymentInfo', PaymentInfoSchema);