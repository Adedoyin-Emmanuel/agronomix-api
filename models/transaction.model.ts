import mongoose from "mongoose";

export interface ITransaction {
  orderId: mongoose.Types.ObjectId;
  buyerId: mongoose.Types.ObjectId;
  mercantId: mongoose.Types.ObjectId;
  amount: number;
  paymentMethod: string;
  status: "pending" | "fulfilled";
  products: mongoose.Types.ObjectId[];
}

const TransactionSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Buyer",
      required: true,
    },

    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Merchant",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    paymentMethod: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      default: "pending",
      enum: {
        values: ["pending", "fulfilled"],
      },
    },

    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
    ],
  },
  { timestamps: true, versionKey: false }
);

export const Payment = mongoose.model<ITransaction>(
  "Payment",
  TransactionSchema
);
