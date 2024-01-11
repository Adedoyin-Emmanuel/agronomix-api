"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const enumerateErrorFormat = winston_1.default.format((info) => {
    if (info instanceof Error) {
        Object.assign(info, { message: info.stack });
    }
    return info;
});
const logger = winston_1.default.createLogger({
    level: process.env.NODE_ENV === "development" ? "debug" : "info",
    format: winston_1.default.format.combine(enumerateErrorFormat(), process.env.NODE_ENV === "development"
        ? winston_1.default.format.colorize()
        : winston_1.default.format.uncolorize(), winston_1.default.format.splat(), winston_1.default.format.printf(({ level, message }) => `${level}: ${message}`)),
    transports: [
        new winston_1.default.transports.Console({
            stderrLevels: ["error"],
        }),
        new winston_1.default.transports.File({ filename: "error.log", level: "error" }),
        new winston_1.default.transports.File({ filename: "combined.log" }),
    ],
});
exports.default = logger;
