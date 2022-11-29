import { RequestHandler, Request, Response, NextFunction } from "express";
import AuthModel from "../db-model/auth";
import UserModel from "../db-model/user";
import TokenModel from "../db-model/token";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const signUp: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const reqBody = req.body;

  const { emailAddress }: { emailAddress: string } = reqBody;
  const { fullname }: { fullname: string } = reqBody;
  let { password }: { password: string } = reqBody;

  if (!emailAddress || !fullname || !password) {
    res.status(401).json({
      message:
        "Incomplete credentials provided, couldn't complete request. Verify your credentials and retry",
    });
  }

  if (password.length < 8) {
    res
      .status(401)
      .json({ message: "Password length cannot be less than 8 characters" });
    return;
  }

  password = await bcrypt.hash(password, 12);

  try {
    const result = await new AuthModel({
      emailAddress,
      fullname,
      password,
    }).save();

    if (!result) {
      next(new Error("Error creating Account"));
      return;
    }

    new UserModel({ owner: result._id }).save();

    res.status(201).json({
      emailAddress,
      fullname,
      message:
        "Account created successfully. Check your email for verification message then Login.",
    });

    //TODO: send verif mail
  } catch (e: any) {
    if (!(e instanceof Object)) next(new Error("Error creating account"));

    if (!e?.message) e.message = "Error creating account";

    if (e instanceof Error && "code" in e) {
      if (e["code"] === 11000)
        next(
          new Error(
            "Account already exist, please login to access your account."
          )
        );
    }

    next(new Error("Error creating account"));
  }
};

export const signin: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const reqBody = req.body;
  const emailAddress: string | undefined = reqBody.emailAddress;
  const password: string | undefined = reqBody.password;

  if (!emailAddress || !password)
    res.status(401).json({
      message:
        "Incomplete credentials provided, couldn't complete request. Verify your credentials and retry",
    });

  try {
    const user = await AuthModel.findOne({ emailAddress }).exec();

    if (!user) {
      res.status(401).json({
        message: "Email or Password incorrect, please confirm and try again.",
      });
      return;
    }

    const passResult = await bcrypt.compare(password!, user.password!);

    if (!passResult) {
      res.status(401).json({
        message: "Email or Password incorrect, please confirm and try again.",
      });
      return;
    }

    //TODO: conform email is verified
    // if (!user.isVerified) {
    //   res.status(401).json({
    //     code: 1,
    //     message:
    //       "Account not verified, check your email address for verification mail and confirm then try logging in again.",
    //   });
    // }

    const token = jwt.sign(
      {
        fullname: user.fullname,
        emailAddress: user.emailAddress,
        priviledge: user.priviledge,
      },
      process.env.JWT_SECRET
    );

    const prevUserToken = await TokenModel.findOne({ owner: user._id }).exec();

    if (prevUserToken) {
      prevUserToken.token = token;
      await prevUserToken.save();
    } else {
      await new TokenModel({ owner: user._id, token }).save();
    }

    res.status(200).json({ token });
  } catch (e: any) {
    console.log(e);
    const defaultErrMsg = "Error signing in, please try again later";
    if (!(e instanceof Object)) next(new Error(defaultErrMsg));

    if (!e?.message) e.message = defaultErrMsg;

    next(new Error(defaultErrMsg));
  }
};

// NOT HERE!

export const forgetPassword: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const emailAddress: string | undefined = req.body.emailAddress;

  if (!emailAddress) {
    res.status(401).json({
      message:
        "Incomplete credentials provided, couldn't complete request. Verify your credentials and retry",
    });
    return;
  }

  try {
    const user = await AuthModel.findOne({ emailAddress }).exec();

    if (!user) {
      res.status(401).json({
        message: "Email address incorrect, please confirm and try again.",
      });
      return;
    }

    //TODO: send change password email
    res.status(200).json({ message: "Working on it" });
  } catch (_: any) {
    next(new Error("Error processing your request. Please try again."));
  }
};

export const changeEmail: RequestHandler = () => {};

export const sendVerificationMail: RequestHandler = (
  _: Request,
  res: Response,
  _1: NextFunction
) => {
  // TODO: verify mail
  res.status(200).json({ message: "Working on it" });
};
