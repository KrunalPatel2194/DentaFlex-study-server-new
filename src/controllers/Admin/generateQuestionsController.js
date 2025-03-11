// controllers/admin/generateExam.controller.js
import OpenAI from 'openai';
import Test from '../../models/tests.model.js';
import Exam from '../../models/exam.model.js';
import Subject from '../../models/subject.model.js';
import Topic from '../../models//topic.model.js';
import Subtopic from '../../models/subTopic.model.js';
import mongoose from 'mongoose';

// Initialize OpenAI client - new format for v4 of the SDK
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateExam = async (req, res, next) => {
  try {
    const {
      examId,
      subjectId,
      topicId,
      subtopicId,
      prompt,
      language,
      examType,
      numberOfQuestions,
      difficultyLevel,
      timeLimit
    } = req.body;

    // Validate required fields
    if (!examId || !prompt) {
      return res.status(400).json({
        success: false,
        message: 'Exam ID and prompt are required'
      });
    }

    // Find the exam
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    // Build context for the AI based on selected content
    let contentContext = '';
    
    if (subtopicId) {
      const subtopic = await Subtopic.findById(subtopicId);
      if (subtopic) {
        contentContext += `Subtopic: ${subtopic.name}\n${subtopic.content}\n\n`;
      }
    } else if (topicId) {
      const topic = await Topic.findById(topicId);
      if (topic) {
        contentContext += `Topic: ${topic.name}\n${topic.content}\n\n`;
      }
    } else if (subjectId) {
      const subject = await Subject.findById(subjectId);
      if (subject) {
        contentContext += `Subject: ${subject.name}\n${subject.description}\n${subject.content}\n\n`;
      }
    }

    // Construct the full prompt for OpenAI
    const fullPrompt = `
You are an expert exam creator for ${exam.name}.
${contentContext ? `Please create questions based on the following content:\n${contentContext}` : ''}

Please create ${numberOfQuestions} ${difficultyLevel} ${examType === 'self-assessment' ? 'self-assessment' : 'mock test'} questions in ${language} language.

${prompt}

Follow this JSON format for your response:
{
  "title": "A descriptive title for the test",
  "description": "A detailed description of what this test covers",
  "questions": [
    {
      "questionText": "Question text here",
      "options": [
        "Option 1",
        "Option 2",
        "Option 3",
        "Option 4"
      ],
      "correctAnswer": "Option X"
    }
  ]
}
`;

    // Call OpenAI API - updated for v4 of the SDK
    const response = await openai.chat.completions.create({
      model: "gpt-4", // or your preferred model
      messages: [{
        role: "user",
        content: fullPrompt
      }],
      temperature: 0.7,
      max_tokens: 3000,
    });

    // Parse the response - updated for v4 of the SDK
    const aiResponse = response.choices[0].message.content;
    let testData;
    
    try {
      testData = JSON.parse(aiResponse);
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to parse AI response',
        error: error.message
      });
    }

    // Format questions for the test model - adapting to the existing schema
    // Your schema uses 'options' as an array of strings and 'correctAnswer' as a string
    const formattedQuestions = testData.questions.map(q => ({
      questionText: q.questionText,
      options: q.options,
      correctAnswer: q.correctAnswer
    }));

    // Create the test in the database using the fields from your schema
    const test = new Test({
      name: testData.title, // Map title to name as per your schema
      exam: examId,
      type: examType,
      questions: formattedQuestions,
      createdBy: req.user._id,
      // Add the additional fields your schema supports
      subject: subjectId || undefined,
      topic: topicId || undefined,
      subtopic: subtopicId || undefined,
      difficultyLevel: difficultyLevel,
      language: language
    });

    await test.save();

    // If the Exam model has a tests array, add the test to it
    if (Array.isArray(exam.tests)) {
      await Exam.findByIdAndUpdate(
        examId,
        { $push: { tests: test._id } }
      );
    }

    res.status(201).json({
      success: true,
      message: 'Exam generated successfully',
      testId: test._id
    });

  } catch (error) {
    console.error('Error generating exam:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating exam',
      error: error.message
    });
  }
};

// Get all generated exams
export const getGeneratedExams = async (req, res, next) => {
  try {
    const { examId, type } = req.query;
    
    // Build query
    const query = {};
    if (examId) query.exam = examId;
    if (type) query.type = type;
    
    const tests = await Test.find(query)
      .populate('exam', 'name')
      .populate('subject', 'name')
      .populate('topic', 'name')
      .populate('subtopic', 'name')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: tests
    });
  } catch (error) {
    next(error);
  }
};