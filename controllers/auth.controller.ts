import { Response, Request } from "express";
import { Buyer, Merchant } from "../models";
import { IBuyer } from "../models/buyer.model";
import { IMerchant } from "../models/merchant.model";
import bcrypt from "bcryptjs";
import config from "config";
import Joi from "joi";
import jwt from "jsonwebtoken";
import * as _ from "lodash";
import { generateLongToken, response, sendEmail } from "./../utils";

class AuthController {
  static async login(req: Request, res: Response) {
    const requestSchema = Joi.object({
      email: Joi.string().required().email(),
      password: Joi.string().required(),
      userType: Joi.string().required(),
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

      buyer = await Buyer.findOneAndUpdate(
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

      const filteredBuyer = _.pick(buyer, [
        "_id",
        "name",
        "username",
        "email",
        "profilePicture",
        "bio",
        "isVerified",
        "location",
        "online",
        "orders",
        "orderHistory",
        "collections",
        "createdAt",
        "updatedAt",
      ]);

      const dataToClient = { accessToken, refreshToken, ...filteredBuyer };

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

      const filteredMerchant = _.pick(merchant, [
        "_id",
        "companyName",
        "username",
        "email",
        "profilePicture",
        "bio",
        "isVerified",
        "location",
        "online",
        "orders",
        "orderHistory",
        "products",
        "createdAt",
        "updatedAt",
      ]);

      const dataToClient = { accessToken, refreshToken, ...filteredMerchant };

      return response(res, 200, "Login successful", dataToClient);
    }
  }

  static async generateAccessToken(req: Request, res: Response) {
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

  static async sendEmailToken(req: Request, res: Response) {
    const userType = req.userType;
    let defaultName: any = "Agronomix";

    switch (userType) {
      case "buyer":
        defaultName = req.buyer?.name;
        break;

      case "merchant":
        defaultName = req.merchant?.companyName;
        break;
    }

    const requestSchema = Joi.object({
      email: Joi.string().required().email(),
    });

    const { error, value } = requestSchema.validate(req.query);

    if (error) return response(res, 400, error.details[0].message);
    const { email } = value;

    if (userType === "buyer") {
      const user = await Buyer.findOne({ email }).select(
        "+verifyEmailToken +verifyEmailTokenExpire"
      );
      if (!user) return response(res, 404, "Buyer with given email not found");
      const verifyEmailToken = generateLongToken();

      //update the verifyEmailToken
      user.verifyEmailToken = verifyEmailToken;
      user.verifyEmailTokenExpire = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await user.save();
      const serverURL =
        process.env.NODE_ENV === "development"
          ? "http://localhost:2800"
          : req.hostname;

      const domain = `${serverURL}/api/auth/confirm-email?token=${verifyEmailToken}&userType=${userType}`;

      const data = `
                <div style="background-color: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);">
      
                    <h1 style="color: #2EB875; font-weight:bold;">Agronomix</h1>
                    <h3>Email Verification</h3>
      
                    <p style="color: #333;">Dear ${req.buyer?.name}</p>
      
                    <p style="color: #333;">Thank you for creating an account with Agronomix. To complete the registration process and become verified,  please verify your email address by clicking the button below:</p>
      
                    <a href=${domain} style="display: inline-block; margin: 20px 0; padding: 10px 20px; background-color: #2EB875; color: #fff; text-decoration: none; border-radius: 4px;">Verify My Email</a>
                  <br/>
                    <span>Or copy this ${domain} and paste it to your browser </span>
      
                    <p style="color: #333;">If you didn't create an account with us, please ignore this email.</p>
      
                    <p style="color: #333;">Thank you for choosing Agronomix</p>
      
                </div>
      
          `;

      const result = await sendEmail("Verify Account", data, email);
      if (!result)
        return response(res, 400, "An error occured while sending the email");

      return response(res, 200, "Verification mail sent successfully");
    } else if (userType === "merchant") {
      const merchant = await Merchant.findOne({ email }).select(
        "+verifyEmailToken +verifyEmailTokenExpire"
      );
      if (!merchant)
        return response(res, 404, "Merchant with given email not found");

      const verifyEmailToken = generateLongToken();

      //update the verifyEmailToken
      merchant.verifyEmailToken = verifyEmailToken;
      merchant.verifyEmailTokenExpire = new Date(
        Date.now() + 24 * 60 * 60 * 1000
      );
      await merchant.save();
      const serverURL =
        process.env.NODE_ENV === "development"
          ? "http://localhost:2800"
          : req.hostname;
      const domain = `${serverURL}/api/auth/confirm-email?token=${verifyEmailToken}&userType=${userType}`;
      const data = `
                <div style="background-color: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);">
      
                    <h1 style="color: #2EB875; font-weight:bold;">Agronomix</h1>
                    <h3>Email Verification</h3>
      
                    <p style="color: #333;">Dear ${req.merchant?.companyName},</p>
      
                    <p style="color: #333;">Thank you for creating a Merchant account with Agronomix. To complete the registration process and become verified,  please verify your email address by clicking the button below:</p>
      
                    <a href=${domain} style="display: inline-block; margin: 20px 0; padding: 10px 20px; background-color: #2EB875; color: #fff; text-decoration: none; border-radius: 4px;">Verify My Email</a>
                  <br/>
                    <span>Or copy this ${domain} and paste it to your browser </span>
      
                    <p style="color: #333;">If you didn't create an account with us, please ignore this email.</p>
      
                    <p style="color: #333;">Thank you for choosing Agronomix</p>
      
                </div>
      
          `;

      const result = await sendEmail("Verify Account", data, email);
      if (!result)
        return response(res, 400, "An error occured while sending the email");

      return response(res, 200, "Verification mail sent successfully");
    }
  }

  static async verifyEmailToken(req: Request, res: Response) {
    const requestSchema = Joi.object({
      token: Joi.string().required(),
      userType: Joi.string().required(),
    });

    const { error, value } = requestSchema.validate(req.query);
    if (error) return response(res, 400, error.details[0].message);
    const redirectURL =
      process.env.NODE_ENV === "development"
        ? `http://localhost:3000/auth/verified`
        : `https://agronomix.vercel.app/auth/verified`;

    const { token, userType } = value;

    const verifyEmailToken = token;
    if (userType === "buyer") {
      const buyer = await Buyer.findOne({
        verifyEmailToken,
        verifyEmailTokenExpire: { $gt: Date.now() },
      });

      if (!buyer) {
        console.log(buyer);
        return res
          .status(400)
          .redirect(
            redirectURL +
              "?success=false&message=Invalid or expired token!&userType=buyer"
          );
      }

      buyer.verifyEmailToken = undefined;
      buyer.verifyEmailTokenExpire = undefined;
      buyer.isVerified = true;

      await buyer.save();

      return res
        .status(200)
        .redirect(
          redirectURL +
            "?success=true&message=Buyer Email verified successfully&userType=buyer"
        );
    } else if (userType == "hospital") {
      const merchant = await Merchant.findOne({
        verifyEmailToken,
        verifyEmailTokenExpire: { $gt: Date.now() },
      });

      if (!merchant) {
        return res
          .status(400)
          .redirect(
            redirectURL +
              "?success=false&message=Invalid or expired token!&userType=merchant"
          );
      }

      merchant.verifyEmailToken = undefined;
      merchant.verifyEmailTokenExpire = undefined;
      merchant.isVerified = true;

      await merchant.save();

      return res
        .status(200)
        .redirect(
          redirectURL +
            "?success=true&message=Merchant email verified successfully&userType=merchant"
        );
    } else {
      return res
        .status(400)
        .redirect(
          redirectURL +
            "?success=false&message=No valid user type, please login!"
        );
    }
  }

  static async forgotPassword(req: Request, res: Response) {
    const requestSchema = Joi.object({
      email: Joi.string().required().email(),
      userType: Joi.string().required(),
    });

    const { error, value } = requestSchema.validate(req.body);
    if (error) return response(res, 400, error.details[0].message);

    const { email, userType: clientUserType } = value;

    const userType = clientUserType;

    if (userType == "buyer") {
      const buyer = await Buyer.findOne({ email }).select(
        "+resetPasswordToken +resetPasswordTokenExpire"
      );
      if (!buyer) {
        return response(res, 400, "Invalid or expired token!");
      }

      const resetToken = generateLongToken();
      // 1 hour
      const tokenExpireDate = new Date(Date.now() + 3600000);

      buyer.resetPasswordToken = resetToken;
      buyer.resetPasswordTokenExpire = tokenExpireDate;

      await buyer.save();
      const clientDomain =
        process.env.NODE_ENV === "development"
          ? `http://localhost:3000/auth/reset-password?token=${resetToken}&userType=${userType}`
          : `https://agronomix.vercel.app/auth/reset-password?token=${resetToken}&userType=${userType}`;

      const data = `
                <div style="background-color: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);">
      
                    <h1 style="color: #2EB875;">Change Password</h1>
      
                    <p style="color: #333;">Dear ${buyer.name},</p>
      
                    <p style="color: #333;">We received a request to reset your password for your Agronomix account. To proceed with resetting your password, please click the button below. 
                    Please note that this link is temporary and will expire in an hour, so make sure to reset your password as soon as possible.
                    </p>
      
                    <a href=${clientDomain} style="display: inline-block; margin: 20px 0; padding: 10px 20px; background-color: #2EB875; color: #fff; text-decoration: none; border-radius: 4px;">Change my password</a>
                    <br/>
                    <span>Or copy this link ${clientDomain} and paste it to your browser </span>
      
                    <p style="color: #333;">If you didn't initiate a password reset, please ignore this email.</p>
      
                    <p style="color: #333;">Thank you for choosing Agronomix.</p>
      
                </div>
          `;

      const result = await sendEmail("Change Password", data, email);
      if (!result)
        return response(res, 400, "An error occured while sending the email");

      return response(
        res,
        200,
        "Password reset link sent to mail successfully"
      );
    } else if (userType == "merchant") {
      const merchant = await Merchant.findOne({ email }).select(
        "+resetPasswordToken +resetPasswordTokenExpire"
      );
      if (!merchant) {
        return response(res, 404, "Hospital not found!");
      }

      const resetToken = generateLongToken();
      // 1 hour
      const tokenExpireDate = new Date(Date.now() + 3600000);

      merchant.resetPasswordToken = resetToken;
      merchant.resetPasswordTokenExpire = tokenExpireDate;
      await merchant.save();
      const clientDomain =
        process.env.NODE_ENV === "development"
          ? `http://localhost:3000/auth/reset-password?token=${resetToken}&userType=${userType}`
          : `https://agronomix.vercel.app/auth/reset-password?token=${resetToken}&userType=${userType}`;

      const data = `
                  <div style="background-color: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);">
      
                    <h1 style="color: #2EB875;">Change Password</h1>
      
                    <p style="color: #333;">Dear ${merchant.companyName},</p>
      
                    <p style="color: #333;">We received a request to reset your password for your Agronomix Merchant account. To proceed with resetting your password, please click the button below. 
                    Please note that this link is temporary and will expire in an hour, so make sure to reset your password as soon as possible.
                    </p>
      
                    <a href=${clientDomain} style="display: inline-block; margin: 20px 0; padding: 10px 20px; background-color: #2EB875; color: #fff; text-decoration: none; border-radius: 4px;">Change my password</a>
                    <br/>
                    <span>Or copy this link ${clientDomain} and paste it to your browser </span>
      
                    <p style="color: #333;">If you didn't initiate a password reset, please ignore this email.</p>
      
                    <p style="color: #333;">Thank you for choosing Agronomix.</p>
      
                </div>

          `;

      const result = await sendEmail("Change Password", data, email);
      if (!result)
        return response(res, 400, "An error occured while sending the email");

      return response(
        res,
        200,
        "Password reset link sent to mail successfully"
      );
    } else {
      return response(
        res,
        400,
        "Invalid user type, valid userTypes include a buyer or a merchant!"
      );
    }
  }

  static async resetPassword(req: Request, res: Response) {
    const requestSchema = Joi.object({
      token: Joi.string().required(),
      password: Joi.string().required().min(6).max(30),
      userType: Joi.string().required(),
    });

    const { error, value } = requestSchema.validate(req.body);
    if (error) return response(res, 400, error.details[0].message);
    const { token, password, userType: clientUserType } = value;
    const resetPasswordToken = token;
    const userType = clientUserType;

    if (userType === "buyer") {
      const buyer = await Buyer.findOne({
        resetPasswordToken,
        resetPasswordTokenExpire: { $gt: Date.now() },
      }).select("+resetPasswordToken +resetPasswordTokenExpire");

      if (!buyer) return response(res, 400, "Invalid or expired token!");
      // Hash and set the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      buyer.password = hashedPassword;
      buyer.resetPasswordToken = undefined;
      buyer.resetPasswordTokenExpire = undefined;

      await buyer.save();

      return response(res, 200, "Password reset successful");
    } else if (userType == "hospital") {
      const merchant = await Merchant.findOne({
        resetPasswordToken,
        resetPasswordTokenExpire: { $gt: Date.now() },
      }).select("+resetPasswordToken +resetPasswordTokenExpire");

      if (!merchant) return response(res, 400, "Invalid or expired token!");
      // Hash and set the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      merchant.password = hashedPassword;
      merchant.resetPasswordToken = undefined;
      merchant.resetPasswordTokenExpire = undefined;

      await merchant.save();

      return response(res, 200, "Password reset successful");
    } else {
      return response(res, 404, "No valid user type, please login");
    }
  }

  static async changePassword(req: Request, res: Response) {
    const requestSchema = Joi.object({
      currentPassword: Joi.string().required(),
      newPassword: Joi.string().required(),
    });

    const { error, value } = requestSchema.validate(req.body);
    if (error) return response(res, 400, error.details[0].message);

    const { currentPassword, newPassword } = value;
    const userType = req.userType;

    switch (userType) {
      case "buyer":
        const buyerId = req.buyer?._id;
        const buyer: IBuyer | any = await Buyer.findById(buyerId).select(
          "+password"
        );
        if (!buyer) return response(res, 404, "Buyer not found");

        //check if the currentPassword matches the one the buyer sent
        const validBuyerPassword = await bcrypt.compare(
          currentPassword,
          buyer.password
        );

        if (!validBuyerPassword)
          return response(res, 400, "Invalid credentials");

        buyer.password = newPassword;
        await buyer.save();
        return response(res, 200, "Password updated successfully");

      case "merchant":
        const merchantId = req.merchant?._id;
        const merchant: IMerchant | any = await Merchant.findOne({
          _id: merchantId,
        }).select("+password");

        console.log(merchant);

        if (!merchant) return response(res, 404, "Merchant not found");

        const validMerchantPassword = await bcrypt.compare(
          currentPassword,
          merchant.password
        );
        if (!validMerchantPassword)
          return response(res, 400, "Invalid credentials");

        merchant.password = newPassword;
        await merchant.save();

        return response(res, 200, "Password updated successfully");

      default:
        /**
         * @see A normal user shouldn't reach this block of code. 🤣
         * Only a malacious user would get here.
         * We would confuse them by sending a generic error response
         */
        return response(res, 400, "Invalid credentials");
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
