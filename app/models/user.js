"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeEmail = exports.changePassword = exports.getUserInfo = void 0;
const user_1 = __importDefault(require("../db-model/user"));
const auth_1 = __importDefault(require("../db-model/auth"));
const bcrypt_1 = __importDefault(require("bcrypt"));
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
const changePassword = async (req, res, next) => {
    const reqBody = req.body;
    const { newPassword, ownerID } = reqBody;
    if (newPassword.length < 8) {
        res
            .status(401)
            .json({ message: "Password length cannot be less than 8 characters" });
        return;
    }
    try {
        let userAuthData = await auth_1.default.findOne({ owner: ownerID });
        if (!userAuthData) {
            throw new Error();
        }
        userAuthData.password = await bcrypt_1.default.hash(newPassword, 12);
        await userAuthData.save();
        res.status(201).json({ message: "Password modified successfully" });
    }
    catch (_) {
        console.log(_.message);
        next(new Error("Error occurred while updating password. Please try again later."));
    }
};
exports.changePassword = changePassword;
const changeEmail = async (req, res, next) => {
    const reqBody = req.body;
    const { newEmailAddress, ownerID } = reqBody;
    if (!newEmailAddress) {
        res.status(401).json({
            message: "Invalid email address provided, please provide correct email address and try again.",
        });
        return;
    }
    try {
        let userAuthData = await auth_1.default.findOne({ owner: ownerID });
        if (!userAuthData) {
            throw new Error();
        }
        if (userAuthData.emailAddress === newEmailAddress) {
            res.status(200).json({
                message: "The email address provided is your current email address.",
            });
            return;
        }
        userAuthData.emailAddress = newEmailAddress;
        await userAuthData.save();
        //TODO: send verify new email address
        res.status(201).json({
            message: `Email address successfully modified to ${newEmailAddress}. Check the email address for verification mail`,
        });
    }
    catch (_) {
        console.log(_.message);
        next(new Error("Error occurred while updating email address. Please try again later."));
    }
};
exports.changeEmail = changeEmail;
