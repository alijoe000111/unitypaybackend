import { Request, Response, NextFunction, RequestHandler } from "express";
import UserModel from "../db-model/user";
import TransactionModel from "../db-model/transaction";

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
  amount = Number(reqBody.amount);

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

    const transaction = await new TransactionModel({
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
  } catch (_: any) {
    next(new Error("Error sending payment, please try again."));
  }
};
