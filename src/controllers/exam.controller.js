// src/controllers/exam.controller.js
// import Exam from '../models/exam.model.js';
import FieldOfStudy from '../models/fieldOfStudy.model.js';
import Test from '../models/tests.model.js';
import mongoose from 'mongoose';
import Exam from '../models/exam.model.js'
// Create a new exam
export const createExam = async (req, res, next) => {
  try {
    const { name, description, fieldOfStudyId } = req.body;
    const fieldOfStudy = await FieldOfStudy.findById(fieldOfStudyId);
    if (!fieldOfStudy) {
      return res.status(404).json({ message: 'Field of Study not found' });
    }

    const newExam = new Exam({
      name,
      description,
      fieldOfStudy: fieldOfStudyId,
      createdBy: req.userId,
    });

    const savedExam = await newExam.save();
    res.status(201).json({ message: 'Exam created successfully', exam: savedExam });
  } catch (error) {
    next(error);
  }
};

// Add a test to an exam
export const addTestToExam = async (req, res, next) => {
  try {
    const { examId, title, type, questions } = req.body;

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    const newTest = new Test({
      title,
      type,
      questions,
      exam: examId,
      createdBy: req.userId,
    });

    const savedTest = await newTest.save();

    // Add test to the exam
    exam.tests.push(savedTest._id);
    await exam.save();

    res.status(201).json({ message: 'Test added successfully', test: savedTest });
  } catch (error) {
    next(error);
  }
};

// Get all tests for an exam
export const getTestsByExam = async (req, res, next) => {
  try {
    const { examId } = req.params;

    const tests = await Test.find({ exam: examId });
    if (!tests.length) {
      return res.status(404).json({ message: 'No tests found for this exam' });
    }

    res.status(200).json(tests);
  } catch (error) {
    next(error);
  }
};
export const deleteExam = async (req, res, next) => {
    try {
      const { examId } = req.params;
  
      // Find and delete the exam
      const exam = await Exam.findByIdAndDelete(examId);
      if (!exam) {
        return res.status(404).json({ message: 'Exam not found' });
      }
  
      // Optionally: Delete associated tests
      await Test.deleteMany({ exam: examId });
  
      res.status(200).json({ message: 'Exam and associated tests deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

//   export const getExamsByFieldOfStudy = async (req, res, next) => {
//     try {
//       const { fieldOfStudyId } = req.params;
  
//       // Fetch exams linked to the field of study
//       const exams = await Exam.find({ fieldOfStudy: fieldOfStudyId }).populate('fieldOfStudy', 'name');
//       if (!exams || exams.length === 0) {
//         return res.status(404).json({ message: 'No exams found for this field of study' });
//       }
  
//       res.status(200).json(exams);
//     } catch (error) {
//       next(error);
//     }
//   };
export const getExamsByFieldOfStudy = async (req, res) => {
    try {
      const { fieldId } = req.params;
  
      // Find all exams associated with the given field of study
      const exams = await Exam.find({ fieldOfStudy: fieldId }).select('name _id');
      if (!exams.length) {
        return res.status(404).json({ message: 'No exams found for this field of study' });
      }
  
      res.status(200).json(exams);
    } catch (error) {
      console.error('Error fetching exams:', error.message);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  

  export const updateExam = async (req, res, next) => {
    try {
      const { examId } = req.params;
      const updates = req.body;
  
      // Find the exam and update it
      const updatedExam = await Exam.findByIdAndUpdate(
        examId,
        { $set: updates },
        { new: true, runValidators: true }
      );
  
      if (!updatedExam) {
        return res.status(404).json({ message: 'Exam not found' });
      }
  
      res.status(200).json({
        message: 'Exam updated successfully',
        exam: updatedExam,
      });
    } catch (error) {
      next(error);
    }
  };
  export const getExamDetailsWithHierarchy = async (req, res) => {
    try {
      const { examId } = req.params;
  
      const exam = await Exam.findById(examId)
        .populate({
          path: 'subjects',
          populate: {
            path: 'topics',
            populate: {
              path: 'subtopics', // Ensure subtopics are populated
            },
          },
        })
        .populate('fieldOfStudy');
  
      if (!exam) {
        return res.status(404).json({ message: 'Exam not found' });
      }
  
      // Fetch related tests
      const tests = await Test.find({ exam: examId });
  
      const selfAssessment = tests.filter((test) => test.type === 'self-assessment');
      const mockTests = tests.filter((test) => test.type === 'mock-test');
  
      res.json({
        exam: {
          ...exam.toObject(),
          selfAssessment,
          mockTests,
        },
      });
    } catch (error) {
      console.error('Error fetching exam details:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  export const getExamSummary = async (req, res) => {
    try {
      const { examId } = req.params;
  
      // Fetch the exam with only required data
      const exam = await Exam.findById(examId)
        .select('_id name') // Fetch only ID and name of the exam
        .populate({
          path: 'subjects',
          select: '_id name', // Fetch only ID and name of subjects
          populate: {
            path: 'topics',
            select: '_id name', // Fetch only ID and name of topics
            populate: {
              path: 'subtopics',
              select: '_id name', // Fetch only ID and name of subtopics
            },
          },
        });
  
      if (!exam) {
        return res.status(404).json({ message: 'Exam not found' });
      }
  
      // Fetch tests associated with this exam
      const tests = await Test.find({ exam: examId }).select('_id name type'); // Fetch ID, name, and type of tests
  
      // Separate tests into self-assessment and mock tests
      const selfAssessment = tests.filter((test) => test.type === 'self-assessment').map((test) => ({
        _id: test._id,
        name: test.name,
      }));
      const mockTests = tests.filter((test) => test.type === 'mock-test').map((test) => ({
        _id: test._id,
        name: test.name,
      }));
  
      res.json({
        exam: {
          _id: exam._id,
          name: exam.name,
          selfAssessment,
          mockTests,
          subjects: exam.subjects.map((subject) => ({
            _id: subject._id,
            name: subject.name,
            topics: subject.topics.map((topic) => ({
              _id: topic._id,
              name: topic.name,
              subtopics: topic.subtopics.map((subtopic) => ({
                _id: subtopic._id,
                name: subtopic.name,
              })),
            })),
          })),
        },
      });
    } catch (error) {
      console.error('Error fetching exam summary:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  export const getExamByfieldNameandExamName = async (req, res) => {
    const { fieldName, examName } = req.params;

  try {
    // Find the field of study by name
    const field = await FieldOfStudy.findOne({ name: fieldName });
    if (!field) {
      return res.status(404).json({ message: `Field of Study "${fieldName}" not found.` });
    }

    // Find the exam by name and field ID
    const exam = await Exam.findOne({ name: examName, fieldOfStudy: field._id });
    if (!exam) {
      return res.status(404).json({ message: `Exam "${examName}" not found for field "${fieldName}".` });
    }

    res.status(200).json({ examId: exam._id });
  } catch (error) {
    console.error('Error fetching exam:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
  };

//   export const getExamFieldByName