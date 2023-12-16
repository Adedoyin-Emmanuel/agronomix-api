import mongoose from "mongoose";
import collections from "../repository/collection";

const productSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "firstName is required"],
    },
    lastName: {
      type: String,
      required: [true, "firstName is required"],
    },
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Merchant",
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: [true, "Please provide a category"],
      enum: {
        values: ["clothing", "electronics", "cosmetics"],
        message: "{VALUE} is not supported",
      },
    },
    sub_category: {
      type: String,
      required: [true, "Please provide a sub-category"],
      enum: {
        values: ["laptops", "monitors", "kitchenware"],
        message: "{VALUE} is not supported",
      },
    },
    price: {
      type: Number,
      required: true,
    },
    quantity_available: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    specifications: {
      size: {
        type: String,
      },
      color: {
        type: String,
      },
      material: {
        type: String,
      },
    },
    brand: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(collections.product, productSchema);
