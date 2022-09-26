import Router from "express";
import { addPayment } from "../models/transaction";
const TransactionRouter = Router();

TransactionRouter.post("/add-payment", addPayment);

export default TransactionRouter;
