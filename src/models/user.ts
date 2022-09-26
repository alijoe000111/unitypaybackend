import { NextFunction, RequestHandler, Request, Response } from "express";
import UserModel from "../db-model/user";

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
