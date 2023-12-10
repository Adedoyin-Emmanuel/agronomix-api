import { Request, Response } from "express";
import response from "../utils/response";

const useErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: any
) => {
  console.log(err);
  const isProduction = process.env.NODE_ENV === "production";
  return response(
    res,
    500,
    `Something went wrong, please try again later!n ${isProduction ? "" : err}`
  );
};

export default useErrorHandler;
