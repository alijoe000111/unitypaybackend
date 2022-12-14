import Router from "express";
import {
  getUserInfo,
  changePassword,
  changeEmail,
  changeName,
  updateBalance,
  updateTransactionStatus,
  updateBlockStatus,
  getMyDepositWallet,
} from "../models/user";
const UserRouter = Router();

UserRouter.get("/userinfo", getUserInfo);

UserRouter.post("/change-password", changePassword);

UserRouter.post("/change-email", changeEmail);

UserRouter.post("/change-name", changeName);

UserRouter.post("/update-balance", updateBalance);

UserRouter.post("/update-transaction-status", updateTransactionStatus);

UserRouter.post("/update-block-status", updateBlockStatus);

UserRouter.get("/deposit-wallet", getMyDepositWallet);

export default UserRouter;
