"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
let io;
const initSocket = (server) => {
    exports.io = io = new socket_io_1.Server(server, {
        cors: {
            origin: (origin, callback) => {
                const allowedOriginPatterns = [
                    /http:\/\/localhost:3000$/,
                ];
                // Check if the origin matches any of the patterns
                if (!origin ||
                    allowedOriginPatterns.some((pattern) => pattern.test(origin))) {
                    callback(null, true);
                }
                else {
                    callback(new Error("Not allowed by CORS"));
                }
            },
            credentials: true,
        },
    });
    io.on("connection", (socket) => {
        console.log(`A user connected`);
        socket.on("disconnect", () => {
            console.log(`A user disconnected`);
        });
    });
};
exports.initSocket = initSocket;
