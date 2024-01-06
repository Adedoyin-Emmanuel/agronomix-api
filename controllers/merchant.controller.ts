import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import Joi from "joi";
import * as _ from "lodash";
import { Merchant } from "../models";
import { AuthRequest } from "../types/types";
import { response } from "./../utils";

class MerchantController {
  static async createMerchant(req: Request, res: Response) {
    const validationSchema = Joi.object({
      companyName: Joi.string().required().max(50),
      username: Joi.string().required().max(20),
      email: Joi.string().required().email(),
      password: Joi.string().required().min(6).max(30),
    });

    const { error, value } = validationSchema.validate(req.body);

    if (error) return response(res, 400, error.details[0].message);

    //check if email has been taken by another buyer
    const { email: emailTaken, username: usernameTaken } = value;
    const existingEmailMerchant = await Merchant.findOne({ email: emailTaken });
    if (existingEmailMerchant) return response(res, 400, "Email already taken");

    const existingUsernameMerchant = await Merchant.findOne({
      username: usernameTaken,
    });
    if (existingUsernameMerchant)
      return response(res, 400, "Username already taken");

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(value.password, salt);
    const { companyName, username, email } = value;
    const profilePicture = `https://api.dicebear.com/7.x/micah/svg?seed=${
      username || companyName
    }`;
    const valuesToStore = {
      companyName,
      username,
      email,
      password,
      profilePicture,
    };

    const merchant = await Merchant.create(valuesToStore);
    const filteredMerchant = _.pick(merchant, [
      "companyName",
      "username",
      "email",
      "createdAt",
      "updatedAt",
      "profilePicture",
    ]);
    return response(res, 201, "Account created successfully", filteredMerchant);
  }

  static async getAllMerchants(req: Request | any, res: Response) {
    const allBuyers = await Merchant.find();

    return response(res, 200, "Merchants fetched successfully", allBuyers);
  }

  static async getMerchantById(req: Request, res: Response) {
    const requestSchema = Joi.object({
      id: Joi.string().required(),
    });

    const { error, value } = requestSchema.validate(req.params);
    if (error) return response(res, 400, error.details[0].message);

    const merchant = await Merchant.findById(value.id);
    if (!merchant)
      return response(res, 404, "Merchant with given id not found");

    return response(res, 200, "Merchant fetched successfully", merchant);
  }

  static async getMe(req: Request, res: Response) {
    const merchant = await Merchant.findById(req.merchant?._id as string);
    if (!merchant)
      return response(res, 404, "Merchant with given id not found");
    return response(res, 200, "Merchant info fetched successfully", merchant);
  }

  static async getOnlineMerchants(req: Request, res: Response) {
    const onlineMerchants = await Merchant.find({ online: true });

    return response(
      res,
      200,
      "Online merchants fetched successfully",
      onlineMerchants
    );
  }

  static async searchMerchants(req: Request, res: Response) {
    const requestSchema = Joi.object({
      searchTerm: Joi.string().required(),
    });
    const { error, value } = requestSchema.validate(req.query);
    if (error) return response(res, 400, error.details[0].message);

    const { searchTerm } = value;

    const merchant = await Merchant.find({
      $or: [
        { companyName: { $regex: searchTerm, $options: "i" } },
        { username: { $regex: searchTerm, $options: "i" } },
      ],
    });

    if (merchant.length == 0)
      return response(res, 404, "No merchants found", []);

    if (!merchant) return response(res, 400, "Couldn't get merchant");

    return response(res, 200, "Merchants fetched successfully", merchant);
  }

  static async updateMerchant(req: Request, res: Response) {
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
    const existingMerchant = await Merchant.findById(id);
    if (!existingMerchant)
      return response(res, 404, "Merchant with given id not found");

    //check if email has been taken by another user
    const { username, email } = requestBodyValue;
    if (email && email !== existingMerchant.email) {
      const existingEmailMerchant = await Merchant.findOne({ email });
      if (existingEmailMerchant)
        return response(res, 400, "Email already taken");
    }

    // Check if username has been taken by another user
    if (username && username !== existingMerchant.username) {
      const existingUsernameMerchant = await Merchant.findOne({ username });
      if (existingUsernameMerchant) {
        return response(
          res,
          400,
          "Username has already been taken by another merchant"
        );
      }
    }

    //update the user
    const options = { new: true, runValidators: true };
    const updatedMerchant = await Merchant.findByIdAndUpdate(
      id,
      requestBodyValue,
      options
    );

    return response(
      res,
      200,
      "Account details updated successfully",
      updatedMerchant
    );
  }

  static async deleteMerchant(req: Request, res: Response) {
    const requestSchema = Joi.object({
      id: Joi.string().required(),
    });

    const { error, value } = requestSchema.validate(req.params);
    if (error) return response(res, 200, error.details[0].message);

    const deletedMerchant = await Merchant.findByIdAndDelete(value.id);
    if (!deletedMerchant)
      return response(res, 404, "Merchant with given id not found!");

    return response(res, 200, "Merchant deleted successfully");
  }
}

export default MerchantController;
