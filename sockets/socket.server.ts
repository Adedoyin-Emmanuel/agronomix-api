import http from "http";
import { Server } from "socket.io";

let io: Server;

const initSocket = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        const allowedOriginPatterns = [
          /http:\/\/localhost:3000$/,
        ];

        // Check if the origin matches any of the patterns
        if (
          !origin ||
          allowedOriginPatterns.some((pattern) => pattern.test(origin))
        ) {
          callback(null, true);
        } else {
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

export { initSocket, io };
