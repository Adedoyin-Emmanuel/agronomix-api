import express from "express";
import { BuyerController } from "../controllers";
import { useAuth, useCheckRole, useCreateUserLimiter } from "../middlewares";

const buyerRouter = express.Router();

/**
 creates a buyer
 * @swagger
 * /api/buyer/:
 *   post:
 *     summary: creates a buyer's account
 *     description: This creates a buyer's account
 *     tags:
 *       - BUYER
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
 *          description: buyer cretaed succesfully.
 *        400:
 *          An error occured while creating a buyer's account
 */
buyerRouter.post("/", [useCreateUserLimiter], BuyerController.createBuyer);

/**
 search a buyer
 * @swagger
 * /api/buyer/search:
 *   get:
 *     summary: search for a buyer's account
 *     description: This searches for a buyer's account
 *     tags:
 *       - BUYER
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: searchTerm
 *         in: query
 *         required: true
 *     responses:
 *        200:
 *          description: buyer(s) retrieved succesfully.
 *        400:
 *          An error occured.
 */
buyerRouter.get("/search", BuyerController.searchBuyer);

/**
 retrieves buyers that are online
 * @swagger
 * /api/buyer/online:
 *   get:
 *     summary: retrieves buyers that are online
 *     description: This retrieves the buyers that are online
 *     tags:
 *       - BUYER
 *     produces:
 *       - application/json
 *     responses:
 *        200:
 *          description: active  buyers retrieved succesfully.
 *        400:
 *          An error occured.
 */
buyerRouter.get("/online", BuyerController.getOnlineBuyers);

/**
 update a buyer's details
 * @swagger
 * /api/buyer/{id}:
 *   put:
 *     summary: update a buyer's account
 *     description: This updates a buyer's account
 *     tags:
 *       - BUYER
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *       - name: name
 *         in: body
 *         required: false
 *       - name: username
 *         in: body
 *         required: false
 *       - name: email
 *         in: body
 *         required: false
 *       - name: location
 *         in: body
 *         required: false
 *       - name: bio
 *         in: body
 *         required: false
 *     responses:
 *        200:
 *          description: buyer updated succesfully.
 *        400:
 *          An error occured.
 */
buyerRouter.put(
  "/:id",
  [useAuth, useCheckRole("buyer")],
  BuyerController.updateBuyer
);

/**
 retrieve a buyer's details
 * @swagger
 * /api/buyer/me:
 *   get:
 *     summary: retrieve a buyer's account
 *     description: This retrives a buyer's account
 *     tags:
 *       - BUYER
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *     responses:
 *        200:
 *          description: buyer info retrieved  succesfully.
 *        400:
 *          An error occured.
 */
buyerRouter.get("/me", [useAuth], BuyerController.getMe);

/**
 retrieve all buyers
 * @swagger
 * /api/buyer/:
 *   get:
 *     summary: retrieve all buyers
 *     description: This retrives all buyers
 *     tags:
 *       - BUYER
 *     produces:
 *       - application/json
 *     responses:
 *        200:
 *          description: buyers retrieved  succesfully.
 *        400:
 *          An error occured.
 */
buyerRouter.get("/", [useAuth], BuyerController.getAllBuyers);

/**
 retrieve a buyer's details
 * @swagger
 * /api/buyer/{id}:
 *   get:
 *     summary: retrieve a buyer's account
 *     description: This retrives a buyer's account
 *     tags:
 *       - BUYER
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *     responses:
 *        200:
 *          description: buyer info retrieved succesfully.
 *        400:
 *          An error occured.
 */
buyerRouter.get("/:id", [useAuth], BuyerController.getBuyerById);

/**
 delete a buyer's account
 * @swagger
 * /api/buyer/{id}:
 *   delete:
 *     summary: delete a buyer's account
 *     description: This deletes a buyer's account
 *     tags:
 *       - BUYER
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *     responses:
 *        200:
 *          description: buyer deleted succesfully.
 *        400:
 *          An error occured.
 */
buyerRouter.delete(
  "/:id",
  [useAuth, useCheckRole("buyer")],
  BuyerController.deleteBuyer
);

export default buyerRouter;
