import Router from "express";
import { getUserInfo } from "../models/user";
const UserRouter = Router();

UserRouter.get("/userinfo", getUserInfo);

export default UserRouter;
