import Router from "express";
import { addPayment, depositWebhook } from "../models/transaction";
const TransactionRouter = Router();

TransactionRouter.post("/add-payment", addPayment);

TransactionRouter.post("/deposit-webhook", depositWebhook);

export default TransactionRouter;
