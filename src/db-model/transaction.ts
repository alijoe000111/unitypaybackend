import mongoose, { model, Schema } from "mongoose";

const Transaction = new Schema({
  owner: { type: mongoose.Types.ObjectId, ref: "Auth", required: true },
  transactionID: {
    type: String,
    required: true,
  },
  typeName: String,
  type: String,
  amount: Number,
  status: { type: String, default: "Pending", required: false },
  deliveredOn: { type: String, default: "-", required: false },
  transferDate: {
    type: String,
    default: `${new Date().getFullYear()} - ${new Date().getMonth()} - ${new Date().getDate()}`,
    required: false,
  },
  transferTime: {
    type: String,
    default: `${new Date().getHours()} : ${new Date().getMinutes()}`,
    required: false,
  },
});

export default model("Transaction", Transaction);
