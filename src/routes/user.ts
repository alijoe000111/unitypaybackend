import Router from "express";
import { getUserInfo, changePassword, changeEmail } from "../models/user";
const UserRouter = Router();

UserRouter.get("/userinfo", getUserInfo);

UserRouter.post("/change-password", changePassword);

UserRouter.post("/change-email", changeEmail);

export default UserRouter;
