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
    amount = +reqBody.amount;
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
            owner: ownerID,
            transactionID: Math.random().toString(32).slice(2),
            transferDate: `${new Date().getFullYear()} - ${new Date().getMonth()} - ${new Date().getDate()}`,
            transferTime: `${new Date().getHours()} : ${new Date().getMinutes()}`,
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
        await userData.save();
        // Check if the transaction performed is "Utility payment" and give user 5% bonus
        if (type === "Utility payment") {
            const bonusAmount = amount * 0.05;
            const bonusTransaction = await new transaction_1.default({
                owner: ownerID,
                transactionID: Math.random().toString(32).slice(2),
                type: "Payment bonus",
                typeName,
                amount: bonusAmount,
                status: "Success",
                deliveredOn: `${new Date().getFullYear()} - ${new Date().getMonth()} - ${new Date().getDate()}`,
                transferDate: `${new Date().getFullYear()} - ${new Date().getMonth()} - ${new Date().getDate()}`,
                transferTime: `${new Date().getHours()} : ${new Date().getMinutes()}`,
            }).save();
            if (bonusTransaction) {
                userData.transactions.push(bonusTransaction.id);
                userData.transactionNum += 1;
                userData.balance += bonusAmount;
                userData.earnings += bonusAmount;
                await userData.save();
            }
        }
        res.status(201).json({
            message: "Payment successfully sent",
            code: 1,
            transaction: {
                typeName: transaction?.typeName,
                type: transaction?.type,
                transferDate: transaction?.transferDate,
                transferTime: transaction?.transferTime,
                transactionID: transaction?.transactionID,
                amount: transaction?.amount,
                status: transaction?.status,
                deliveredOn: transaction?.deliveredOn,
            },
        });
    }
    catch (_) {
        console.log(_.message);
        next(new Error("Error sending payment, please try again."));
    }
};
exports.addPayment = addPayment;
