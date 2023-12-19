import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import Joi from "joi";
import * as _ from "lodash";
import { Buyer } from "../models";
import { AuthRequest } from "../types/types";
import { redisClient, response } from "./../utils";
import { generateOtp } from "../utils/utils";

class BuyerController {
  static async createBuyer(req: Request, res: Response) {
    const validationSchema = Joi.object({
      name: Joi.string().required().max(50),
      username: Joi.string().required().max(20),
      email: Joi.string().required().email(),
      password: Joi.string()
        .required()
        .min(6)
        .max(30)
        .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
      confirmPassword: Joi.string().required().valid(Joi.ref("password")),
    });

    const { error, value } = validationSchema.validate(req.body);

    if (error) return response(res, 400, error.details[0].message);

    //check if email has been taken by another buyer
    const { email: emailTaken, username: usernameTaken } = value;
    const existingEmailBuyer = await Buyer.findOne({ email: emailTaken });
    if (existingEmailBuyer) return response(res, 400, "Email already taken");

    const existingUsernameBuyer = await Buyer.findOne({
      username: usernameTaken,
    });
    if (existingUsernameBuyer)
      return response(res, 400, "Username already taken");

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(value.password, salt);
    const { name, username, email } = value;
    const profilePicture = `https://api.dicebear.com/7.x/micah/svg?seed=${
      username || name
    }`;
    const valuesToStore = {
      name,
      username,
      email,
      password,
      profilePicture,
    };

    const buyer = await Buyer.create(valuesToStore);
    const filteredBuyer = _.pick(buyer, [
      "name",
      "username",
      "email",
      "createdAt",
      "updatedAt",
      "profilePicture",
    ]);
    return response(res, 201, "Account created successfully", filteredBuyer);
  }

  static async getAllBuyers(req: Request | any, res: Response) {
    const allBuyers = await Buyer.find();

    return response(res, 200, "Buyers fetched successfully", allBuyers);
  }

  static async getBuyerById(req: Request, res: Response) {
    const requestSchema = Joi.object({
      id: Joi.string().required(),
    });

    const { error, value } = requestSchema.validate(req.params);
    if (error) return response(res, 400, error.details[0].message);

    const buyer = await Buyer.findById(value.id);
    if (!buyer) return response(res, 404, "Buyer with given id not found");

    return response(res, 200, "Buyer fetched successfully", buyer);
  }

  static async getMe(req: AuthRequest | any, res: Response) {
    const buyer = await Buyer.findById(req.buyer._id);
    if (!buyer) return response(res, 404, "Buyer with given id not found");
    return response(res, 200, "Buyer info fetched successfully", buyer);
  }

  static async getOnlineBuyers(req: Request, res: Response) {
    const onlineBuyers = await Buyer.find({ online: true });

    return response(
      res,
      200,
      "Online buyers fetched successfully",
      onlineBuyers
    );
  }

  static async searchBuyer(req: Request, res: Response) {
    const requestSchema = Joi.object({
      searchTerm: Joi.string().required(),
    });
    const { error, value } = requestSchema.validate(req.query);
    if (error) return response(res, 400, error.details[0].message);

    const { searchTerm } = value;

    const buyer = await Buyer.find({
      $or: [
        { name: { $regex: searchTerm, $options: "i" } },
        { username: { $regex: searchTerm, $options: "i" } },
      ],
    });

    if (buyer.length == 0) return response(res, 404, "No buyers found", []);

    if (!buyer) return response(res, 400, "Couldn't get buyer");

    return response(res, 200, "Buyer fetched successfully", buyer);
  }

