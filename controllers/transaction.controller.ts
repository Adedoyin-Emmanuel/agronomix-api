import { Response, Request } from "express";
import { response } from "../utils";
import * as crypto from "crypto";
import Joi from "joi";
import { Axios } from "../utils";
import CreateSquadClient from "@squadco/js";

const squad = new CreateSquadClient(
  process.env.SQUAD_PUBLIC_KEY as string,
  process.env.SQUAD_PRIVATE_KEY as string,
  "development"
);



class TransactionController {
  static async initiate(req: Request, res: Response) {
    const requestSchema = Joi.object({
      email: Joi.string().email().required(),
      amount: Joi.number().required().min(0),
      initiateType: Joi.string().default("inline"),
      currency: Joi.string().required().valid("NGN", "USD"),
      customerName: Joi.string().required(),
      callbackUrl: Joi.string().required(),
    });

    const { error, value } = requestSchema.validate(req.body);
    if (error) return response(res, 400, error.details[0].message);
    const { email, amount, initiateType, currency, customerName, callbackUrl } =
      value;
    const dataToSend = {
      email,
      amount,
      initiateType: initiateType,
      currency,
      customerName: customerName,
      callbackUrl: callbackUrl,
    };

    const squadResponse = await squad.initiatePayment(dataToSend);

    console.log(squadResponse.data);
    if (squadResponse.status !== 200)
      return response(res, 400, `An error occured! ${squadResponse.message}`);

    return response(
      res,
      200,
      "Transaction initiated successfully",
      squadResponse.data
    );
  }

  static async verify(req: Request, res: Response) {
    const requestSchema = Joi.object({
      transactionRef: Joi.string().required(),
    });

    const { error, value } = requestSchema.validate(req.params);
    if (error) return response(res, 400, error.details[0].message);

    const squadResponse = await Axios.get(`/verify/${value.transactionRef}`);
    if (squadResponse.status !== 200)
      return response(
        res,
        400,
        `An error occured! ${squadResponse.data?.message}`
      );

    return response(
      res,
      200,
      "Transaction verified successfully",
      squadResponse.data?.data
    );
  }

  static async refund(req: Request, res: Response) {
    const requestSchema = Joi.object({
      refundType: Joi.string().required().valid("full", "partial"),
      transactionRef: Joi.string().required(),
      refundAmount: Joi.number().required(),
      reasonForRefund: Joi.string().required(),
      gatewayTransactionRef: Joi.string().required(),
    });

    const { error, value } = requestSchema.validate(req.body);
    if (error) return response(res, 400, error.details[0].message);

    const {
      refundType,
      transactionRef,
      refundAmount,
      reasonForRefund,
      gatewayTransactionRef,
    } = value;

    const dataToSend = {
      gateway_transaction_ref: gatewayTransactionRef,
      transaction_ref: transactionRef,
      refund_type: refundType,
      reason_for_refund: reasonForRefund,
      refund_amount: refundAmount,
    };

    const squadResponse = await Axios.post("/transaction/refund", dataToSend);

    if (squadResponse.status !== 200)
      return response(
        res,
        400,
        `An error occured! ${squadResponse.data?.message}`
      );

    return response(
      res,
      200,
      "Funds reimbursed successfully",
      squadResponse.data?.data
    );
  }

  static async receiveWebhook(req: Request, res: Response) {
    /**
     * TODO Implement Transaction Reference Checker, Implement Transaction History
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
