import mongoose from "mongoose";

export interface IOrder {
  userId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  totalPrice: number;
  shippingAddress: string;
  paymentMethod: string;
  products: mongoose.Types.ObjectId[];
  status: "pending" | "processing" | "delivered";
}

const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Buyer",
      required: true,
    },

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Merchant",
      required: true,
    },

    totalPrice: {
      type: Number,
      required: true,
    },

    shippingAddress: {
      type: String,
      required: true,
    },

    paymentMethod: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PaymentMethod",
    },

    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    status: {
      type: String,
      enum: ["pending", "processing", "delivered"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const Order = mongoose.model<IOrder>("Order", OrderSchema);
