import { db } from "../libs/db.js";
import {
  getJudge0LanguageId,
  pollBatchResults,
  submitBatch,
} from "../libs/judge0.libs.js";

export const createProblem = async (req, res) => {
  // going to get all the data from req.body
  const {
    title,
    description,
    difficulty,
    tags,
    examples,
    constrains,
    testcases,
    codeSnippits,
    refrenceSolutions,
  } = req.body;

  // going to check the user role once again

  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      error: "You are not allowed to create a problem",
    });
  }

  // loop through each reference solution for different language

  try {
    for (const [language, solutionCode] of Object.entries(refrenceSolutions)) {
      const languageId = getJudge000LanguageId(language);
      if (!languageId) {
        return res
          .status(400)
          .json({ error: `Language ${language} is not supported` });
      }

      const submissions = testcases.map(({ input, output }) => ({
        source_code: solutionCode,
        language_id: languageId,
        stdin: input,
        expected_output: output,
      }));

      const submissionResults = await submitBatch(submissions);

      const tokens = submissionResults.map((res) => res.token);

      const results = await pollBatchResults(tokens);

      for (let i = 0; i < results.length; i++) {
        const result = results[i];

        if (result.status.id !== 3) {
          return res.status(400).json({
            error: `Testcase ${i + 1} failed for language ${language}`,
          });
        }
      }

      //   save the problem to the database
      const newProblem = await db.problem.create({
        data: {
          title,
          description,
          difficulty,
          tags,
          examples,
          constrains,
          testcases,
          codeSnippits,
          refrenceSolutions,
          userId: req.user.id,
        },
      });

      return res.status(201).json({
        success: true,
        message: "Problem created successfully",
        newProblem,
      });
    }
  } catch (error) {
    console.log("Error in creating problem", error);
    res.status(500).json({ error: error.message });
  }
};

export const getAllProblems = async (req, res) => {
  try {
    const problems = await db.problem.findMany();

    if (!problems) {
      return res.status(404).json({ error: "No Problems found!" });
    }

    res.status(200).json({
      success: true,
      message: "Problems fetched successfully",
      problems,
    });
  } catch (error) {
    console.log("Error in getting problems", error);
    res.status(500).json({ error: error.message });
  }
};

export const getProblemById = async (req, res) => {
  const { id } = req.params;

  try {
    const problem = await db.problem.findUnique({
      where: {
        id,
      },
    });

    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    res.status(200).json({
      success: true,
      message: "problem found successfully",
      problem,
    });
  } catch (error) {
    console.log("Error in getting problem by id", error);
    res.status(500).json({ error: error.message });
  }
};

export const updateProblem = async (req, res) => {
  const { id } = req.params;

  try {
    const problem = await db.problem.findUnique({
      where: {
        id,
      },
    });

    if (!problem) {
      return res.status(404).json({ error: "Problem not found!" });
    }

    const updatedProblem = await db.problem.update({
      data: {
        title,
        description,
        difficulty,
        tags,
        examples,
        constrains,
        testcases,
        codeSnippits,
        refrenceSolutions,
      },
    });

    res.status(200).json({
      success: true,
      message: "Problem updated successfully",
      updatedProblem,
    });
  } catch (error) {
    console.log("Error in updating problem", error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteProblem = async (req, res) => {
  const { id } = req.params;

  try {
    const problem = await db.problem.findUnique({
      where: {
        id,
      },
    });

    if (!problem) {
      return res.status(404).json({ error: "problem not found" });
    }

    await db.pproblem.delete({
      where: {
        id,
      },
    });

    res.status(200).json({ message: "Problem deleted successfully" });
  } catch (error) {
    console.log("Error in deleting problem", error);
    res.status(500).json({ error: error.message });
  }
};

export const getAllProblemsSolvedByUser = async (req, res) => {
  try {
  } catch (error) {}
};
