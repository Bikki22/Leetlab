import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { executeCode } from "../controllers/executeCode.controllers.js";

const executeRoutes = express.Router();

executeRoutes.post("/", authMiddleware, executeCode);

export default executeRoutes;
