import { NextFunction } from "express";
import jwt from "jsonwebtoken";
import { response } from "../utils";

const useAuth = (req: any, res: any, next: NextFunction) => {
  const tokenFromCookie = req.cookies.accessToken;
  const refreshTokenCookie = req.cookies.refreshToken;

  //just in case of logout
  if (!refreshTokenCookie) {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    return response(res, 401, "Access denied, no refresh token");
  }

  if (!tokenFromCookie) {
    return response(
      res,
      401,
      "You're not authorized to perform this action, no access token!"
    );
  }

  try {
    // Extract the bearer token from the header
    const JWT_SECRET: any = process.env.JWT_PRIVATE_KEY;

    if (!JWT_SECRET) {
      throw new Error("JWT private key is missing.");
    }

    let decodeCookie: any = jwt.verify(tokenFromCookie, JWT_SECRET);
    if (decodeCookie && decodeCookie._id) {
      const buyerRole = "buyer",
        merchantRole = "merchant";
      if (decodeCookie.role === buyerRole) {
        req.user = decodeCookie;
        res.user = decodeCookie;
        req.userType = "buyer";
        next();
      } else if (decodeCookie.role === merchantRole) {
        req.hospital = decodeCookie;
        res.hospital = decodeCookie;
        req.userType = "merchant";

        next();
      } else {
        console.log("invalid auth token!");
        return response(res, 401, "Invalid auth token");
      }
    } else {
      return response(res, 401, "Invalid auth token.");
    }
  } catch (error) {
    console.error(error);
    return response(
      res,
      401,
      `You're not authorized to perform this action! ${error}`
    );
  }
};

export default useAuth;
