import express from "express";
import { AuthController } from "../controllers";
import { useAuth } from "../middlewares";
import {
  useLoginRateLimiter,
  useVerifyLimiter,
  useChangePasswordLimiter,
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
authRouter.post("/refresh-token", AuthController.generateAccessToken);

authRouter.get(
  "/verify-email",
  [useAuth, useVerifyLimiter, useVerifySlowDown],
  AuthController.sendEmailToken
);
authRouter.get(
  "/confirm-email",
  [useVerifyLimiter, useVerifySlowDown],
  AuthController.verifyEmailToken
);

authRouter.post(
  "/forgot-password",
  [useVerifyLimiter, useVerifySlowDown],
  AuthController.forgotPassword
);

authRouter.post(
  "/reset-password",
  [useVerifyLimiter, useVerifySlowDown],
  AuthController.resetPassword
);

authRouter.post(
  "/change-password",
  [useAuth, useChangePasswordLimiter],
  AuthController.changePassword
);

export default authRouter;
