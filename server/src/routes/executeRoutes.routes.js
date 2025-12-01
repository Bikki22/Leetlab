import express from "express";
import { authMiddleware } from "../middleware/auth.middleware";

const executeRoutes = express.Router();

executeRoutes.post("/", authMiddleware, executeCode);

export default executeRoutes;
