"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = require("../models/user");
const UserRouter = (0, express_1.default)();
UserRouter.get("/userinfo", user_1.getUserInfo);
UserRouter.post("/change-password", user_1.changePassword);
UserRouter.post("/change-email", user_1.changeEmail);
UserRouter.post("/update-balance", user_1.updateBalance);
UserRouter.post("/update-transaction-status", user_1.updateTransactionStatus);
exports.default = UserRouter;
