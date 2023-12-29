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
authRouter.post("/refresh-token", AuthController.generateAccessToken);

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
