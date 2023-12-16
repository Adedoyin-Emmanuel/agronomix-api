import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    reference: {
        type: String,
        required:true
    },
    payment_status: {
        type: String,
        required:true
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

module.exports = mongoose.model('Payment', paymentSchema);