import {
  changeEmail,
  forgetPassword,
  sendVerificationMail,
  signin,
  signUp,
} from "../models/auth";

import Router from "express";

const AuthRouter = Router();

AuthRouter.post("/signup", signUp);

AuthRouter.post("/signin", signin);

// Not here

AuthRouter.post("/forget", forgetPassword);

AuthRouter.post("/send-verification-mail", sendVerificationMail);

AuthRouter.get("/change-email", changeEmail);

export default AuthRouter;
