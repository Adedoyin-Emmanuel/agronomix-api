require("dotenv").config();
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import mongoSanitize from "express-mongo-sanitize";
import "express-async-errors";
import morgan from "morgan";
import { useErrorHandler, useNotFound, useRateLimiter } from "./middlewares/";
import { connectToDb } from "./utils";
import http from "http";
import { initSocket } from "./sockets/socket.server";
import { helloRouter } from "./routes";
import logger from "./config/logger";
import redisClient from "./config/redis";
const PORT = process.env.PORT || 2800;
const app = express();
const server = http.createServer(app);
initSocket(server);

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

//middlewares
const allowedOriginPatterns = [/http:\/\/localhost:3000$/];
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(bodyParser.json({ limit: "100mb" }));
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(useRateLimiter);
app.use(helmet()); // set security HTTP headers
app.use(mongoSanitize());

//endpoints

app.use("/api", helloRouter);
const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Agronomimix API",
    version: "1.0.0",
    description: "Agronomimix API Documentation",
    license: {
      name: "Adedoyin Emmanuel",
      url: "",
    },
    contact: {
      name: "",
      url: "",
    },
  },
  servers: [
    {
      url: `http://localhost:${PORT}/api/v1`,
      description: "Development server",
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: [`./routes/*.ts`],
};
const swaggerSpec = swaggerJSDoc(options);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(useNotFound);
app.use(useErrorHandler);

server.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
  logger.info({ message: `...app listening on port http://localhost:${PORT}` });
  redisClient.connect().catch(() => {
    console.log("Redis client not connected");
    process.exit(1);
  });
  //connectToDb();
});
