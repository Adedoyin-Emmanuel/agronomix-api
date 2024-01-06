import express from "express";
import { BuyerController } from "../controllers";
import { useAuth, useCheckRole, useCreateUserLimiter } from "../middlewares";

const buyerRouter = express.Router();

buyerRouter.post("/", [useCreateUserLimiter], BuyerController.createBuyer);
buyerRouter.get("/search", BuyerController.searchBuyer);
buyerRouter.get("/online", BuyerController.getOnlineBuyers);
buyerRouter.put(
  "/",
  [useAuth, useCheckRole("buyer")],
  BuyerController.updateBuyer
);
buyerRouter.get("/me", [useAuth], BuyerController.getMe);
buyerRouter.get("/", [useAuth], BuyerController.getAllBuyers);
buyerRouter.get("/:id", [useAuth], BuyerController.getBuyerById);
buyerRouter.delete(
  "/:id",
  [useAuth, useCheckRole("buyer")],
  BuyerController.deleteBuyer
);

export default buyerRouter;
