"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./../types/types");
const utils_1 = require("../utils");
const useCheckRole = (role) => {
    return (req, res, next) => {
        const isBuyer = req.buyer;
        const isMerchant = req.merchant;
        if (isBuyer && role === "buyer") {
            next();
        }
        else if (isMerchant && role === "merchant") {
            next();
        }
        else {
            return (0, utils_1.response)(res, 403, "Access denied. Insufficient permissions.");
        }
    };
};
exports.default = useCheckRole;
