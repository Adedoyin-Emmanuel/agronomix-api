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

    /**
     * @params {image}
        We would be expecting the ImageURL from the client,
       the URL of the image uploaded on 
       uploadfly 
     */

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

  static async getAllProducts(req: Request, res: Response) {
    const allProducts = await Product.find();

    return response(res, 200, "Products fetched successfully", allProducts);
  }

  static async getProductById(req: Request, res: Response) {
    const requestSchema = Joi.object({
      id: Joi.string().required(),
    });

    const { error, value } = requestSchema.validate(req.params);
    if (error) return response(res, 400, error. details[0].message);

    const product = await Product.findById(value.id).sort({
      updatedAt: -1,
    });

    if (!product) return response(res, 404, "Product with given id not found");

    return response(res, 200, "Product fetched successfully", product);
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

    if (!product) return response(res, 400, "Could not get produt");

    return response(res, 200, "Products fetched successfully", product);
  }

  static async updateProduct(req: Request, res: Response) {
    const requestSchema = Joi.object({
      name: Joi.string().max(20),
      description: Joi.string().max(500),
      category: Joi.string(),
      price: Joi.number(),
      quantity: Joi.number(),
      tags: Joi.array().items(Joi.string()),
      image: Joi.string(),
    });

    const productIdSchema = Joi.object({
      productId: Joi.string().required(),
    });

    const { error: productIdError, value: productIdValue } =
      productIdSchema.validate(req.params);
    if (productIdError)
      return response(res, 400, productIdError.details[0].message);

    const productId = productIdValue.productId;

    const { error, value } = requestSchema.validate(req.body);
    if (error) return response(res, 400, error.details[0].message);

    const merchantId = req.merchant?._id;

    // Check if the product belongs to the merchant
    const product = await Product.findOne({ _id: productId, merchantId });

    if (!product) {
      return response(res, 404, "Product not found");
    }

    // Update the product
    const updateProduct = await Product.findByIdAndUpdate(productId, value, {
      new: true,
    });

    return response(res, 200, "Product updated successfully", updateProduct);
  }

  static async deleteProduct(req: Request, res: Response) {
    const requestSchema = Joi.object({
      id: Joi.string().required(),
    });

    const { error, value } = requestSchema.validate(req.params);
    if (error) return response(res, 200, error.details[0].message);

    //delete the product from the merchant document
    const deletedProduct = await Product.findByIdAndDelete(value.id);
    const merchantId = req.merchant?._id;
    if (!deletedProduct)
      return response(res, 404, "Product with given id not found!");
    try {
      await Merchant.findByIdAndUpdate(merchantId, {
        $pull: { products: value.id },
      });
      return response(res, 200, "Product deleted successfully");
    } catch (error) {
      return response(res, 400, "An error occured while deleting the product!");
    }
  }
}

export default ProductController;
