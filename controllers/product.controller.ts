import { Product } from "../models/product.model";
import Joi from "joi";
import { Request, Response } from "express";
import { response } from "./../utils";

class Products {

        static async createProduct(req: Request, res: Response) {
            const createProductSchema = Joi.object({
                name: Joi.string().required().max(20),
                description: Joi.string().required().max(500),
                category: Joi.string().required(),
                price: Joi.number().required(),
                quantity: Joi.number().required(),
            })

            const {error, value} = createProductSchema.validate(req.body);
            if (error) response(res, 400, `Error: ${error}`);

            const {name, description, category, price, quantity} = value;

            try {
                const product = await Product.findOne({ name });
                if (product) {
                    const filter = name;
                    const update = {quantity}
                    const product = await Product.findOneAndUpdate(filter, update);
                    return response(res, 200, `updated quantity successfully`, product);
                };
            } catch (error) {
                console.error(error);
                return response(res, 400, `Error: ${error}`)
            }

            const image = `https://api.dicebear.com/7.x/micah/svg?seed=${name}`
            const product = new Product({
                name,
                description,
                category,
                price,
                quantity,
                image
            });

            product.save()
            return response(res, 200, "product created successfully", product);
        }


    static async searchProduct(req: Request, res: Response) {

    }


}