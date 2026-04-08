import express from "express";
import { orderData } from "../controller/order.controller.js";
import userMiddleware from "../middleware/user.middleware.js";

const router = express.Router();

router.post("/", userMiddleware, orderData);

export default router;