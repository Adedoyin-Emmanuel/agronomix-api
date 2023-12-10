import express from "express";
import { HelloController } from "../controllers";

const helloRouter = express.Router();


helloRouter.get("/", HelloController.hello);

export default helloRouter;