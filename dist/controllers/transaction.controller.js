"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const crypto = __importStar(require("crypto"));
const joi_1 = __importDefault(require("joi"));
const utils_2 = require("../utils");
class TransactionController {
    static initiate(req, res) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const requestSchema = joi_1.default.object({
                email: joi_1.default.string().email().required(),
                amount: joi_1.default.number().required().min(0),
                initiateType: joi_1.default.string().default("inline"),
                currency: joi_1.default.string().required().valid("NGN", "USD"),
                customerName: joi_1.default.string().required(),
                callbackUrl: joi_1.default.string().required(),
            });
            const { error, value } = requestSchema.validate(req.body);
            if (error)
                return (0, utils_1.response)(res, 400, error.details[0].message);
            const { email, amount, initiateType, currency, customerName, callbackUrl } = value;
            const dataToSend = {
                email,
                amount,
                initiate_type: initiateType,
                currency,
                customer_name: customerName,
                callback_url: callbackUrl,
            };
            const squadResponse = yield utils_2.Axios.post("/transaction/initiate", dataToSend);
            if (squadResponse.status !== 200)
                return (0, utils_1.response)(res, 400, `An error occured! ${(_a = squadResponse.data) === null || _a === void 0 ? void 0 : _a.message}`);
            return (0, utils_1.response)(res, 200, "Transaction initiated successfully", (_b = squadResponse.data) === null || _b === void 0 ? void 0 : _b.data);
        });
    }
    static verify(req, res) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const requestSchema = joi_1.default.object({
                transactionRef: joi_1.default.string().required(),
            });
            const { error, value } = requestSchema.validate(req.params);
            if (error)
                return (0, utils_1.response)(res, 400, error.details[0].message);
            const squadResponse = yield utils_2.Axios.get(`/verify/${value.transactionRef}`);
            if (squadResponse.status !== 200)
                return (0, utils_1.response)(res, 400, `An error occured! ${(_a = squadResponse.data) === null || _a === void 0 ? void 0 : _a.message}`);
            return (0, utils_1.response)(res, 200, "Transaction verified successfully", (_b = squadResponse.data) === null || _b === void 0 ? void 0 : _b.data);
        });
    }
    static refund(req, res) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const requestSchema = joi_1.default.object({
                refundType: joi_1.default.string().required().valid("full", "partial"),
                transactionRef: joi_1.default.string().required(),
                refundAmount: joi_1.default.number().required(),
                reasonForRefund: joi_1.default.string().required(),
                gatewayTransactionRef: joi_1.default.string().required(),
            });
            const { error, value } = requestSchema.validate(req.body);
            if (error)
                return (0, utils_1.response)(res, 400, error.details[0].message);
            const { refundType, transactionRef, refundAmount, reasonForRefund, gatewayTransactionRef, } = value;
            const dataToSend = {
                gateway_transaction_ref: gatewayTransactionRef,
                transaction_ref: transactionRef,
                refund_type: refundType,
                reason_for_refund: reasonForRefund,
                refund_amount: refundAmount,
            };
            const squadResponse = yield utils_2.Axios.post("/transaction/refund", dataToSend);
            if (squadResponse.status !== 200)
                return (0, utils_1.response)(res, 400, `An error occured! ${(_a = squadResponse.data) === null || _a === void 0 ? void 0 : _a.message}`);
            return (0, utils_1.response)(res, 200, "Funds reimbursed successfully", (_b = squadResponse.data) === null || _b === void 0 ? void 0 : _b.data);
        });
    }
    static receiveWebhook(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            /**
             * TODO Implement Transaction Reference Checker, Implement Transaction History
             */
            const SQUAD_SECRET = process.env.SQUAD_PRIVATE_KEY;
            const hash = crypto
                .createHmac("sha512", SQUAD_SECRET)
                .update(JSON.stringify(req.body))
                .digest("hex")
                .toUpperCase();
            if (hash == req.headers["x-squad-encrypted-body"]) {
                console.log("Webhook received successfully");
                console.log(req.body);
                const squadHash = req.headers["x-squad-encrypted-body"];
                return (0, utils_1.response)(res, 200, "Webhook received successfully");
            }
            else {
                return (0, utils_1.response)(res, 400, "Invalid webhook response");
            }
        });
    }
}
exports.default = TransactionController;
