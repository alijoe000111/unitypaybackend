import Router from "express";
import {
  getUserInfo,
  changePassword,
  changeEmail,
  updateBalance,
  updateTransactionStatus,
} from "../models/user";
const UserRouter = Router();

UserRouter.get("/userinfo", getUserInfo);

UserRouter.post("/change-password", changePassword);

UserRouter.post("/change-email", changeEmail);

UserRouter.post("/update-balance", updateBalance);

UserRouter.post("/update-transaction-status", updateTransactionStatus);

export default UserRouter;
