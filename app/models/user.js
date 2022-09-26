"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserInfo = void 0;
const user_1 = __importDefault(require("../db-model/user"));
const getUserInfo = async (req, res, next) => {
    const tokenOwnerId = req.body.ownerID;
    try {
        const userInfoAndTransactions = await user_1.default.findOne({
            owner: tokenOwnerId,
        })
            .populate("owner", {
            emailAddress: 1,
            fullname: 1,
        })
            .populate("transactions");
        res.status(200).json(userInfoAndTransactions?.toObject());
    }
    catch (_) {
        next(new Error("Error fetching data, please try again later."));
    }
};
exports.getUserInfo = getUserInfo;
