import { Request } from "express";

interface Buyer {
  _id: String;
  role: "buyer";
  username: String;
  name: String;
}

interface Merchant {
  _id: String;
  role: "merchant";
  username: String;
  clinicName: String;
}

export type GlobalUser = Buyer | Merchant | undefined;

export interface MerchantJWTPayload extends Request {
  merchant: Merchant | any;
}

export interface BuyerJWTPayload extends Request {
  buyer: Buyer | any;
}

export interface AuthRequest extends Request {
  hospital: Merchant | any;
  user: Buyer | any;
  userType: "buyer" | "merchant";
}
