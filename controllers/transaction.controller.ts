import { Response, Request } from "express";
import { response } from "../utils";
import Joi from "joi";

class TransactionController {
  static async initiate(req: Request, res: Response) {
    const requestSchema = Joi.object({});

    return response(res, 200, "Transaction initiated successfully");
  }
}

export default TransactionController;
