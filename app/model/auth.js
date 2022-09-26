"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const Auth = new mongoose_1.Schema({
    emailAddress: { type: String, unique: true },
    fullname: String,
    password: String,
    dateCreated: { type: Date, default: Date.now },
    isVerified: { type: String, default: false },
});
exports.default = (0, mongoose_1.model)("Auth", Auth);
