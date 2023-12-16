import mongoose from "mongoose";

export interface IProduct {
  name: string;
  merchantId: mongoose.Types.ObjectId;
  description: string;
  category: string;
  price: number;
  quantity: number;
  image: string;
}
const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      ma: 20,
    },

    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Merchant",
      required: true,
    },

    description: {
      type: String,
      required: true,
      max: 500,
    },
    category: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

export const Product = mongoose.model<IProduct>("Product", ProductSchema);
