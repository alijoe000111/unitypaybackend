"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVerificationMail = exports.changeEmail = exports.forgetPassword = exports.signin = exports.signUp = void 0;
const auth_1 = __importDefault(require("../db-model/auth"));
const user_1 = __importDefault(require("../db-model/user"));
const token_1 = __importDefault(require("../db-model/token"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const signUp = async (req, res, next) => {
    const reqBody = req.body;
    const { emailAddress } = reqBody;
    const { fullname } = reqBody;
    let { password } = reqBody;
    if (!emailAddress || !fullname || !password) {
        res.status(401).json({
            message: "Incomplete credentials provided, couldn't complete request. Verify your credentials and retry",
        });
    }
    if (password.length < 8) {
        res
            .status(401)
            .json({ message: "Password length cannot be less than 8 characters" });
        return;
    }
    password = await bcrypt_1.default.hash(password, 12);
    try {
        const result = await new auth_1.default({
            emailAddress,
            fullname,
            password,
        }).save();
        if (!result) {
            next(new Error("Error creating Account"));
            return;
        }
        new user_1.default({ owner: result._id }).save();
        res.status(201).json({
            emailAddress,
            fullname,
            message: "Account created successfully. Check your email for verification message then Login.",
        });
        //TODO: send verif mail
    }
    catch (e) {
        if (!(e instanceof Object))
            next(new Error("Error creating account"));
        if (!e?.message)
            e.message = "Error creating account";
        if (e instanceof Error && "code" in e) {
            if (e["code"] === 11000)
                next(new Error("Account already exist, please login to access your account."));
        }
        next(new Error("Error creating account"));
    }
};
exports.signUp = signUp;
const signin = async (req, res, next) => {
    const reqBody = req.body;
    const emailAddress = reqBody.emailAddress;
    const password = reqBody.password;
    if (!emailAddress || !password)
        res.status(401).json({
            message: "Incomplete credentials provided, couldn't complete request. Verify your credentials and retry",
        });
    try {
        const user = await auth_1.default.findOne({ emailAddress }).exec();
        if (!user) {
            res.status(401).json({
                message: "Email or Password incorrect, please confirm and try again.",
            });
            return;
        }
        const passResult = await bcrypt_1.default.compare(password, user.password);
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
        const token = jsonwebtoken_1.default.sign({
            fullname: user.fullname,
            emailAddress: user.emailAddress,
            priviledge: user.priviledge,
        }, process.env.JWT_SECRET);
        const prevUserToken = await token_1.default.findOne({ owner: user._id }).exec();
        if (prevUserToken) {
            prevUserToken.token = token;
            await prevUserToken.save();
        }
        else {
            await new token_1.default({ owner: user._id, token }).save();
        }
        res.status(200).json({ token, emailAddress });
    }
    catch (e) {
        console.log(e);
        const defaultErrMsg = "Error signing in, please try again later";
        if (!(e instanceof Object))
            next(new Error(defaultErrMsg));
        if (!e?.message)
            e.message = defaultErrMsg;
        next(new Error(defaultErrMsg));
    }
};
exports.signin = signin;
// NOT HERE!
const forgetPassword = async (req, res, next) => {
    const emailAddress = req.body.emailAddress;
    if (!emailAddress) {
        res.status(401).json({
            message: "Incomplete credentials provided, couldn't complete request. Verify your credentials and retry",
        });
        return;
    }
    try {
        const user = await auth_1.default.findOne({ emailAddress }).exec();
        if (!user) {
            res.status(401).json({
                message: "Email address incorrect, please confirm and try again.",
            });
            return;
        }
        //TODO: send change password email
        res.status(200).json({ message: "Working on it" });
    }
    catch (_) {
        next(new Error("Error processing your request. Please try again."));
    }
};
exports.forgetPassword = forgetPassword;
const changeEmail = () => { };
exports.changeEmail = changeEmail;
const sendVerificationMail = (_, res, _1) => {
    // TODO: verify mail
    res.status(200).json({ message: "Working on it" });
};
exports.sendVerificationMail = sendVerificationMail;
