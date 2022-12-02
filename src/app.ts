import * as dotenv from "dotenv";
dotenv.config();

import express, {
  ErrorRequestHandler,
  NextFunction,
  RequestHandler,
  Response,
  Request,
} from "express";

import AuthRouter from "./routes/auth";
import mongoose from "mongoose";
import UserRouter from "./routes/user";
import TokenModel from "./db-model/token";
import jwt from "jsonwebtoken";
import TransactionRouter from "./routes/transaction";

const app = express();

app.use((req, res, next) => {
  const allowedOrigin = [
    "http://localhost:3000",
    "https://orbitpay.netlify.app",
    "https://coinremitter.com",
    "https://unitypaybank.netlify.app/",
    "https://unitypaybank.com",
  ];
  const origin = req.headers.origin!!;

  res.setHeader(
    "Access-Control-Allow-Origin",
    allowedOrigin.includes(origin) ? origin : allowedOrigin[1]
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    res.status(200).send();
    return;
  }
  next();
});

app.use(express.urlencoded({ extended: true }));
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);

const ValidateToken: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.url === "/deposit-webhook") return next();

  let token = req.headers.authorization;

  if (!token || !token.startsWith("Bearer ") || token.length < 10) {
    res.status(401).json({
      message: "Invalid token provided, please log out and login again.",
    });
    return;
  }

  token = token.replace("Bearer ", "");

  try {
    const userToken = await TokenModel.findOne({ token }).exec();

    if (!userToken) {
      res.status(401).json({
        message: "Invalid token provided, please log out and login again.",
      });
      return;
    }

    req.body.decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    req.body.ownerID = userToken.owner;

    next();
  } catch (_: any) {
    next(new Error("Error Authorizing user, please try again later"));
  }
};

app.use("/auth", AuthRouter);
app.use("/user", ValidateToken, UserRouter);
app.use("/transaction", ValidateToken, TransactionRouter);

const errorHandler: ErrorRequestHandler = (
  err: Error,
  _,
  res: Response,
  _1
) => {
  res.status(500).json({
    message: err.message || "Error processing your request, please try later.",
  });
};
app.use(errorHandler);

const processEnv = process.env;
const PORT = processEnv.PORT || 33000;

app.listen(PORT, async () => {
  console.log(`Listening on ${PORT}`);

  const mongoConnect = await mongoose.connect(processEnv.MONGODB_URI);

  if (!mongoConnect) {
    console.log("ERROR CONNECTING TO MONGODB");
  }
  console.log("connected to Mongodb");
});
