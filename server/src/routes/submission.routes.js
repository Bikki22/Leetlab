import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  getAllSubmissions,
  getAllTheSubmissionsForTheProblem,
  getSubmissionsForProblem,
} from "../controllers/submission.controllers.js";

const submissionRoutes = express.Router();

submissionRoutes.get("get-all-submissions", authMiddleware, getAllSubmissions);
submissionRoutes.get(
  "get-submission/:problemId",
  authMiddleware,
  getSubmissionsForProblem
);
submissionRoutes.get(
  "get-submissions-count/:problemId",
  authMiddleware,
  getAllTheSubmissionsForTheProblem
);

export default submissionRoutes;
