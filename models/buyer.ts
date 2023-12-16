import mongoose from "mongoose";

export interface IBuyer extends mongoose.Document {
  name: string;
  username: string;
  email: string;
  password: string;
  profilePicture: string;
  token?: string;
  isVerified: boolean;
  verifyEmailToken?: string;
  verifyEmailTokenExpire?: Date;
  resetPasswordToken?: string;
  resetPasswordTokenExpire?: Date;
  orders: mongoose.Types.ObjectId[];
  orderHistory: mongoose.Types.ObjectId[];
  location?: string;
  online?: boolean;

  generateAccessToken(): string;
  generateRefreshToken(): string;
}

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

    orderHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "OrderHistory",
      },
    ],
  },
  { timestamps: true, versionKey: false }
);

export const Buyer = mongoose.model<IBuyer>("Buyer", BuyerSchema);
