// testResult.controller.js
import TestResult from '../models/testResult.model.js';

export const submitTestResult = async (req, res) => {
  try {
    const { userId, testId, answers, score, totalQuestions, correctAnswers, timeTaken, testType } = req.body;

    if (!userId || !testId || !answers || !testType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Save the test result to the database
    const testResult = await TestResult.create({
      userId,
      testId,
      answers,
      testType,
      score,
      totalQuestions,
      correctAnswers,
      timeTaken,
    });

    res.status(201).json({ message: 'Test results saved successfully', testResult });
  } catch (error) {
    console.error('Error saving test results:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
export const getTestResultByTestId = async (req, res) => {
  try {
    console.log(req.params)
    const { testId } = req.params;
    const userId = req.userId; // Changed from req.user._id to req.userId

    const testResult = await TestResult.findOne({ testId, userId });
    console.log(testResult,"testResult", testId, userId)
    if (!testResult) {
      return res.status(200).json({ message: 'No test result found for this test.' });
    }

    res.json({ testResult });
  } catch (error) {
    console.error('Error fetching test result:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
export const getTestResults = async (req, res) => {
  try {
    const userId = req.userId;
    const results = await TestResult.find({ userId })
      .sort({ submittedAt: -1 })
      .limit(10);
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching test results', error: error.message });
  }
};