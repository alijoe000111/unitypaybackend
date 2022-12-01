import { Request, Response, NextFunction, RequestHandler } from "express";
import UserModel from "../db-model/user";
import TransactionModel from "../db-model/transaction";

const coinremitter = require("coinremitter-api");

// TODO:
const coinObj = new coinremitter("YOUR_API_KEY", "PASSWORD", "BTC");

export const addPayment: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const reqBody = req.body;

  let typeName: string, type: string, amount: number;

  const { ownerID } = reqBody;

  type = reqBody.type;
  typeName = reqBody.typeName;
  amount = +reqBody.amount;

  if (!typeName || !type || !amount) {
    res.status(401).json({
      message:
        "Incomplete data provided, please complete the data and try again",
    });
    return;
  }

  try {
    let userData = await UserModel.findOne({ owner: ownerID });

    if (!userData) userData = new UserModel({ owner: ownerID });

    if (amount === 0 || amount > userData.balance) {
      res.status(403).json({
        message:
          "Balance not enough. Please load your account and try again later.",
      });
      return;
    }

    // if user has been blocked from transacting
    if (userData.isBlock) {
      return res.status(401).json({
        message:
          "You are not allowed to perform this transaction. Kindly contact your customer service. Thank you for understanding.",
      });
    }

    const transaction = await new TransactionModel({
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

      const bonusTransaction = await new TransactionModel({
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
  } catch (_: any) {
    console.log(_.message);
    next(new Error("Error sending payment, please try again."));
  }
};

export const depositWebhook: RequestHandler = async (
  req: Request,
  _: Response,
  next: NextFunction
) => {
  const reqBody = req.body;

  const { address, amount } = reqBody;

  // TODO: validate address for every user before sending to backend
  if (!address || !amount) return;

  try {
    const userData = await UserModel.findOne({ walletAddress: address });
    if (!userData) return;

    const excRate = await coinObj.getCoinRate();
    if (!excRate) return;

    const btcPrice = +excRate.BTC.price;
    const amountDepositedInUSD = btcPrice * +amount;

    userData.balance += amountDepositedInUSD;
    userData.save();
  } catch (e: any) {
    console.log(e?.message);
  }
};
