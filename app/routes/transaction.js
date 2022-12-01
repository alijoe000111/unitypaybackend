"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const transaction_1 = require("../models/transaction");
const TransactionRouter = (0, express_1.default)();
TransactionRouter.post("/add-payment", transaction_1.addPayment);
TransactionRouter.post("/deposit-webhook", transaction_1.depositWebhook);
exports.default = TransactionRouter;
