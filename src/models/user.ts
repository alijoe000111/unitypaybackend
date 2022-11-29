import { NextFunction, RequestHandler, Request, Response } from "express";
import UserModel from "../db-model/user";
import AuthModel from "../db-model/auth";
import bcrypt from "bcrypt";

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
    let userAuthData = await AuthModel.findOne({ owner: ownerID });

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
    let userAuthData = await AuthModel.findOne({ owner: ownerID });

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
