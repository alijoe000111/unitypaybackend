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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("./routes/auth"));
const mongoose_1 = __importDefault(require("mongoose"));
const user_1 = __importDefault(require("./routes/user"));
const token_1 = __importDefault(require("./db-model/token"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const transaction_1 = __importDefault(require("./routes/transaction"));
const app = (0, express_1.default)();
app.use((req, res, next) => {
    const allowedOrigin = ["http://localhost:3000, https://orbitpay.netlify.app"];
    res.setHeader("Access-Control-Allow-Origin", allowedOrigin.includes(req.headers.origin || "")
        ? req.headers.origin || ""
        : "");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
        res.status(200).send();
        return;
    }
    next();
});
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
const ValidateToken = async (req, res, next) => {
    let token = req.headers.authorization;
    if (!token || !token.startsWith("Bearer ") || token.length < 10) {
        res.status(401).json({
            message: "Invalid token provided, please log out and login again.",
        });
        return;
    }
    token = token.replace("Bearer ", "");
    try {
        const userToken = await token_1.default.findOne({ token }).exec();
        if (!userToken) {
            res.status(401).json({
                message: "Invalid token provided, please log out and login again.",
            });
            return;
        }
        req.body.decodedToken = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.body.ownerID = userToken.owner;
        next();
    }
    catch (_) {
        next(new Error("Error Authorizing user, please try again later"));
    }
};
app.use("/auth", auth_1.default);
app.use("/user", ValidateToken, user_1.default);
app.use("/transaction", ValidateToken, transaction_1.default);
const errorHandler = (err, _, res, _1) => {
    res.status(500).json({
        message: err.message || "Error processing your request, please try later.",
    });
};
app.use(errorHandler);
const processEnv = process.env;
const PORT = processEnv.PORT || 33000;
app.listen(PORT, async () => {
    console.log(`Listening on ${PORT}`);
    const mongoConnect = await mongoose_1.default.connect(processEnv.MONGODB_URI);
    if (!mongoConnect) {
        console.log("ERROR CONNECTING TO MONGODB");
    }
    console.log("connected to Mongodb");
});
