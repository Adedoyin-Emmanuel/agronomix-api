"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const redisPort = process.env.REDIS_PORT || 6379;
const redisHost = process.env.HOST || "127.0.0.1";
const redisClient = (0, redis_1.createClient)({
    port: redisPort,
    host: redisHost,
});
exports.default = redisClient;
