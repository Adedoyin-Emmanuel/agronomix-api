import { Product, Merchant } from "../models";
import Joi from "joi";
import { Request, Response } from "express";
import { response } from "./../utils";

class ProductController {
  static async createProduct(req: Request, res: Response) {
    const requestSchema = Joi.object({
      name: Joi.string().required().max(20),
      description: Joi.string().required().max(500),
      category: Joi.string().required(),
      price: Joi.number().required(),
      quantity: Joi.number().required(),
      tags: Joi.array().items(Joi.string()).default([]),
      image: Joi.string().required(),
    });

    const { error, value } = requestSchema.validate(req.body);
    if (error) response(res, 400, error.details[0].message);

    const merchantId = req.merchant?._id;
    value.merchantId = merchantId;

    console.log(value.merchantId);

    const newProduct = await Product.create(value);

    await Merchant.findByIdAndUpdate(
      merchantId,
      { $push: { products: newProduct._id } },
      { new: true }
    );

    return response(res, 200, "Product created successfully");
  }

  static async searchProduct(req: Request, res: Response) {
    const requestSchema = Joi.object({
      searchTerm: Joi.string().required(),
    });
    const { error, value } = requestSchema.validate(req.query);
    if (error) return response(res, 400, error.details[0].message);

    const { searchTerm } = value;

    const product = await Product.find({
      $or: [
        { name: { $regex: searchTerm, $options: "i" } },
        { tags: { $regex: searchTerm, $options: "i" } },
      ],
    });

    if (product.length == 0) return response(res, 404, "No products found", []);

    if (!product) return response(res, 400, "Couldn't get produt");

    return response(res, 200, "Products fetched successfully", product);
  }
}

export default ProductController;
