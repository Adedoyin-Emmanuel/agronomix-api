import express from "express";
import { TransactionController } from "../controllers";
import { useAuth, useCheckRole } from "./../middlewares";

const transactionRouter = express.Router();

transactionRouter.post(
  "/intiate",
  [useAuth, useCheckRole("buyer")],
  TransactionController.initiate
);
transactionRouter.post(
  "/verify",
  [useAuth, useCheckRole("buyer")],
  TransactionController.verify
);
transactionRouter.post(
  "/refund",
  [useAuth, useCheckRole("buyer")],
  TransactionController.refund
);

/**
 * TODO Add transaction history for merchant and buyer
 * That shouldn't be tough!
 */


export default transactionRouter;