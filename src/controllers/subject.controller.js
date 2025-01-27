// src/controllers/subject.controller.js
import Exam from '../models/exam.model.js';
import Subject from '../models/subject.model.js';

export const createSubject = async (req, res) => {
    try {
      const { name, exam , createdBy} = req.body;
  
      const newSubject = new Subject({
        name,
        exam,
        createdBy
      });
  
      const savedSubject = await newSubject.save();
  
      // Update the exam to include this subject
      await Exam.findByIdAndUpdate(
        exam,
        { $push: { subjects: savedSubject._id } },
        { new: true, useFindAndModify: false }
      );
  
      res.status(201).json({
        message: 'Subject created successfully',
        subject: savedSubject,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };

export const getSubjectsByExam = async (req, res, next) => {
  try {
    const { examId } = req.params;
    const subjects = await Subject.find({ exam: examId }).populate('topics');
    res.status(200).json(subjects);
  } catch (error) {
    next(error);
  }
};
