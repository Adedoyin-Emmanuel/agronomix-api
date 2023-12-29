import { Request, Response } from "express";
import { response } from "../utils";
import Joi from "joi";
import { Buyer, Product } from "../models";

class CollectionController {
  static async addProduct(req: Request, res: Response) {
    const requestSchema = Joi.object({
      productId: Joi.string().required(),
    });

    const { error, value } = requestSchema.validate(req.body);
    if (error) return response(res, 400, error.details[0].message);

    const buyerId = req.buyer?._id;
    const { productId } = value;

    // check if the product is a valid product
    const product = await Product.findById(productId);

    if (!product) return response(res, 400, "Product does not exist");

    const collection = await Buyer.findByIdAndUpdate(
      buyerId,
      { $push: { collections: productId } },
      { new: true }
    );

    console.log(collection);

    return response(
      res,
      200,
      "Product added to collection successfully",
      collection
    );
  }

  static async deleteProduct(req: Request, res: Response) {
    const requestSchema = Joi.object({
      productId: Joi.string().required(),
    });

    const { error, value } = requestSchema.validate(req.body);
    if (error) return response(res, 400, error.details[0].message);

    const buyerId = req.buyer?._id;
    const { productId } = value;

    // check if the product is a valid product
    const product = await Product.findById(productId);

    if (!product) return response(res, 400, "Product does not exist");

    const collection = await Buyer.findByIdAndUpdate(
      buyerId,
      { $pull: { collections: productId } },
      { new: true }
    );

    console.log(collection);

    return response(res, 200, "Product removed from collection", collection);
  }
}

export default CollectionController;
