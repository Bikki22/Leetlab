export const getAllSubmissions = async (req, res) => {
  try {
    const userId = req.user.id;

    const submissions = await db.submission.findMany({
      where: {
        userId: userId,
      },
    });

    res.status(200).json({
      success: true,
      message: "Submissions fetched successfully",
      submissions,
    });
  } catch (error) {
    console.log("Error in get all submissions", error);
    res.status(500).json({ error: error.message });
  }
};

export const getSubmissionsForProblem = async (req, res) => {
  try {
    const userId = req.user.id;

    const problemId = req.params.problemId;

    const submissions = await db.submissions.findMany({
      where: {
        userId: userId,
        problemId: problemId,
      },
    });

    res.status(200).json({
      success: true,
      message: "Submission fetched successfully",
      submissions,
    });
  } catch (error) {
    console.log("Error in get submission for problem", error);
    res.status(500).json({ error: error.message });
  }
};

export const getAllTheSubmissionsForTheProblem = async (req, res) => {
  try {
    const problemId = req.params.problemId;

    const submissions = await db.submission.count({
      where: {
        problemId: problemId,
      },
    });

    res.status(200).json({
      success: true,
      message: "Counted all submissions successfully",
      submissions,
    });
  } catch (error) {
    console.log("Error in get submission count for problem", error);
    res.status(500).json({ error: error.message });
  }
};
