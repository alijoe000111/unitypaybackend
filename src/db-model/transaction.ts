import mongoose, { model, Schema } from "mongoose";

//TODO: create in signup
const Transaction = new Schema({
  owner: {
    type: mongoose.Types.ObjectId,
    ref: "Auth",
    required: true,
  },
  transactions: {
    type: {
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
      transactionID: {
        type: String,
        default: Math.random().toString(32).slice(2),
        required: false,
      },
    },

    default: [],
  },
});

export default model("Transaction", Transaction);
