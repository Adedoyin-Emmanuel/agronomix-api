import mongoose from "mongoose";

export interface IPaymentInfo {
  paymentMethod: string;
  userId: mongoose.Types.ObjectId;
  mobileMoneyNumber: number;
  accountNumber: number;
}

const PaymentInfoSchema = new mongoose.Schema(
  {
    paymentMethod: {
      type: String,
      enum: ["Mobile money", "cardPayment"],
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Buyer",
    },
    mobileMoneyNumber: {
      type: Number,
      required: true,
    },
    accountNumber: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

export const PaymentInfo = mongoose.model<IPaymentInfo>(
  "PaymentInfo",
  PaymentInfoSchema
);
