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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const User = new mongoose_1.Schema({
    owner: {
        type: mongoose_1.default.Types.ObjectId,
        ref: "Auth",
        unique: true,
        required: true,
    },
    balance: { type: Number, default: 0 },
    pending: { type: Number, default: 0 },
    transactionNum: { type: Number, default: 0 },
    earnings: { type: Number, default: 0 },
    transactions: {
        type: [{ type: mongoose_1.default.Types.ObjectId, ref: "Transaction" }],
        default: [],
    },
    walletAddress: { type: String, default: "", required: false },
    isBlock: { type: Boolean, default: false, required: false }, // if user is block from paying utility
});
exports.default = (0, mongoose_1.model)("User", User);
