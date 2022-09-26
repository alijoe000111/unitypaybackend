import mongoose, { Schema, model } from "mongoose";

const Token = new Schema({
  owner: {
    type: mongoose.Types.ObjectId,
    ref: "Auth",
    required: true,
    unique: true,
  },
  token: { type: String, required: true },
});

export default model("Token", Token);
