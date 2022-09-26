"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addPayment = void 0;
const user_1 = __importDefault(require("../db-model/user"));
const transaction_1 = __importDefault(require("../db-model/transaction"));
const addPayment = async (req, res, next) => {
    const reqBody = req.body;
    let typeName, type, amount;
    const { ownerID } = reqBody;
    type = reqBody.type;
    typeName = reqBody.typeName;
    amount = Number(reqBody.amount);
    if (!typeName || !type || !amount) {
        res.status(401).json({
            message: "Incomplete data provided, please complete the data and try again",
        });
        return;
    }
    try {
        let userData = await user_1.default.findOne({ owner: ownerID });
        if (!userData)
            userData = new user_1.default({ owner: ownerID });
        if (amount === 0 || amount > userData.balance) {
            res.status(403).json({
                message: "Balance not enough. Please load your account and try again later.",
            });
            return;
        }
        const transaction = await new transaction_1.default({
            type,
            typeName,
            amount,
        }).save();
        if (!transaction) {
            res
                .status(200)
                .json({ message: "Error completing payment. Please try again later" });
            return;
        }
        userData.transactions.push(transaction.id);
        userData.transactionNum += 1;
        userData.balance -= amount;
        userData.pending += amount;
        userData.save();
        const newTransaction = transaction.transactions;
        res.status(201).json({
            message: "Payment successfully sent",
            code: 1,
            transaction: {
                typeName: newTransaction?.typeName,
                type: newTransaction?.type,
                transferDate: newTransaction?.transferDate,
                transferTime: newTransaction?.transferTime,
                transactionID: newTransaction?.transactionID,
                amount: newTransaction?.amount,
                status: newTransaction?.status,
                deliveredOn: newTransaction?.deliveredOn,
            },
        });
    }
    catch (_) {
        next(new Error("Error sending payment, please try again."));
    }
};
exports.addPayment = addPayment;
