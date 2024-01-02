import { Response, Request } from "express";
import { response } from "../utils";
import * as crypto from "crypto";
import Joi from "joi";
import { Axios } from "../utils";

class TransactionController {
  static async initiate(req: Request, res: Response) {
    const requestSchema = Joi.object({
      email: Joi.string().email().required(),
      amount: Joi.number().required().min(0),
      initiate_type: Joi.string().default("inline"),
      currency: Joi.string().required().valid("NGN", "USD"),
      customer_name: Joi.string().required(),
      callback_url: Joi.string().required(),
    });

    const { error, value } = requestSchema.validate(req.body);
    if (error) return response(res, 400, error.details[0].message);

    const squadResponse = await Axios.post("/transaction/initiate", value);

    if (squadResponse.status !== 200)
      return response(
        res,
        400,
        `An error occured! ${squadResponse.data?.message}`
      );

    return response(
      res,
      200,
      "Transaction initiated successfully",
      squadResponse.data?.data
    );
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