  static async updateBuyer(req: Request, res: Response) {
    const requestSchema = Joi.object({
      name: Joi.string().required().max(50),
      username: Joi.string().required().max(20),
      bio: Joi.string().required().max(500),
      email: Joi.string().required().email(),
      location: Joi.string().required().max(50),
    });

    const { error: requestBodyError, value: requestBodyValue } =
      requestSchema.validate(req.body);
    if (requestBodyError)
      return response(res, 400, requestBodyError.details[0].message);

    const requestIdSchema = Joi.object({
      id: Joi.string().required(),
    });

    const { error: requestParamsError, value: requestParamsValue } =
      requestIdSchema.validate(req.params);
    if (requestParamsError)
      return response(res, 400, requestParamsError.details[0].message);

    //check if user with id exist
    const { id } = requestParamsValue;
    const existingBuyer = await Buyer.findById(id);
    if (!existingBuyer)
      return response(res, 404, "Buyer with given id not found");

    //check if email has been taken by another user
    const { username, email } = requestBodyValue;
    if (email && email !== existingBuyer.email) {
      const existingEmailUser = await Buyer.findOne({ email });
      if (existingEmailUser) return response(res, 400, "Email already taken");
    }

    // Check if username has been taken by another user
    if (username && username !== existingBuyer.username) {
      const existingUsernameUser = await Buyer.findOne({ username });
      if (existingUsernameUser) {
        return response(
          res,
          400,
          "Username has already been taken by another buyer"
        );
      }
    }

    //update the user
    const options = { new: true, runValidators: true };
    const updatedBuyer = await Buyer.findByIdAndUpdate(
      id,
      requestBodyValue,
      options
    );

    return response(
      res,
      200,
      "Account details updated successfully",
      updatedBuyer
    );
  }
  static async verifyOTP(req: Request | any, res: Response) {
    const { email, otp } = req.params;
    console.log(email);
    const cachedOTP = await redisClient.get(`agronomix_${email}`);
    console.log(cachedOTP);
    if (!cachedOTP) return response(res, 400, "Invalid otp");

    if (cachedOTP !== otp) return response(res, 400, "Otp Mismatch");

    await Buyer.findOneAndUpdate(
      { email },
      {
        isVerified: true,
      },
      { new: true, runValidators: true }
    );
    redisClient.del(`agronomix_${otp}`);
    return response(res, 200, "Buyer verified Successfully");
  }
  static async resendOTP(req: Request | any, res: Response) {
    const { email } = req.params;

    const checkIfUSerExists = await Buyer.findOne({ email: email });
    console.log(checkIfUSerExists?.isVerified);
    if (checkIfUSerExists?.isVerified)
      return response(res, 400, "Service currently unavailable");

    const otp = generateOtp(6);
    redisClient.set(`agronomix_${email}`, JSON.stringify(otp), {
      EX: 60 * 60 * 24, // a day
      NX: true,
    });

    return response(res, 200, "Otp sent Successfully");
  }
  static async startForgetPassword(req: Request | any, res: Response) {
    const { email } = req.params;

    const checkIfUSerExists = await Buyer.findOne({ email: email });
    console.log(checkIfUSerExists);
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
      confirPasswordPassword: Joi.string()
        .required()
        .valid(Joi.ref("newPassword")),
    });

    try {
      const cachedOTP = await redisClient.get(`agronomix_${email}`);
      if (!cachedOTP) return response(res, 400, "Invalid otp");

      if (cachedOTP !== otp) return response(res, 400, "Otp Mismatch");

      const { error, value } = validationSchema.validate(req.body);
      if (error) return response(res, 400, error.details[0].message);

      const salt = await bcrypt.genSalt(10);
      const password = await bcrypt.hash(value.password, salt);

      await Buyer.findOneAndUpdate(
        { email: email },
        {
          password: password,
        },
        { new: true, runValidators: true }
      );

      return response(res, 200, "Password changed succesfullly");
    } catch (error: any) {
      return response(res, 400, error?.message || "An error occurred");
    }
  }
  static async changePassword(req: AuthRequest | any, res: Response) {
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

    try {
      const { error, value } = validationSchema.validate(req.body);

      if (error) throw new Error(error.details[0].message);

      const salt = await bcrypt.genSalt(10);
      const password = await bcrypt.hash(value.password, salt);

      const buyer = await Buyer.findByIdAndUpdate(
        { _id: req.params.id },
        {
          password: password,
        },
        { new: true, runValidators: true }
      );
      return response(res, 200, "Password changed succesfully", buyer);
    } catch (error: any) {
      return response(res, 400, error.message || "AN Error occurred");
    }
  }
  static async deleteBuyer(req: Request, res: Response) {
    const requestSchema = Joi.object({
      id: Joi.string().required(),
    });

    const { error, value } = requestSchema.validate(req.params);
    if (error) return response(res, 200, error.details[0].message);

    const deletedBuyer = await Buyer.findByIdAndDelete(value.id);
    if (!deletedBuyer)
      return response(res, 404, "Buyer with given id not found!");

    return response(res, 200, "Buyer deleted successfully");
  }
}

export default BuyerController;
