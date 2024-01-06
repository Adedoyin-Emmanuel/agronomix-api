import mongoose from "mongoose";
import config from "config";
import jwt, { SignOptions } from "jsonwebtoken";

export interface IMerchant extends mongoose.Document {
  companyName: string;
  username: string;
  email: string;
  password: string;
  profilePicture: string;
  phoneNumber?: string;
  token?: string;
  isVerified: boolean;
  verifyEmailToken?: string;
  verifyEmailTokenExpire?: Date;
  resetPasswordToken?: string;
  products: mongoose.Types.ObjectId[];
  resetPasswordTokenExpire?: Date;
  orders: mongoose.Types.ObjectId[];
  orderHistory: mongoose.Types.ObjectId[];
  customers: mongoose.Types.ObjectId[];
  location?: string;
  online?: boolean;
  role: "merchant";

  generateAccessToken(): string;
  generateRefreshToken(): string;
}

const MerchantSchema = new mongoose.Schema(
  {
    companyName: {
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
      default: "Agronomix Merchant",
      max: 500,
    },

    address: {
      type: String,
      required: false,
    },

    phoneNumber: {
      type: Number,
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

    role: {
      type: String,
      required: false,
      default: "merchant",
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

    customers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Buyer",
      },
    ],
    orderHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "OrderHistory",
      },
    ],
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Products",
      },
    ],
  },
  { timestamps: true, versionKey: false }
);

MerchantSchema.methods.generateAccessToken = function () {
  const payload = {
    _id: this._id,
    username: this.username,
    clinicName: this.name,
    role: "merchant",
  };
  const JWT_SECRET: any = process.env.JWT_PRIVATE_KEY;
  const tokenExpiration: string = config.get("App.tokenExpiration");

  const options: SignOptions = {
    expiresIn: tokenExpiration,
  };

  const token = jwt.sign(payload, JWT_SECRET, options);
  return token;
};

MerchantSchema.methods.generateRefreshToken = function () {
  const payload = {
    _id: this._id,
    username: this.username,
    clinicName: this.name,
    role: "merchant",
  };
  const JWT_SECRET: any = process.env.JWT_PRIVATE_KEY;

  const options: SignOptions = {
    expiresIn: config.get("App.refreshTokenExpiration"),
  };

  const token = jwt.sign(payload, JWT_SECRET, options);
  return token;
};

export const Merchant = mongoose.model<IMerchant>("Merchant", MerchantSchema);
