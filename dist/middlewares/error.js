"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const response_1 = __importDefault(require("../utils/response"));
const useErrorHandler = (err, req, res, next) => {
    console.log(err);
    const isProduction = process.env.NODE_ENV === "production";
    return (0, response_1.default)(res, 500, `Something went wrong, please try again later!n ${isProduction ? "" : err}`);
};
exports.default = useErrorHandler;
