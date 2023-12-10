import { Request, Response } from "express";
import { response } from "../utils";

class HelloController{
    static async hello(req: Request, res: Response) {
        return response(res, 200, "Hello World, Welcome to my API");
     }
}

export default HelloController;