import express from "express";
import { authMiddleware, checkAdmin } from "../middleware/auth.middleware.js";
import {
  createProblem,
  deleteProblem,
  getAllProblems,
  getAllProblemsSolvedByUser,
  getProblemById,
  updateProblem,
} from "../controllers/problem.controllers.js";

const problemRoutes = express.Router();

problemRoutes.get("/get-all-problems", getAllProblems);

problemRoutes.get("/get-problem/:id", getProblemById);

problemRoutes.post(
  "/create-problem",
  authMiddleware,
  checkAdmin,
  createProblem
);

problemRoutes.put("/update-problem", updateProblem);

problemRoutes.post(
  "/delete-problem/:id",
  authMiddleware,
  checkAdmin,
  deleteProblem
);

problemRoutes.get(
  "/get-solved-problems",
  authMiddleware,
  getAllProblemsSolvedByUser
);

export default problemRoutes;
