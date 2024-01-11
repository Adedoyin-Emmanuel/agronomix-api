"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
require("express-async-errors");
const morgan_1 = __importDefault(require("morgan"));
const middlewares_1 = require("./middlewares/");
const swagger_docs_1 = require("./docs/swagger.docs");
const utils_1 = require("./utils");
const http_1 = __importDefault(require("http"));
const socket_server_1 = require("./sockets/socket.server");
const routes_1 = require("./routes");
const utils_2 = require("./utils");
const PORT = process.env.PORT || 2800;
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
(0, socket_server_1.initSocket)(server);
const corsOptions = {
    origin: (origin, callback) => {
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
};
//middlewares
const allowedOriginPatterns = [/http:\/\/localhost:3000$/];
app.use((0, cors_1.default)(corsOptions));
app.use((0, cookie_parser_1.default)());
app.use(body_parser_1.default.json({ limit: "100mb" }));
app.use((0, morgan_1.default)("dev"));
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(middlewares_1.useRateLimiter);
app.use((0, helmet_1.default)());
app.use((0, express_mongo_sanitize_1.default)());
//endpoints
app.use("/api", routes_1.helloRouter);
app.use("/api/auth", routes_1.authRouter);
app.use("/api/buyer", routes_1.buyerRouter);
app.use("/api/buyer/collection", routes_1.collectionRouter);
app.use("/api/merchant", routes_1.merchantRouter);
app.use("/api/product", routes_1.productRouter);
app.use("/api/transaction", routes_1.transactionRouter);
const swaggerSpec = (0, swagger_jsdoc_1.default)(swagger_docs_1.swaggerOptions);
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
app.use(middlewares_1.useNotFound);
app.use(middlewares_1.useErrorHandler);
server.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
    utils_2.logger.info({ message: `...app listening on port http://localhost:${PORT}` });
    (0, utils_1.connectToDb)();
});
exports.default = server;
