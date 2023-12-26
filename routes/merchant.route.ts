import express from "express";
import { MerchantController } from "../controllers";
import { useAuth, useCheckRole, useCreateUserLimiter } from "../middlewares";

const merchantRouter = express.Router();

/**
 * @swagger
 * /api/merchant/:
 *   post:
 *     summary: creates a merchant's account
 *     description: This creates a merchant's account
 *     tags:
 *       - MERCHANT
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: name
 *         in: body
 *         required: true
 *       - name: username
 *         in: body
 *         required: true
 *       - name: email
 *         in: body
 *         required: true
 *       - name: password
 *         in: body
 *         required: true
 *     responses:
 *        201:
 *          description: merchant created succesfully.
 *        400:
 *          An error occured while creating a merchant's account
 */
merchantRouter.post(
  "/",
  [useCreateUserLimiter],
  MerchantController.createMerchant
);

/**
 * @swagger
 * /api/merchant/search:
 *   get:
 *     summary: search for a merchant's account
 *     description: This searches for a merchant's account
 *     tags:
 *       - MERCHANT
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: searchTerm
 *         in: query
 *         required: true
 *     responses:
 *        201:
 *          description: merchant(s) retrieved succesfully.
 *        400:
 *          An error occured.
 */
merchantRouter.get("/search", MerchantController.searchMerchants);

/**
 * @swagger
 * /api/merchant/online:
 *   get:
 *     summary: get online merchants
 *     description: This gets online merchants
 *     tags:
 *       - MERCHANT
 *     produces:
 *       - application/json
 *     responses:
 *        201:
 *          description: active merchants retrieved succesfully.
 *        400:
 *          An error occured.
 */
merchantRouter.get("/online", MerchantController.getOnlineMerchants);

/**
 * @swagger
 * /api/merchant/{id}:
 *   put:
 *     summary: update a merchant's account
 *     description: This updates a merchant's account
 *     tags:
 *       - MERCHANT
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *       - name: name
 *         in: body
 *         required: true
 *       - name: username
 *         in: body
 *         required: true
 *       - name: email
 *         in: body
 *         required: true
 *       - name: password
 *         in: body
 *         required: true
 *     responses:
 *        201:
 *          description: merchant updated succesfully.
 *        400:
 *          An error occured while updating a merchant's account
 */
merchantRouter.put(
  "/:id",
  [useAuth, useCheckRole("merchant")],
  MerchantController.updateMerchant
);

/**
 * @swagger
 * /api/merchant/me:
 *   get:
 *     summary: get my account details
 *     description: This gets my account details
 *     tags:
 *       - MERCHANT
 *     produces:
 *       - application/json
 *     responses:
 *        201:
 *          description: account details retrieved succesfully.
 *        400:
 *          An error occured.
 */
merchantRouter.get("/me", [useAuth], MerchantController.getMe);

/**
 * @swagger
 * /api/merchant/:
 *   get:
 *     summary: get all merchants
 *     description: This gets all merchants
 *     tags:
 *       - MERCHANT
 *     produces:
 *       - application/json
 *     responses:
 *        201:
 *          description: merchants retrieved succesfully.
 *        400:
 *          An error occured.
 */
merchantRouter.get("/", [useAuth], MerchantController.getAllMerchants);

/**
 * @swagger
 * /api/merchant/{id}:
 *   get:
 *     summary: get a merchant's account
 *     description: This gets a merchant's account
 *     tags:
 *       - MERCHANT
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *     responses:
 *        201:
 *          description: merchant retrieved succesfully.
 *        400:
 *          An error occured.
 */
merchantRouter.get("/:id", [useAuth], MerchantController.getMerchantById);

/**
 * @swagger
 * /api/merchant/{id}:
 *   delete:
 *     summary: delete a merchant's account
 *     description: This deletes a merchant's account
 *     tags:
 *       - MERCHANT
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *     responses:
 *        201:
 *          description: merchant deleted succesfully.
 *        400:
 *          An error occured.
 */
merchantRouter.delete(
  "/:id",
  [useAuth, useCheckRole("merchant")],
  MerchantController.deleteMerchant
);

export default merchantRouter;
