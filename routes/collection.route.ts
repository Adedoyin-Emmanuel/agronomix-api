import express from "express";
import { CollectionController } from "../controllers";
import { useAuth, useCheckRole } from "./../middlewares";

const collectionRouter = express.Router();

/**
 * @note Only a buyer should be allowed to create a collection.
 * And should be authenticated
 */

collectionRouter.post(
  "/",
  [useAuth, useCheckRole("buyer")],
  CollectionController.addProduct
);
collectionRouter.delete(
  "/",
  [useAuth, useCheckRole("buyer")],
  CollectionController.deleteProduct
);
