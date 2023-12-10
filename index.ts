import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import "express-async-errors";
import morgan from "morgan";
import { useErrorHandler, useNotFound, useRateLimiter } from "./middlewares/";
import { connectToDb } from "./utils";
import http from "http";
import { initSocket } from "./sockets/socket.server";
import { helloRouter } from "./routes";
dotenv.config();

const PORT = process.env.PORT || 2800;
const app = express();
const server = http.createServer(app);
initSocket(server);

//middlewares
const allowedOriginPatterns = [/http:\/\/localhost:3000$/];

const corsOptions = {
  origin: (origin: any, callback: any) => {
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
};

app.use(cors(corsOptions));

app.use(cookieParser());
app.use(bodyParser.json({ limit: "100mb" }));
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(useRateLimiter);

//endpoints

app.use("/api", helloRouter);

app.use(useNotFound);
app.use(useErrorHandler);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  //connectToDb();
});
