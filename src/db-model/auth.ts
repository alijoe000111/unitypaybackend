import { Schema, model } from "mongoose";

const Auth = new Schema({
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

export default model("Auth", Auth);
