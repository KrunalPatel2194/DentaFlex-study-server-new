// src/controllers/test.controller.js
import Test from '../models/tests.model.js';
import Exam from '../models/exam.model.js'; // Assuming an Exam model exists
import FieldOfStudy from '../models/fieldOfStudy.model.js';
import { Types } from 'mongoose';
const { ObjectId } = Types;
export const createTest = async (req, res, next) => {
  try {
    const { title, type, examId, questions } = req.body;

    // Verify the exam exists
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    const newTest = new Test({
      title,
      type,
      exam: examId,
      questions,
      createdBy: req.userId,
    });

    const savedTest = await newTest.save();
    res.status(201).json({ message: 'Test created successfully', test: savedTest });
  } catch (error) {
    next(error);
  }
};

// Update a test
export const updateTest = async (req, res, next) => {
  try {
    const { testId } = req.params;
    const updates = req.body;

    const updatedTest = await Test.findByIdAndUpdate(testId, updates, { new: true });
    if (!updatedTest) {
      return res.status(404).json({ message: 'Test not found' });
    }

    res.status(200).json({ message: 'Test updated successfully', test: updatedTest });
  } catch (error) {
    next(error);
  }
};

// Delete a test
export const deleteTest = async (req, res, next) => {
  try {
    const { testId } = req.params;

    const deletedTest = await Test.findByIdAndDelete(testId);
    if (!deletedTest) {
      return res.status(404).json({ message: 'Test not found' });
    }

    res.status(200).json({ message: 'Test deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Add a question to a test
export const addQuestion = async (req, res, next) => {
  try {
    const { testId } = req.params;
    const question = req.body;

    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    test.questions.push(question);
    await test.save();

    res.status(200).json({ message: 'Question added successfully', test });
  } catch (error) {
    next(error);
  }
};

// Delete a question from a test
export const deleteQuestion = async (req, res, next) => {
  try {
    const { testId, questionId } = req.params;

    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    test.questions.id(questionId).remove();
    await test.save();

    res.status(200).json({ message: 'Question removed successfully', test });
  } catch (error) {
    next(error);
  }
};

export const addTest = async (req, res, next) => {
  try {
    const { examId, name, type, questions, createdBy } = req.body;

    // Validate Exam existence
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Create a new test
    const newTest = new Test({
      name,
      type,
      exam: examId, // Associate the test with the exam
      createdBy, // Associate with the author
      questions,
    });

    await newTest.save();

    // Optionally, you can add the test reference to the exam's `tests` array
    exam.tests = exam.tests || [];
    exam.tests.push(newTest._id);
    await exam.save();

    res.status(201).json({
      message: 'Test created successfully',
      test: newTest,
    });
  } catch (error) {
    console.error('Error adding test:', error.message);
    next(error);
  }
};

export const getTestDetails = async (req, res, next) => {
  try {
    const { testId } = req.params;
    // const updates = req.body;
    const details = await Test.findOne({ _id: new ObjectId(testId) });
    if (!details) {
      return res.status(404).json({ message: 'Test not found' });
    }
    res.status(200).json({ message: 'Test retrieved successfully', test: details });
  } catch (error) {
    next(error);
  }
};