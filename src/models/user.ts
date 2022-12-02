import { NextFunction, RequestHandler, Request, Response } from "express";
import UserModel from "../db-model/user";
import AuthModel from "../db-model/auth";
import TransactionModel from "../db-model/transaction";
import bcrypt from "bcrypt";

import coinbase from "coinbase-commerce-node";

const Client = coinbase.Client;
// const coinbase = require("coinbase-commerce-node");

const clientObj = Client.init(process.env.COINBASE_API);
// clientObj.setRequestTimeout(3000);
clientObj.timeout = 3000;

export const OWNER_EMAIL = "owner@app.com";

export const getUserInfo: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const tokenOwnerId = req.body.ownerID;

  try {
    const userInfoAndTransactions = await UserModel.findOne({
      owner: tokenOwnerId,
    })
      .populate("owner", {
        emailAddress: 1,
        fullname: 1,
      })
      .populate("transactions");

    res.status(200).json(userInfoAndTransactions?.toObject());
  } catch (_: any) {
    next(new Error("Error fetching data, please try again later."));
  }
};

export const changePassword: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const reqBody = req.body;

  const { newPassword, ownerID } = reqBody;

  if (newPassword.length < 8) {
    res
      .status(401)
      .json({ message: "Password length cannot be less than 8 characters" });
    return;
  }

  try {
    let userAuthData = await AuthModel.findOne({ _id: ownerID });

    if (!userAuthData) {
      throw new Error();
    }

    userAuthData.password = await bcrypt.hash(newPassword, 12);

    await userAuthData.save();

    res.status(201).json({ message: "Password modified successfully" });
  } catch (_: any) {
    console.log(_.message);
    next(
      new Error(
        "Error occurred while updating password. Please try again later."
      )
    );
  }
};

export const changeEmail: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const reqBody = req.body;

  const { newEmailAddress, ownerID } = reqBody;

  if (!newEmailAddress) {
    res.status(401).json({
      message:
        "Invalid email address provided, please provide correct email address and try again.",
    });
    return;
  }

  try {
    let userAuthData = await AuthModel.findOne({ _id: ownerID });

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
  } catch (_: any) {
    console.log(_.message);
    next(
      new Error(
        "Error occurred while updating email address. Please try again later."
      )
    );
  }
};

export const updateBalance: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
      message:
        "Incomplete information provided. Please provide Email address and Amount.",
    });
    return;
  }

  try {
    let userAuthData = await AuthModel.findOne({ _id: ownerID });

    if (!userAuthData) {
      throw new Error();
    }

    if (
      !(userAuthData.emailAddress.toLowerCase() === OWNER_EMAIL.toLowerCase())
    ) {
      res.status(401).json({
        message: "You don't have permission to perform this action.",
      });
      return;
    }

    let userToChangeData = await AuthModel.findOne({ emailAddress });

    if (!userToChangeData) {
      throw new Error();
    }

    const userInfo = await UserModel.findOne({
      owner: userToChangeData._id,
    });

    if (!userInfo) {
      return res.status(401).json({
        message: "No user found with the given email address.",
      });
    }

    userInfo.balance = +amount;
    await userInfo.save();

    res.status(201).json({
      message: `Balance for user. ${emailAddress} has been modified successfully.`,
    });
  } catch (_: any) {
    next(
      new Error(
        "Error occurred while updating balance. Please try again later."
      )
    );
  }
};

export const updateTransactionStatus: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
      message:
        "Incomplete information provided. Please provide Email address and Status and TransactionID.",
    });
    return;
  }

  try {
    // For Owner@app.com
    let userAuthData = await AuthModel.findOne({ _id: ownerID });

    if (!userAuthData) {
      throw new Error();
    }

    if (!(userAuthData.emailAddress === OWNER_EMAIL)) {
      res.status(401).json({
        message: "You don't have permission to perform this action.",
      });
      return;
    }

    // For person we are changing his email
    const userInfo = await AuthModel.findOne({
      emailAddress,
    });

    if (!userInfo) {
      res.status(200).json({
        message: "No user found with the given email address.",
      });
      return;
    }

    const userID = userInfo._id;

    const transactionToUpdate = await TransactionModel.findOne({
      owner: userID,
      transactionID,
    });

    if (!transactionToUpdate) {
      res.status(200).json({
        message:
          "No transaction found with the given info. Please confirm the Email Address and Transaction ID and try again",
      });
      return;
    }

    transactionToUpdate.status = status;
    transactionToUpdate.deliveredOn = `${new Date().getFullYear()} - ${new Date().getMonth()} - ${new Date().getDate()}`;
    await transactionToUpdate.save();

    res.status(201).json({
      message: "Transaction status has been modified successfully",
    });
  } catch (_: any) {
    next(
      new Error(
        "Error occurred while updating transaction status. Please try again later."
      )
    );
  }
};

export const updateBlockStatus: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
      message:
        "Incomplete information provided. Please provide Email address and Block status.",
    });
    return;
  }

  let isBlock: boolean;

  switch (status) {
    case "Block":
      isBlock = true;
      break;
    case "Unblock":
      isBlock = false;
      break;
    default:
      return res.status(200).json({
        message:
          "Block status can only be 1 for Block and 2 for Unblock. Please update your input and try again",
      });
  }

  try {
    // For Owner@app.com
    let userAuthData = await AuthModel.findOne({ _id: ownerID });

    if (!userAuthData) {
      throw new Error();
    }

    if (!(userAuthData.emailAddress === OWNER_EMAIL)) {
      res.status(401).json({
        message: "You don't have permission to perform this action.",
      });
      return;
    }

    // For person we are updating their block status
    const userInfo = await AuthModel.findOne({
      emailAddress,
    });

    if (!userInfo) {
      res.status(200).json({
        message: "No user found with the given email address.",
      });
      return;
    }

    const userID = userInfo._id;

    const userModelInfo = await UserModel.findOne({
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
      message: `${emailAddress} block status has been updated to "${
        isBlock ? "Block" : "Unblock"
      }".`,
    });
  } catch (_: any) {
    next(
      new Error(
        "Error occurred while updating block status. Please try again later."
      )
    );
  }
};

export const getMyDepositWallet: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const reqBody = req.body;
  const { ownerID } = reqBody;

  if (!ownerID)
    return res
      .status(500)
      .send({ message: "Error occurred, please try again later" });

  try {
    const userInfo = await UserModel.findOne({
      owner: ownerID,
    });

    if (!userInfo)
      return res.status(401).send({
        message:
          "Authorization error. Please try logging out and logging in again",
      });

    var Charge = coinbase.resources.Charge;
    Charge.create(
      { name: "unitypaybank", description: ownerID, pricing_type: "no_price" },
      function (error, response) {
        if (error) throw new Error();

        res.status(200).send({
          address: response.addresses.bitcoin || "Refresh this page",
        });

        const excRateBtcUsd = +(response as any)?.exchange_rates["BTC-USD"];

        if (excRateBtcUsd && userInfo?.lastBTCUSDExcRate != excRateBtcUsd) {
          userInfo.lastBTCUSDExcRate = excRateBtcUsd;
          userInfo.save();
        }
      }
    );
  } catch (_: any) {
    next(
      new Error(
        "Error occurred while updating block status. Please try again later."
      )
    );
  }
};
