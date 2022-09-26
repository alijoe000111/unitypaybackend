"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("../models/auth");
const express_1 = __importDefault(require("express"));
const AuthRouter = (0, express_1.default)();
AuthRouter.post("/signup", auth_1.signUp);
AuthRouter.post("/signin", auth_1.signin);
// Not here
AuthRouter.post("/forget", auth_1.forgetPassword);
AuthRouter.post("/send-verification-mail", auth_1.sendVerificationMail);
AuthRouter.get("/change-email", auth_1.changeEmail);
exports.default = AuthRouter;
