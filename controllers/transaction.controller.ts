import { Response, Request } from "express";
import { response } from "../utils";
import * as crypto from "crypto";
import Joi from "joi";

class TransactionController {
  static async initiate(req: Request, res: Response) {
    const requestSchema = Joi.object({});

    return response(res, 200, "Transaction initiated successfully");
  }

  static async verify(req: Request, res: Response) {
    const requestSchema = Joi.object({});

    return response(res, 200, "Transaction verified successfully");
  }

  static async refund(req: Request, res: Response) {
    const requestSchema = Joi.object({});

    return response(res, 200, "Funds reimbursed successfully");
  }

  static async receiveWebhook(req: Request, res: Response) {
    /**
     * TODO Implement Transaction Reference Checker
     */

    const SQUAD_SECRET: any = process.env.SQUAD_PRIVATE_KEY;
    const hash = crypto
      .createHmac("sha512", SQUAD_SECRET)
      .update(JSON.stringify(req.body))
      .digest("hex")
      .toUpperCase();
    if (hash == req.headers["x-squad-encrypted-body"]) {
      console.log("Webhook received successfully");
      console.log(req.body);
      const squadHash = req.headers["x-squad-encrypted-body"];
      return response(res, 200, "Webhook received successfully");
    } else {
      return response(res, 400, "Invalid webhook response");
    }
  }
}

export default TransactionController;
