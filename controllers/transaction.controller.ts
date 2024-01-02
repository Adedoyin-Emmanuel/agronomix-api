import { Response, Request } from "express";
import { response } from "../utils";
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
    console.log("Webhook received successfully");
    console.log(req.body);
    return response(res, 200, "Webhook received successfully");
  }
}

export default TransactionController;
