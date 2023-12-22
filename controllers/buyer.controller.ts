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
