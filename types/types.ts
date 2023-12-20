import { Request } from "express";

interface Buyer {
  _id: string;
  role: "buyer";
  username: string;
  name: string;
}

interface Merchant {
  _id: string;
  role: "merchant";
  username: string;
  clinicName: string;
}

export type GlobalUser = Buyer | Merchant | undefined;

export interface MerchantJWTPayload extends Request {
  merchant: Merchant | any;
}

export interface BuyerJWTPayload extends Request {
  buyer: Buyer | any;
}

export interface AuthRequest extends Request {
  merchant?: Merchant;
  buyer?: Buyer;
  userType?: "buyer" | "merchant";
}

declare global {
  namespace Express {
    interface Request {
      buyer?: Buyer;
      merchant?: Merchant;
      userType?: "buyer" | "merchant";
    }
  }
}
