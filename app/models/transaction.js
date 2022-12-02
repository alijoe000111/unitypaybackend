"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.depositWebhook = exports.addPayment = void 0;
const user_1 = __importDefault(require("../db-model/user"));
const transaction_1 = __importDefault(require("../db-model/transaction"));
const coinbase_commerce_node_1 = __importDefault(require("coinbase-commerce-node"));
const Client = coinbase_commerce_node_1.default.Client;
// const coinbase = require("coinbase-commerce-node");
const clientObj = Client.init(process.env.COINBASE_API);
// clientObj.setRequestTimeout(3000);
clientObj.timeout = 3000;
const Webhook = coinbase_commerce_node_1.default.Webhook;
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
        // if user has been blocked from transacting
        if (userData.isBlock) {
            return res.status(401).json({
                message: "You are not allowed to perform this transaction. Kindly contact your customer service. Thank you for understanding.",
            });
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
const depositWebhook = async (req, res, next) => {
    try {
        const event = Webhook.verifyEventBody(req.rawBody, req.headers["x-cc-webhook-signature"], process.env.COINBASE_WEBHOOK_SECRET);
        if (event.type != "charge:confirmed")
            return res.status(200).send();
        const ownerID = event.data?.description;
        if (!ownerID)
            return res.status(200).send();
        let userData = await user_1.default.findOne({ owner: ownerID });
        if (!userData)
            return res.status(200).send();
        console.log(event);
        // TODO: get amount paid
        res.status(200).send();
    }
    catch (e) {
        console.log(e.message || e);
    }
};
exports.depositWebhook = depositWebhook;
