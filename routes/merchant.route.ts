import express from "express";
import { MerchantController } from "../controllers";
import { useAuth, useCheckRole, useCreateUserLimiter } from "../middlewares";

const merchantRouter = express.Router();

merchantRouter.post(
  "/",
  [useCreateUserLimiter],
  MerchantController.createMerchant
);
merchantRouter.get("/search", MerchantController.searchMerchants);
merchantRouter.get("/online", MerchantController.getOnlineMerchants);
merchantRouter.put(
  "/:id",
  [useAuth, useCheckRole("merchant")],
  MerchantController.updateMerchant
);
merchantRouter.get("/me", [useAuth], MerchantController.getMe);
merchantRouter.get("/", [useAuth], MerchantController.getAllMerchants);
merchantRouter.get("/:id", [useAuth], MerchantController.getMerchantById);

merchantRouter.delete(
  "/:id",
  [useAuth, useCheckRole("merchant")],
  MerchantController.deleteMerchant
);

export default merchantRouter;
