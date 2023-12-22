/* eslint disable */
import { Response, Request } from "express";
import { Buyer, Merchant } from "../models";
import { IBuyer } from "../models/buyer.model";
import { IMerchant } from "../models/merchant.model";
import bcrypt from "bcryptjs";
import config from "config";
import Joi from "joi";
import jwt from "jsonwebtoken";
import * as _ from "lodash";
import { generateLongToken, redisClient, response } from "./../utils";
import { generateOtp } from "../utils/utils";
const http = 100 | 101 | 102;
class AuthController {
  static async login(req: Request, res: Response) {
    const requestSchema = Joi.object({
      email: Joi.string().required().email(),
      password: Joi.string().required(),
      userType: Joi.string().required().valid("buyer", "merchant"),
    });

    const { error, value } = requestSchema.validate(req.body);
    if (error) return response(res, 400, error.details[0].message);

    const { email, password, userType } = value;
    if (userType !== "buyer" && userType !== "merchant")
      return response(res, 400, "Invalid user type");

    if (userType == "buyer") {
      let buyer: IBuyer | any = await Buyer.findOne({ email }).select(
        "+password"
      );

      if (!buyer) return response(res, 400, "Invalid credentials");

      const validPassword = await bcrypt.compare(password, buyer.password);
      if (!validPassword) return response(res, 400, "Invalid credentials");

      const accessToken = buyer.generateAccessToken();
      const refreshToken = buyer.generateRefreshToken();
      const options = { new: true, runValidators: true };

      buyer = await buyer.findOneAndUpdate(
        { email },
        { token: refreshToken, online: true },
        options
      );
      await buyer.save();

      //update the headers
      res.header("X-Auth-Access-Token", accessToken);
      res.header("X-Auth-Refresh-Token", refreshToken);

      // Set HTTP-only cookies for access token and refresh token
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: config.get("App.cookieAccessTokenExpiration"),
        path: "/",
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: config.get("App.cookieRefreshTokenExpiration"),
        path: "/",
      });

      const filteredUser = _.pick(buyer, [
        "_id",
        "name",
        "email",
        "username",
        "profilePicture",
        "createdAt",
        "updatedAt",
        "online",
      ]);

      const dataToClient = { accessToken, refreshToken, ...filteredUser };

