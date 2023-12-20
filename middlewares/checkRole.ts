import { NextFunction, Request, Response } from "express";
import "./../types/types";
import { response } from "../utils";

interface UseCheckRoleOptions {
  req: Request;
  res: Response;
  next: NextFunction;
  role: "buyer" | "merchant";
}

const useCheckRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const isBuyer = req.buyer;
    const isMerchant = req.merchant;

    if (isBuyer && role === "buyer") {
      next();
    } else if (isMerchant && role === "merchant") {
      next();
    } else {
      return response(res, 403, "Access denied. Insufficient permissions.");
    }
  };
};

export default useCheckRole;
