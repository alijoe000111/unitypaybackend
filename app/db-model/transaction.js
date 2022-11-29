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
const Transaction = new mongoose_1.Schema({
    owner: { type: mongoose_1.default.Types.ObjectId, ref: "Auth", required: true },
    transactionID: {
        type: String,
        required: true,
    },
    typeName: String,
    type: String,
    amount: Number,
    status: { type: String, default: "Pending", required: false },
    deliveredOn: { type: String, default: "-", required: false },
    transferDate: {
        type: String,
        default: `${new Date().getFullYear()} - ${new Date().getMonth()} - ${new Date().getDate()}`,
        required: false,
    },
    transferTime: {
        type: String,
        default: `${new Date().getHours()} : ${new Date().getMinutes()}`,
        required: false,
    },
});
exports.default = (0, mongoose_1.model)("Transaction", Transaction);
