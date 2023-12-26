import express from "express";
import { ProductController } from "../controllers";
import { useAuth, useCheckRole } from "./../middlewares";

const productRouter = express.Router();

/**
 * @swagger
 * /api/product/:
 *   post:
 *     summary: creates a product
 *     description: This creates a product
 *     tags:
 *       - PRODUCT
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: name
 *         in: body
 *         required: true
 *       - name: price
 *         in: body
 *         required: true
 *       - name: description
 *         in: body
 *         required: true
 *       - name: tags
 *         in: body
 *         required: true
 *       - name: quantity
 *         in: body
 *         required: true
 *       - name: category
 *         in: body
 *         required: true
 *       - name: image
 *         in: body
 *         required: true
 *     responses:
 *        201:
 *          description: product created succesfully.
 *        400:
 *          An error occured while creating a product
 */

productRouter.post(
  "/",
  [useAuth, useCheckRole("merchant")],
  ProductController.createProduct
);

// productRouter.get("/category/:category", ProductController.getProductByCategory);
/**
 * @swagger
 * /api/product/search:
 *   post:
 *     summary: search for a product
 *     description: This searches for a product
 *     tags:
 *       - PRODUCT
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: searchTerm
 *         in: body
 *         required: true
 *     responses:
 *        200:
 *          description: product(s) retrieved succesfully
 *        400:
 *          An error occured while creating a product
 */
productRouter.get("/search", ProductController.searchProduct);

/**
 * @swagger
 * /api/product/{id}:
 *   get:
 *     summary: get a product by id
 *     description: This gets a product by id
 *     tags:
 *       - PRODUCT
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *     responses:
 *        200:
 *          description: product retrieved succesfully
 *        400:
 *          An error occured while creating a product
 */
productRouter.get("/:id", ProductController.getProductById);

/**
 * @swagger
 * /api/product/:
 *   get:
 *     summary: get all products
 *     description: This gets all products
 *     tags:
 *       - PRODUCT
 *     produces:
 *       - application/json
 *     responses:
 *        200:
 *          description: products retrieved succesfully
 *        400:
 *          An error occured while creating a product
 */
productRouter.get("/", ProductController.getAllProducts);

/**
 * @swagger
 * /api/product/:
 *   put:
 *     summary: update a product
 *     description: This updates a product
 *     tags:
 *       - PRODUCT
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: name
 *         in: body
 *         required: true
 *       - name: price
 *         in: body
 *         required: true
 *       - name: description
 *         in: body
 *         required: true
 *       - name: tags
 *         in: body
 *         required: true
 *       - name: quantity
 *         in: body
 *         required: true
 *       - name: category
 *         in: body
 *         required: true
 *       - name: image
 *         in: body
 *         required: true
 *     responses:
 *        201:
 *          description: product updated succesfully.
 *        400:
 *          An error occured while updating a product
 */
productRouter.put(
  "/",
  [useAuth, useCheckRole("merchant")],
  ProductController.updateProduct
);

/**
 * Todo
 * Add Filter product endpoint, basically sort products
 */

/**
 delete a merchant's account
 * @swagger
 * /api/product/{id}:
 *   delete:
 *     summary: delete a merchant's account
 *     description: This deletes a merchant's account
 *     tags:
 *       - PRODUCT
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *     responses:
 *        200:
 *          description: merchant deleted succesfully.
 *        400:
 *          An error occured.
 */
productRouter.delete(
  "/:id",
  [useAuth, useCheckRole("merchant")],
  ProductController.deleteProduct
);

export default productRouter;
