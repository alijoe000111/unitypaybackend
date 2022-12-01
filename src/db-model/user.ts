import mongoose, { model, Schema } from "mongoose";

const User = new Schema({
  owner: {
    type: mongoose.Types.ObjectId,
    ref: "Auth",
    unique: true,
    required: true,
  },
  balance: { type: Number, default: 0 },
  pending: { type: Number, default: 0 },
  transactionNum: { type: Number, default: 0 },
  earnings: { type: Number, default: 0 },
  transactions: {
    type: [{ type: mongoose.Types.ObjectId, ref: "Transaction" }],
    default: [],
  },
  isBlock: { type: Boolean, default: false, required: false }, // if user is block from paying utility
});

export default model("User", User);
