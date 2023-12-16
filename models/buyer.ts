import mongoose from "mongoose";

const BuyerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      max: 50,
      required: true,
    },
    username: {
      type: String,
      max: 10,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      min: 6,
      max: 30,
      required: true,
      select: false,
    },

    profilePicture: {
      type: String,
      required: true,
    },

    bio: {
      type: String,
      required: false,
      default: "Agronomix user",
      max: 500,
    },

    address: {
      type: String,
      required: false,
    },

    phoneNumber: {
      type: String,
      required: false,
      unique: true,
    },

    token: {
      type: String,
      select: false,
      required: false,
    },

    isVerified: {
      type: Boolean,
      required: false,
      default: false,
    },

    location: {
      type: String,
      required: false,
      max: 50,
      default: "",
    },

    online: {
      type: Boolean,
      required: false,
      default: false,
    },

    verifyEmailTokenExpire: {
      type: Date,
      required: false,
      select: false,
    },

    resetPasswordToken: {
      type: String,
      required: false,
      select: false,
    },

    resetPasswordTokenExpire: {
      type: Date,
      required: false,
      select: false,
    },

    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Orders",
      },
    ],
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model("Buyer", BuyerSchema);
