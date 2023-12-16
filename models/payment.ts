import mongoose from "mongoose";
import collections from "../repository/collection";

const paymentSchema = new mongoose.Schema(
  {
    reference: {
      type: String,
      required: [true, "Reference is required"],
    },
    payment_status: {
      type: String,
      default: "pending",
      enum: {
        values: ["pending", "fulfilled"],
        message: "{VALUE} is not supported",
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(collections.payment, paymentSchema);
