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
/**
 logs in a user
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Logs in a user
 *     description: This logs in a user and return  tokens
 *     tags:
 *       - AUTH
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: email
 *         in: body
 *         required: true
 *       - name: password
 *         in: body
 *         required: true
 *       - name: userType
 *         in: body
 *         required: true
 *     responses:
 *        201:
 *          description: user logged in succesfully.
 *        400:
 *          An error occured
 */
authRouter.post(
  "/login",
  [useLoginRateLimiter, useLoginSlowDown],
  AuthController.login
);

/**
 Refresh token
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logs out a user
 *     description: This logs the user out and set online status to false
 *     tags:
 *       - AUTH
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: _id
 *         in: req
 *     responses:
 *        201:
 *          description: user logged out .
 *        400:
 *          An error occured while logging out 
 */
authRouter.post("/logout", [useAuth], AuthController.logout);

/**
 Refresh token
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Refresh token
 *     description: This refreshes the user's token
 *     tags:
 *       - AUTH
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: refreshToken
 *         in: req.cookies
 *     responses:
 *        201:
 *          description: Token sent .
 *        400:
 *          An error occured while logging out 
 */
authRouter.post("/refresh-token", AuthController.generateRefreshToken);

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
