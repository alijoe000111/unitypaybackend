"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBlockStatus = exports.updateTransactionStatus = exports.updateBalance = exports.changeEmail = exports.changePassword = exports.getUserInfo = exports.OWNER_EMAIL = void 0;
const user_1 = __importDefault(require("../db-model/user"));
const auth_1 = __importDefault(require("../db-model/auth"));
const transaction_1 = __importDefault(require("../db-model/transaction"));
const bcrypt_1 = __importDefault(require("bcrypt"));
exports.OWNER_EMAIL = "owner@app.com";
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
        let userAuthData = await auth_1.default.findOne({ _id: ownerID });
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
        let userAuthData = await auth_1.default.findOne({ _id: ownerID });
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
const updateBalance = async (req, res, next) => {
    const reqBody = req.body;
    const { emailAddress, amount, ownerID } = reqBody;
    if (!ownerID) {
        res.status(401).json({
            message: "You don't have permission to perform this action.",
        });
        return;
    }
    if (!emailAddress || !amount) {
        res.status(401).json({
            message: "Incomplete information provided. Please provide Email address and Amount.",
        });
        return;
    }
    try {
        let userAuthData = await auth_1.default.findOne({ _id: ownerID });
        if (!userAuthData) {
            throw new Error();
        }
        if (!(userAuthData.emailAddress.toLowerCase() === exports.OWNER_EMAIL.toLowerCase())) {
            res.status(401).json({
                message: "You don't have permission to perform this action.",
            });
            return;
        }
        let userToChangeData = await auth_1.default.findOne({ emailAddress });
        if (!userToChangeData) {
            throw new Error();
        }
        const userInfo = await user_1.default.findOne({
            owner: userToChangeData._id,
        });
        if (!userInfo) {
            throw new Error();
        }
        userInfo.balance = +amount;
        await userInfo.save();
        res.status(201).json({
            message: `Balance for user. ${emailAddress} has been modified successfully.`,
        });
    }
    catch (_) {
        next(new Error("Error occurred while updating balance. Please try again later."));
    }
};
exports.updateBalance = updateBalance;
const updateTransactionStatus = async (req, res, next) => {
    const reqBody = req.body;
    const { status, transactionID, emailAddress, ownerID } = reqBody;
    if (!ownerID) {
        res.status(401).json({
            message: "You don't have permission to perform this action.",
        });
        return;
    }
    if (!emailAddress || !transactionID || !status || !ownerID) {
        res.status(401).json({
            message: "Incomplete information provided. Please provide Email address and Status and TransactionID.",
        });
        return;
    }
    try {
        // For Owner@app.com
        let userAuthData = await auth_1.default.findOne({ _id: ownerID });
        if (!userAuthData) {
            throw new Error();
        }
        if (!(userAuthData.emailAddress === exports.OWNER_EMAIL)) {
            res.status(401).json({
                message: "You don't have permission to perform this action.",
            });
            return;
        }
        // For person we are changing his email
        const userInfo = await auth_1.default.findOne({
            emailAddress,
        });
        if (!userInfo) {
            res.status(200).json({
                message: "No user found with the given email address.",
            });
            return;
        }
        const userID = userInfo._id;
        const transactionToUpdate = await transaction_1.default.findOne({
            owner: userID,
            transactionID,
        });
        if (!transactionToUpdate) {
            res.status(200).json({
                message: "No transaction found with the given info. Please confirm the Email Address and Transaction ID and try again",
            });
            return;
        }
        transactionToUpdate.status = status;
        transactionToUpdate.deliveredOn = `${new Date().getFullYear()} - ${new Date().getMonth()} - ${new Date().getDate()}`;
        await transactionToUpdate.save();
        res.status(201).json({
            message: "Transaction status has been modified successfully",
        });
    }
    catch (_) {
        next(new Error("Error occurred while updating transaction status. Please try again later."));
    }
};
exports.updateTransactionStatus = updateTransactionStatus;
const updateBlockStatus = async (req, res, next) => {
    const reqBody = req.body;
    const { emailAddress, status, ownerID } = reqBody;
    if (!ownerID) {
        res.status(401).json({
            message: "You don't have permission to perform this action.",
        });
        return;
    }
    if (!emailAddress || !status) {
        res.status(400).json({
            message: "Incomplete information provided. Please provide Email address and Block status.",
        });
        return;
    }
    let isBlock;
    switch (status) {
        case "Block":
            isBlock = true;
            break;
        case "Unblock":
            isBlock = false;
            break;
        default:
            return res.status(200).json({
                message: "Block status can only be 1 for Block and 2 for Unblock. Please update your input and try again",
            });
    }
    try {
        // For Owner@app.com
        let userAuthData = await auth_1.default.findOne({ _id: ownerID });
        if (!userAuthData) {
            throw new Error();
        }
        if (!(userAuthData.emailAddress === exports.OWNER_EMAIL)) {
            res.status(401).json({
                message: "You don't have permission to perform this action.",
            });
            return;
        }
        // For person we are updating their block status
        const userInfo = await auth_1.default.findOne({
            emailAddress,
        });
        if (!userInfo) {
            res.status(200).json({
                message: "No user found with the given email address.",
            });
            return;
        }
        const userID = userInfo._id;
        const userModelInfo = await user_1.default.findOne({
            owner: userID,
        });
        if (!userModelInfo) {
            return res.status(200).json({
                message: "No user found with the given email address.",
            });
        }
        userModelInfo.isBlock = isBlock;
        await userModelInfo.save();
        res.status(201).json({
            message: `${emailAddress} block status has been updated to "${isBlock ? "Block" : "Unblock"}".`,
        });
    }
    catch (_) {
        next(new Error("Error occurred while updating block status. Please try again later."));
    }
};
exports.updateBlockStatus = updateBlockStatus;
