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
merchantRouter.patch("/verify-otp/:email/:otp", MerchantController.verifyOTP);
merchantRouter.patch("/resend-otp/:email", MerchantController.resendOTP);
// merchantRouter.patch("/change-password/", MerchantController.changePassword);
merchantRouter.get(
  "/start-forget-passsword",
  MerchantController.startForgetPassword
);
merchantRouter.patch(
  "/complete-forget-passsword",
  MerchantController.completeForgetPassword
);
merchantRouter.delete(
  "/:id",
  [useAuth, useCheckRole("merchant")],
  MerchantController.deleteMerchant
);

export default merchantRouter;
