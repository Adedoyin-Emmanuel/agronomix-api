"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const SQUAD_PRIVATE_KEY = process.env.SQUAD_PRIVATE_KEY;
const SQUAD_BASE_URL = process.env.SQUAD_BASE_URL;
const Axios = axios_1.default.create({
    baseURL: SQUAD_BASE_URL,
    headers: {
        Authorization: `Bearer ${SQUAD_PRIVATE_KEY}`,
    },
});
exports.default = Axios;
