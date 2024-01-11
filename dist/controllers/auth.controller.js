"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const config_1 = __importDefault(require("config"));
const joi_1 = __importDefault(require("joi"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const _ = __importStar(require("lodash"));
const utils_1 = require("./../utils");
class AuthController {
    static login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestSchema = joi_1.default.object({
                email: joi_1.default.string().required().email(),
                password: joi_1.default.string().required(),
                userType: joi_1.default.string().required(),
            });
            const { error, value } = requestSchema.validate(req.body);
            if (error)
                return (0, utils_1.response)(res, 400, error.details[0].message);
            const { email, password, userType } = value;
            if (userType !== "buyer" && userType !== "merchant")
                return (0, utils_1.response)(res, 400, "Invalid user type");
            if (userType == "buyer") {
                let buyer = yield models_1.Buyer.findOne({ email }).select("+password");
                if (!buyer)
                    return (0, utils_1.response)(res, 400, "Invalid credentials");
                const validPassword = yield bcryptjs_1.default.compare(password, buyer.password);
                if (!validPassword)
                    return (0, utils_1.response)(res, 400, "Invalid credentials");
                const accessToken = buyer.generateAccessToken();
                const refreshToken = buyer.generateRefreshToken();
                const options = { new: true, runValidators: true };
                buyer = yield models_1.Buyer.findOneAndUpdate({ email }, { token: refreshToken, online: true }, options);
                yield buyer.save();
                //update the headers
                res.header("X-Auth-Access-Token", accessToken);
                res.header("X-Auth-Refresh-Token", refreshToken);
                // Set HTTP-only cookies for access token and refresh token
                res.cookie("accessToken", accessToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "none",
                    maxAge: config_1.default.get("App.cookieAccessTokenExpiration"),
                    path: "/",
                });
                res.cookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "none",
                    maxAge: config_1.default.get("App.cookieRefreshTokenExpiration"),
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
                    "role",
                    "orders",
                    "reviews",
                    "orderHistory",
                    "collections",
                    "createdAt",
                    "updatedAt",
                ]);
                const dataToClient = Object.assign({ accessToken, refreshToken }, filteredBuyer);
                return (0, utils_1.response)(res, 200, "Login successful", dataToClient);
            }
            else {
                let merchant = yield models_1.Merchant.findOne({
                    email,
                }).select("+password");
                if (!merchant)
                    return (0, utils_1.response)(res, 400, "Invalid credentials");
                const validPassword = yield bcryptjs_1.default.compare(password, merchant.password);
                if (!validPassword)
                    return (0, utils_1.response)(res, 400, "Invalid credentials");
                const accessToken = merchant.generateAccessToken();
                const refreshToken = merchant.generateRefreshToken();
                const options = { new: true, runValidators: true };
                merchant = yield models_1.Merchant.findOneAndUpdate({ email }, { token: refreshToken, online: true }, options);
                yield merchant.save();
                res.header("X-Auth-Access-Token", accessToken);
                res.header("X-Auth-Refresh-Token", refreshToken);
                res.cookie("accessToken", accessToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "none",
                    maxAge: config_1.default.get("App.cookieAccessTokenExpiration"),
                    path: "/",
                });
                res.cookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "none",
                    maxAge: config_1.default.get("App.cookieRefreshTokenExpiration"),
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
                    "role",
                    "orders",
                    "customers",
                    "reviews",
                    "orderHistory",
                    "products",
                    "createdAt",
                    "updatedAt",
                ]);
                const dataToClient = Object.assign({ accessToken, refreshToken }, filteredMerchant);
                return (0, utils_1.response)(res, 200, "Login successful", dataToClient);
            }
        });
    }
    static generateAccessToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken)
                return AuthController.logout(req, res);
            const privateKey = process.env.JWT_PRIVATE_KEY;
            const decoded = jsonwebtoken_1.default.verify(refreshToken, privateKey);
            if (!decoded)
                return (0, utils_1.response)(res, 401, "You're not authorized, Invalid token");
            const buyerRole = "buyer";
            const merchantRole = "merchant";
            if (decoded.role === buyerRole) {
                //that's a user
                const buyer = yield models_1.Buyer.findById(decoded._id).select("+token");
                if (!buyer || !buyer.token)
                    return (0, utils_1.response)(res, 401, "You're not authorized, invalid token!");
                if (refreshToken === buyer.token) {
                    const newAccessToken = buyer.generateAccessToken();
                    res.header("X-Auth-Access-Token", newAccessToken);
                    res.cookie("accessToken", newAccessToken, {
                        httpOnly: true,
                        secure: true,
                        sameSite: "none",
                        maxAge: config_1.default.get("App.cookieAccessTokenExpiration"),
                        path: "/",
                    });
                    return (0, utils_1.response)(res, 200, "Access token generated successfully", newAccessToken);
                }
                else {
                    // the token is no longer valid, so the buyer has to login.
                    AuthController.logout(req, res);
                }
            }
            else if (decoded.role === merchantRole) {
                //that's a merchant
                const hospital = yield models_1.Merchant.findById(decoded._id).select("+token");
                if (!hospital || !hospital.token)
                    return (0, utils_1.response)(res, 401, "You're not authorized, invalid token!");
                if (refreshToken === hospital.token) {
                    const newAccessToken = hospital.generateAccessToken();
                    res.header("X-Auth-Access-Token", newAccessToken);
                    res.cookie("accessToken", newAccessToken, {
                        httpOnly: true,
                        secure: true,
                        sameSite: "none",
                        maxAge: config_1.default.get("App.cookieAccessTokenExpiration"),
                        path: "/",
                    });
                    return (0, utils_1.response)(res, 200, "Access token generated successfully", newAccessToken);
                }
                else {
                    //nobody
                    AuthController.logout(req, res);
                }
            }
        });
    }
    static sendEmailToken(req, res) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            const userType = req.userType;
            let defaultName = "Agronomix";
            switch (userType) {
                case "buyer":
                    defaultName = (_a = req.buyer) === null || _a === void 0 ? void 0 : _a.name;
                    break;
                case "merchant":
                    defaultName = (_b = req.merchant) === null || _b === void 0 ? void 0 : _b.companyName;
                    break;
            }
            const requestSchema = joi_1.default.object({
                email: joi_1.default.string().required().email(),
            });
            const { error, value } = requestSchema.validate(req.query);
            if (error)
                return (0, utils_1.response)(res, 400, error.details[0].message);
            const { email } = value;
            if (userType === "buyer") {
                const user = yield models_1.Buyer.findOne({ email }).select("+verifyEmailToken +verifyEmailTokenExpire");
                if (!user)
                    return (0, utils_1.response)(res, 404, "Buyer with given email not found");
                const verifyEmailToken = (0, utils_1.generateLongToken)();
                //update the verifyEmailToken
                user.verifyEmailToken = verifyEmailToken;
                user.verifyEmailTokenExpire = new Date(Date.now() + 24 * 60 * 60 * 1000);
                yield user.save();
                const serverURL = process.env.NODE_ENV === "development"
                    ? "http://localhost:2800"
                    : req.hostname;
                const domain = `${serverURL}/api/auth/confirm-email?token=${verifyEmailToken}&userType=${userType}`;
                const data = `
                <div style="background-color: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);">
      
                    <h1 style="color: #2EB875; font-weight:bold;">Agronomix</h1>
                    <h3>Email Verification</h3>
      
                    <p style="color: #333;">Dear ${(_c = req.buyer) === null || _c === void 0 ? void 0 : _c.name}</p>
      
                    <p style="color: #333;">Thank you for creating an account with Agronomix. To complete the registration process and become verified,  please verify your email address by clicking the button below:</p>
      
                    <a href=${domain} style="display: inline-block; margin: 20px 0; padding: 10px 20px; background-color: #2EB875; color: #fff; text-decoration: none; border-radius: 4px;">Verify My Email</a>
                  <br/>
                    <span>Or copy this ${domain} and paste it to your browser </span>
      
                    <p style="color: #333;">If you didn't create an account with us, please ignore this email.</p>
      
                    <p style="color: #333;">Thank you for choosing Agronomix</p>
      
                </div>
      
          `;
                const result = yield (0, utils_1.sendEmail)("Verify Account", data, email);
                if (!result)
                    return (0, utils_1.response)(res, 400, "An error occured while sending the email");
                return (0, utils_1.response)(res, 200, "Verification mail sent successfully");
            }
            else if (userType === "merchant") {
                const merchant = yield models_1.Merchant.findOne({ email }).select("+verifyEmailToken +verifyEmailTokenExpire");
                if (!merchant)
                    return (0, utils_1.response)(res, 404, "Merchant with given email not found");
                const verifyEmailToken = (0, utils_1.generateLongToken)();
                //update the verifyEmailToken
                merchant.verifyEmailToken = verifyEmailToken;
                merchant.verifyEmailTokenExpire = new Date(Date.now() + 24 * 60 * 60 * 1000);
                yield merchant.save();
                const serverURL = process.env.NODE_ENV === "development"
                    ? "http://localhost:2800"
                    : req.hostname;
                const domain = `${serverURL}/api/auth/confirm-email?token=${verifyEmailToken}&userType=${userType}`;
                const data = `
                <div style="background-color: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);">
      
                    <h1 style="color: #2EB875; font-weight:bold;">Agronomix</h1>
                    <h3>Email Verification</h3>
      
                    <p style="color: #333;">Dear ${(_d = req.merchant) === null || _d === void 0 ? void 0 : _d.companyName},</p>
      
                    <p style="color: #333;">Thank you for creating a Merchant account with Agronomix. To complete the registration process and become verified,  please verify your email address by clicking the button below:</p>
      
                    <a href=${domain} style="display: inline-block; margin: 20px 0; padding: 10px 20px; background-color: #2EB875; color: #fff; text-decoration: none; border-radius: 4px;">Verify My Email</a>
                  <br/>
                    <span>Or copy this ${domain} and paste it to your browser </span>
      
                    <p style="color: #333;">If you didn't create an account with us, please ignore this email.</p>
      
                    <p style="color: #333;">Thank you for choosing Agronomix</p>
      
                </div>
      
          `;
                const result = yield (0, utils_1.sendEmail)("Verify Account", data, email);
                if (!result)
                    return (0, utils_1.response)(res, 400, "An error occured while sending the email");
                return (0, utils_1.response)(res, 200, "Verification mail sent successfully");
            }
        });
    }
    static verifyEmailToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestSchema = joi_1.default.object({
                token: joi_1.default.string().required(),
                userType: joi_1.default.string().required(),
            });
            const { error, value } = requestSchema.validate(req.query);
            if (error)
                return (0, utils_1.response)(res, 400, error.details[0].message);
            const redirectURL = process.env.NODE_ENV === "development"
                ? `http://localhost:3000/auth/verified`
                : `https://agronomix.vercel.app/auth/verified`;
            const { token, userType } = value;
            const verifyEmailToken = token;
            if (userType === "buyer") {
                const buyer = yield models_1.Buyer.findOne({
                    verifyEmailToken,
                    verifyEmailTokenExpire: { $gt: Date.now() },
                });
                if (!buyer) {
                    console.log(buyer);
                    return res
                        .status(400)
                        .redirect(redirectURL +
                        "?success=false&message=Invalid or expired token!&userType=buyer");
                }
                buyer.verifyEmailToken = undefined;
                buyer.verifyEmailTokenExpire = undefined;
                buyer.isVerified = true;
                yield buyer.save();
                return res
                    .status(200)
                    .redirect(redirectURL +
                    "?success=true&message=Buyer Email verified successfully&userType=buyer");
            }
            else if (userType == "hospital") {
                const merchant = yield models_1.Merchant.findOne({
                    verifyEmailToken,
                    verifyEmailTokenExpire: { $gt: Date.now() },
                });
                if (!merchant) {
                    return res
                        .status(400)
                        .redirect(redirectURL +
                        "?success=false&message=Invalid or expired token!&userType=merchant");
                }
                merchant.verifyEmailToken = undefined;
                merchant.verifyEmailTokenExpire = undefined;
                merchant.isVerified = true;
                yield merchant.save();
                return res
                    .status(200)
                    .redirect(redirectURL +
                    "?success=true&message=Merchant email verified successfully&userType=merchant");
            }
            else {
                return res
                    .status(400)
                    .redirect(redirectURL +
                    "?success=false&message=No valid user type, please login!");
            }
        });
    }
    static forgotPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestSchema = joi_1.default.object({
                email: joi_1.default.string().required().email(),
                userType: joi_1.default.string().required(),
            });
            const { error, value } = requestSchema.validate(req.body);
            if (error)
                return (0, utils_1.response)(res, 400, error.details[0].message);
            const { email, userType: clientUserType } = value;
            const userType = clientUserType;
            if (userType == "buyer") {
                const buyer = yield models_1.Buyer.findOne({ email }).select("+resetPasswordToken +resetPasswordTokenExpire");
                if (!buyer) {
                    return (0, utils_1.response)(res, 400, "Invalid or expired token!");
                }
                const resetToken = (0, utils_1.generateLongToken)();
                // 1 hour
                const tokenExpireDate = new Date(Date.now() + 3600000);
                buyer.resetPasswordToken = resetToken;
                buyer.resetPasswordTokenExpire = tokenExpireDate;
                yield buyer.save();
                const clientDomain = process.env.NODE_ENV === "development"
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
                const result = yield (0, utils_1.sendEmail)("Change Password", data, email);
                if (!result)
                    return (0, utils_1.response)(res, 400, "An error occured while sending the email");
                return (0, utils_1.response)(res, 200, "Password reset link sent to mail successfully");
            }
            else if (userType == "merchant") {
                const merchant = yield models_1.Merchant.findOne({ email }).select("+resetPasswordToken +resetPasswordTokenExpire");
                if (!merchant) {
                    return (0, utils_1.response)(res, 404, "Hospital not found!");
                }
                const resetToken = (0, utils_1.generateLongToken)();
                // 1 hour
                const tokenExpireDate = new Date(Date.now() + 3600000);
                merchant.resetPasswordToken = resetToken;
                merchant.resetPasswordTokenExpire = tokenExpireDate;
                yield merchant.save();
                const clientDomain = process.env.NODE_ENV === "development"
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
                const result = yield (0, utils_1.sendEmail)("Change Password", data, email);
                if (!result)
                    return (0, utils_1.response)(res, 400, "An error occured while sending the email");
                return (0, utils_1.response)(res, 200, "Password reset link sent to mail successfully");
            }
            else {
                return (0, utils_1.response)(res, 400, "Invalid user type, valid userTypes include a buyer or a merchant!");
            }
        });
    }
    static resetPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestSchema = joi_1.default.object({
                token: joi_1.default.string().required(),
                password: joi_1.default.string().required().min(6).max(30),
                userType: joi_1.default.string().required(),
            });
            const { error, value } = requestSchema.validate(req.body);
            if (error)
                return (0, utils_1.response)(res, 400, error.details[0].message);
            const { token, password, userType: clientUserType } = value;
            const resetPasswordToken = token;
            const userType = clientUserType;
            if (userType === "buyer") {
                const buyer = yield models_1.Buyer.findOne({
                    resetPasswordToken,
                    resetPasswordTokenExpire: { $gt: Date.now() },
                }).select("+resetPasswordToken +resetPasswordTokenExpire");
                if (!buyer)
                    return (0, utils_1.response)(res, 400, "Invalid or expired token!");
                // Hash and set the new password
                const salt = yield bcryptjs_1.default.genSalt(10);
                const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
                buyer.password = hashedPassword;
                buyer.resetPasswordToken = undefined;
                buyer.resetPasswordTokenExpire = undefined;
                yield buyer.save();
                return (0, utils_1.response)(res, 200, "Password reset successful");
            }
            else if (userType == "hospital") {
                const merchant = yield models_1.Merchant.findOne({
                    resetPasswordToken,
                    resetPasswordTokenExpire: { $gt: Date.now() },
                }).select("+resetPasswordToken +resetPasswordTokenExpire");
                if (!merchant)
                    return (0, utils_1.response)(res, 400, "Invalid or expired token!");
                // Hash and set the new password
                const salt = yield bcryptjs_1.default.genSalt(10);
                const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
                merchant.password = hashedPassword;
                merchant.resetPasswordToken = undefined;
                merchant.resetPasswordTokenExpire = undefined;
                yield merchant.save();
                return (0, utils_1.response)(res, 200, "Password reset successful");
            }
            else {
                return (0, utils_1.response)(res, 404, "No valid user type, please login");
            }
        });
    }
    static changePassword(req, res) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const requestSchema = joi_1.default.object({
                currentPassword: joi_1.default.string().required(),
                newPassword: joi_1.default.string().required(),
            });
            const { error, value } = requestSchema.validate(req.body);
            if (error)
                return (0, utils_1.response)(res, 400, error.details[0].message);
            const { currentPassword, newPassword } = value;
            const userType = req.userType;
            switch (userType) {
                case "buyer":
                    const buyerId = (_a = req.buyer) === null || _a === void 0 ? void 0 : _a._id;
                    const buyer = yield models_1.Buyer.findById(buyerId).select("+password");
                    if (!buyer)
                        return (0, utils_1.response)(res, 404, "Buyer not found");
                    //check if the currentPassword matches the one the buyer sent
                    const validBuyerPassword = yield bcryptjs_1.default.compare(currentPassword, buyer.password);
                    if (!validBuyerPassword)
                        return (0, utils_1.response)(res, 400, "Invalid credentials");
                    buyer.password = newPassword;
                    yield buyer.save();
                    return (0, utils_1.response)(res, 200, "Password updated successfully");
                case "merchant":
                    const merchantId = (_b = req.merchant) === null || _b === void 0 ? void 0 : _b._id;
                    const merchant = yield models_1.Merchant.findOne({
                        _id: merchantId,
                    }).select("+password");
                    console.log(merchant);
                    if (!merchant)
                        return (0, utils_1.response)(res, 404, "Merchant not found");
                    const validMerchantPassword = yield bcryptjs_1.default.compare(currentPassword, merchant.password);
                    if (!validMerchantPassword)
                        return (0, utils_1.response)(res, 400, "Invalid credentials");
                    merchant.password = newPassword;
                    yield merchant.save();
                    return (0, utils_1.response)(res, 200, "Password updated successfully");
                default:
                    /**
                     * @see A normal user shouldn't reach this block of code. 🤣
                     * Only a malacious user would get here.
                     * We would confuse them by sending a generic error response
                     */
                    return (0, utils_1.response)(res, 400, "Invalid credentials");
            }
        });
    }
    static logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (req.userType) {
                case "buyer":
                    const buyerId = req.buyer._id;
                    const buyer = yield models_1.Buyer.findByIdAndUpdate({ _id: buyerId }, { online: false });
                    yield buyer.save();
                    break;
                case "merchant":
                    const merchantId = req.merchant._id;
                    const merchant = yield models_1.Merchant.findByIdAndUpdate({ _id: merchantId }, { online: false });
                    yield merchant.save();
                    break;
            }
            res.clearCookie("accessToken");
            res.clearCookie("refreshToken");
            return (0, utils_1.response)(res, 200, "Logout successful!");
        });
    }
}
exports.default = AuthController;
