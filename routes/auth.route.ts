import express from "express";
import { AuthController } from "../controllers";
import { useAuth } from "../middlewares";
import {
  useLoginRateLimiter,
  useVerifyLimiter,
} from "../middlewares/rateLimiter";
import {
  useLoginSlowDown,
  useVerifySlowDown,
} from "../middlewares/rateSlowDown";

const authRouter = express.Router();

authRouter.post(
  "/login",
  [useLoginRateLimiter, useLoginSlowDown],
  AuthController.login
);

authRouter.post("/logout", [useAuth], AuthController.logout);
authRouter.post("/refresh-token", AuthController.generateRefreshToken);
authRouter.patch("/verify-otp/:email/:otp", AuthController.verifyOTP);
authRouter.patch("/resend-otp/:email", AuthController.resendOTP);
// merchantRouter.patch("/change-password/", AuthController.changePassword);
authRouter.get("/start-forget-passsword", AuthController.startForgetPassword);
authRouter.patch(
  "/complete-forget-passsword",
  AuthController.completeForgetPassword
);
//MISC
// We would add this later when we've implemented the various auth methods in the auth controller
// authRouter.get(
//   "/verify-email",
//   [useAuth, useVerifyLimiter, useVerifySlowDown],
//   AuthController.sendEmailToken
// );
// authRouter.get(
//   "/confirm-email",
//   [useVerifyLimiter, useVerifySlowDown],
//   AuthController.verifyEmailToken
// );

// authRouter.post(
//   "/forgot-password",
//   [useVerifyLimiter, useVerifySlowDown],
//   AuthController.forgotPassword
// );

// authRouter.post(
//   "/reset-password",
//   [useVerifyLimiter, useVerifySlowDown],
//   AuthController.resetPassword
// );

export default authRouter;