      return response(res, 200, "Login successful", dataToClient);
    } else {
      let merchant: IMerchant | any = await Merchant.findOne({
        email,
      }).select("+password");

      if (!merchant) return response(res, 400, "Invalid credentials");

      const validPassword = await bcrypt.compare(password, merchant.password);
      if (!validPassword) return response(res, 400, "Invalid credentials");

      const accessToken = merchant.generateAccessToken();
      const refreshToken = merchant.generateRefreshToken();
      const options = { new: true, runValidators: true };

      merchant = await Merchant.findOneAndUpdate(
        { email },
        { token: refreshToken, online: true },
        options
      );

      await merchant.save();

      res.header("X-Auth-Access-Token", accessToken);
      res.header("X-Auth-Refresh-Token", refreshToken);

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: config.get("App.cookieAccessTokenExpiration"),
        path: "/",
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: config.get("App.cookieRefreshTokenExpiration"),
        path: "/",
      });

      const filteredHospital = _.pick(merchant, [
        "_id",
        "clinicName",
        "username",
        "email",
        "profilePicture",
        "createdAt",
        "updatedAt",
        "online",
      ]);

      const dataToClient = { accessToken, refreshToken, ...filteredHospital };

      return response(res, 200, "Login successful", dataToClient);
    }
  }

  static async resendOTP(req: Request | any, res: Response) {
    const { email } = req.params;

    const checkIfUSerExists = await Merchant.findOne({ email: email });

    if (checkIfUSerExists?.isVerified)
      return response(res, 400, "Service currently unavailable");

    const otp = generateOtp(6);
    redisClient.set(`agronomix_${email}`, JSON.stringify(otp), {
      EX: 60 * 60 * 24, // a day
      NX: true,
    });

    return response(res, 200, "Otp sent Successfully");
  }

  static async changePassword(req: Request, res: Response) {
    const validationSchema = Joi.object({
      oldPassword: Joi.string()
        .required()
        .min(6)
        .max(30)
        .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
      newPassword: Joi.string()
        .required()
        .min(6)
        .max(30)
        .valid(Joi.ref("newPassword"))
        .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
    });

    const { error, value } = validationSchema.validate(req.body);
    if (error) return response(res, 400, error.details[0].message);

    const { oldPassword, newPassword, userType } = value;
    if (userType !== "buyer" && userType !== "merchant")
      return response(res, 400, "Invalid user type");

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(value.newPassword, salt);

    if (userType == "buyer") {
      const buyer = await Buyer.findByIdAndUpdate(
        { _id: req.params.id },
        {
          password: password,
        },
        { new: true, runValidators: true }
      );
      return response(res, 200, "Password changed succesfully", buyer);
    } else {
      const merchant = await Merchant.findByIdAndUpdate(
        { _id: req.params.id },
        {
          password: password,
        },
        { new: true, runValidators: true }
      );
      return response(res, 200, "Password changed succesfully", merchant);
    }
  }

  static async verifyOTP(req: Request, res: Response) {
    const { email, otp } = req.params;
    const { userType } = req.body;

    if (userType !== "buyer" && userType !== "merchant")
      return response(res, 400, "Invalid user type");

    const cachedOTP = await redisClient.get(`agronomix_${email}`);

    if (!cachedOTP) return response(res, 400, "Invalid otp");

    if (cachedOTP !== otp) return response(res, 400, "Otp Mismatch");

    if (userType == "buyer") {
      await Buyer.findOneAndUpdate(
        { email },
        {
          isVerified: true,
        },
        { new: true, runValidators: true }
      );

      return response(res, 200, "Buyer verified Successfully");
    } else {
      await Merchant.findOneAndUpdate(
        { email },
        {
          isVerified: true,
        },
        { new: true, runValidators: true }
      );
      return response(res, 200, "Merchant verified Successfully");
    }
    redisClient.del(`agronomix_${otp}`);
  }

  static async startForgetPassword(req: Request | any, res: Response) {
    const { email } = req.params;

    const checkIfUSerExists =
      (await Buyer.findOne({ email: email })) ||
      Merchant.findOne({ email: email });

    if (checkIfUSerExists)
      return response(res, 400, "Service currently unavailable");

    const otp = generateOtp(6);
    redisClient.set(`agronomix_${email}`, JSON.stringify(otp), {
      EX: 60 * 60 * 24, // a day
      NX: true,
    });

    return response(
      res,
      200,
      "AN otp has been sent, please proceed to complete the preocess"
    );
  }
  static async completeForgetPassword(req: Request | any, res: Response) {
    const { otp, email } = req.params;

    const validationSchema = Joi.object({
      password: Joi.string()
        .required()
        .min(6)
        .max(30)
        .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
      confirmPassword: Joi.string().required().valid(Joi.ref("password")),
    });

    try {
      const cachedOTP = await redisClient.get(`agronomix_${email}`);
      if (!cachedOTP) return response(res, 400, "Invalid otp");

      if (cachedOTP !== otp) return response(res, 400, "Otp Mismatch");

      const { error, value } = validationSchema.validate(req.body);
      if (error) return response(res, 400, error.details[0].message);

      const salt = await bcrypt.genSalt(10);
      const password = await bcrypt.hash(value.password, salt);

      (await Buyer.findOneAndUpdate(
        { email: email },
        {
          password: password,
        },
        { new: true, runValidators: true }
      )) ||
        Merchant.findOneAndUpdate(
          { email: email },
          { password: password },
          { new: true, runValidators: true }
        );

      return response(res, 200, "Password changed succesfullly");
    } catch (error: any) {
      return response(res, 400, error?.message || "An error occurred");
    }
  }

  static async generateRefreshToken(req: Request, res: Response) {
    interface customJwtPayload {
      _id: string;
      username: string;
      name: string;
    }
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) return AuthController.logout(req, res);
    const privateKey: any = process.env.JWT_PRIVATE_KEY;

    const decoded: customJwtPayload | any = jwt.verify(
      refreshToken,
      privateKey
    );
    if (!decoded)
      return response(res, 401, "You're not authorized, Invalid token");

    const buyerRole = "buyer";
    const merchantRole = "merchant";

    if (decoded.role === buyerRole) {
      //that's a user
      const buyer = await Buyer.findById(decoded._id).select("+token");

      if (!buyer || !buyer.token)
        return response(res, 401, "You're not authorized, invalid token!");

      if (refreshToken === buyer.token) {
        const newAccessToken = buyer.generateAccessToken();

        res.header("X-Auth-Access-Token", newAccessToken);

        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          maxAge: config.get("App.cookieAccessTokenExpiration"),
          path: "/",
        });
        return response(
          res,
          200,
          "Access token generated successfully",
          newAccessToken
        );
      } else {
        // the token is no longer valid, so the buyer has to login.
        AuthController.logout(req, res);
      }
    } else if (decoded.role === merchantRole) {
      //that's a merchant
      const hospital = await Merchant.findById(decoded._id).select("+token");

      if (!hospital || !hospital.token)
        return response(res, 401, "You're not authorized, invalid token!");

      if (refreshToken === hospital.token) {
        const newAccessToken = hospital.generateAccessToken();

        res.header("X-Auth-Access-Token", newAccessToken);

        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          maxAge: config.get("App.cookieAccessTokenExpiration"),
          path: "/",
        });
        return response(
          res,
          200,
          "Access token generated successfully",
          newAccessToken
        );
      } else {
        //nobody
        AuthController.logout(req, res);
      }
    }
  }

  static async logout(req: Request | any, res: Response) {
    switch (req.userType) {
      case "buyer":
        const buyerId = req.buyer._id;
        const buyer: any = await Buyer.findByIdAndUpdate(
          { _id: buyerId },
          { online: false }
        );
        await buyer.save();

        break;
      case "merchant":
        const merchantId = req.merchant._id;
        const merchant: any = await Merchant.findByIdAndUpdate(
          { _id: merchantId },
          { online: false }
        );
        await merchant.save();

        break;
    }
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    return response(res, 200, "Logout successful!");
  }
}

export default AuthController;
