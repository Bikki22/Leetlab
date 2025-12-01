import { db } from "../libs/db.js";
import {
  getLanguageName,
  pollBatchResults,
  submitBatch,
} from "../libs/judge0.libs.js";

export const executeCode = async (req, res) => {
  const { source_code, langauge_id, stdin, expected_outputs, problemId } =
    req.body;
  try {
    const userId = req.user.id;

    // validate test case

    if (
      !Array.isArray(stdin) ||
      stdin.length === 0 ||
      !Array.isArray(expected_outputs) ||
      expected_outputs.length !== stdin.length
    ) {
      return res.status(400).json({ error: "Invalid or Missing test cases" });
    }

    // 2. prepare each test cases for judge0 batch submission

    const submissions = stdin.map((input) => ({
      source_code,
      langauge_id,
      stdin: input,
    }));

    // 3. send the batch of submission to judge0

    const submitResponse = await submitBatch(submissions);

    const tokens = submitResponse.map((res) => res.token);

    // 4. poll judge0 for results of all submitted test cases

    const results = await pollBatchResults(tokens);

    console.log("results----------->");
    console.log(results);

    // Analyze test case result

    let allPassed = true;

    const detailedResults = results.map((result, i) => {
      const stdout = result.stdout?.trim();

      const expected_output = expected_outputs[i]?.trim();

      const passed = stdout === expected_output;

      if (!passed) allPassed = false;

      return {
        testcase: i + 1,
        passed,
        stdout,
        expected: expected_output,
        stderr: result.stderr || null,
        compile_output: result.compile_output || null,
        status: result.status.description,
        memory: result.memory ? `${result.memory} KB` : undefined,
        time: result.time ? `${result.time} sec` : undefined,
      };

      //   console.log(`Testcase  #${i + 1}`);
      //   console.log(`Input for testcases #${i + 1}: #${stdin[i]}`);
      //   console.log(
      //     `Expected Output for the testcase #${i + 1}:  ${expected_output}`
      //   );
      //   console.log(`Actual OUtput for testcase #${i + 1}: ${stdout}`);

      //   console.log(`Matched for testcase #${i + 1}:  ${passed}`);
    });

    // store submission summary

    const submission = await db.submission.create({
      data: {
        userId,
        problemId,
        source_code,
        langauge: getLanguageName(langauge_id),
        stdin: stdin.join("\n"),
        stdout: JSON.stringify(detailedResults.map((r) => r.stdout)),
        stderr: detailedResults.some((r) => r.stderr)
          ? JSON.stringify(detailedResults.map((r) => r.stderr))
          : null,
        compileOutput: detailedResults.some((r) => r.compile_output)
          ? JSON.stringify(detailedResults.map((r) => r.compile_output))
          : null,
        status: allPassed ? "Accepted" : "Wrong Answer",
        memory: detailedResults.map((r) => r.memory)
          ? JSON.stringify(detailedResults.map((r) => r.memory))
          : null,
        time: detailedResults.map((r) => r.time)
          ? JSON.stringify(detailedResults.map((r) => r.time))
          : null,
      },
    });

    //   if All Passed = true then mark paroblem as a solved problem
    // upsert means if that doesnot exist then create otherwise update

    if (allPassed) {
      await db.problemSolved.upsert({
        where: {
          userId_problemId: {
            userId,
            problemId,
          },
        },
        update: {},
        create: {
          userId,
          problemId,
        },
      });
    }

    // save individual problem using detailedResults

    const testCaseResults = detailedResults.map((result) => ({
      submissionId: submission.id,
      testCase: result.testCase,
      passed: result.passed,
      stdout: result.stdout,
      expected: result.expected,
      stderr: result.stderr,
      compileOutput: result.compileOutput,
      status: result.status,
      memory: result.memory,
      time: result.time,
    }));

    await db.testCaseResult.createMany({
      data: testCaseResults,
    });

    const submissionWithTestCase = await db.submission.findUnique({
      where: {
        id: submission.id,
      },
      include: {
        testCases: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Code Executed successfully! ",
      submission: submissionWithTestCase,
    });
  } catch (error) {
    console.error("Error in executing code", error.message);
    res.status(500).json({ error: "Failed to execute code" });
  }
};
