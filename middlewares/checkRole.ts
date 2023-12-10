import { NextFunction, Request, Response } from "express";
import { response } from "../utils";

declare global {
  namespace Express {
    interface Request {
      user?: any;
      hospital?: any;
    }
  }
}

const useCheckRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const isUser2 = req.hospital;
    const isUser = req.user;

    if (isUser2 && role === "user2") {
      next();
    } else if (isUser && role === "user") {
      next();
    } else {
      return response(res, 403, "Access denied. Insufficient permissions.");
    }
  };
};

export default useCheckRole;
