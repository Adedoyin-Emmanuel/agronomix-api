import mongoose from "mongoose";
import collections from "../repository/collection";

const merchantSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    paymentInformation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PaymentInfo",
    },
    inventory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    phoneNumber: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model(collections.merchant, merchantSchema);
