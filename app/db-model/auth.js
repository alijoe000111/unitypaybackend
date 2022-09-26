"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const Auth = new mongoose_1.Schema({
    emailAddress: { type: String, unique: true, required: true },
    fullname: { type: String, required: true },
    password: { type: String, required: true },
    dateCreated: { type: Date, default: Date.now },
    isVerified: { type: Boolean, default: false },
    priviledge: {
        type: String,
        default: "user",
        enum: ["user", "admin"],
    },
});
exports.default = (0, mongoose_1.model)("Auth", Auth);
