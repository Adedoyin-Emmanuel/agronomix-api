import mongoose from "mongoose";

const merchantSchema = new mongoose.Schema({
    username: {
        type: String,
        required:true
    },
    firstName: {
        type: String,
        required:true
    },
    lastName: {
        type: String,
        required:true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    paymentInformation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PaymentInfo'
    },
    inventory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    phoneNumber: {
        type: String,
        required: true
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


export default mongoose.model('Merchant', merchantSchema);