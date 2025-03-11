// admin.controller.js
import mongoose from 'mongoose';
import Exam from '../../models/exam.model.js';
import Subject from '../../models/subject.model.js';
import Topic from '../../models/topic.model.js';
import Subtopic from '../../models/subTopic.model.js';
import FieldOfStudy from '../../models/fieldOfStudy.model.js';
import ContentAudit from '../../models/contentAudit.model.js';
import { generateContent } from '../../utils/openai-content-generator.js';
import { parseAndUpdateContent } from '../../utils/contentParser.js';

// Field of Study Operations
export const createFieldOfStudy = async (req, res, next) => {
  try {
    const { name } = req.body;
    
    const fieldOfStudy = new FieldOfStudy({
      name,
    });
    
    await fieldOfStudy.save();
    
    res.status(201).json({
      success: true,
      fieldOfStudy
    });
  } catch (error) {
    next(error);
  }
};

// Get all fields of study with their associated exams
export const getAllFieldsOfStudyWithExams = async (req, res, next) => {
  try {
    const fieldsOfStudy = await FieldOfStudy.find();
    
    // For each field of study, get its exams
    const fieldsWithExams = await Promise.all(
      fieldsOfStudy.map(async (field) => {
        const exams = await Exam.find({ fieldOfStudy: field._id })
          .select('name description');
        return {
          _id: field._id,
          name: field.name,
          exams
        };
      })
    );
    
    res.json({
      success: true,
      data: fieldsWithExams
    });
  } catch (error) {
    next(error);
  }
};

// Exam Operations
export const createExam = async (req, res, next) => {
  try {
    const { name, description, fieldOfStudyId } = req.body;
    
    // Verify field of study exists
    const fieldOfStudy = await FieldOfStudy.findById(fieldOfStudyId);
    if (!fieldOfStudy) {
      return res.status(404).json({
        success: false,
        message: 'Field of study not found'
      });
    }
    
    const exam = new Exam({
      name,
      description,
      fieldOfStudy: fieldOfStudyId,
      createdBy: req.user._id
    });
    
    await exam.save();
    
    res.status(201).json({
      success: true,
      exam
    });
  } catch (error) {
    next(error);
  }
};
// Get all exams with field of study details
export const getAllExams = async (req, res, next) => {
    try {
      const exams = await Exam.find()
        .populate('fieldOfStudy', 'name')
        .populate('subjects', 'name')
        .select('name description fieldOfStudy subjects');
  
      res.json({
        success: true,
        data: exams
      });
    } catch (error) {
      next(error);
    }
  };
  
  // Get exams by field of study
  export const getExamsByFieldOfStudy = async (req, res, next) => {
    try {
      const { fieldOfStudyId } = req.params;
  
      const exams = await Exam.find({ fieldOfStudy: fieldOfStudyId })
        .populate('fieldOfStudy', 'name')
        .populate('subjects', 'name')
        .select('name description subjects');
  
      res.json({
        success: true,
        data: exams
      });
    } catch (error) {
      next(error);
    }
  };
  
  // Update exam
  export const updateExam = async (req, res, next) => {
    // const session = await mongoose.startSession();
    // //session.startTransaction();
  
    try {
      const { id } = req.params;
      const { name, description, fieldOfStudyId } = req.body;
  
      // Verify field of study exists
      const fieldOfStudy = await FieldOfStudy.findById(fieldOfStudyId);
      if (!fieldOfStudy) {
        throw new Error('Field of study not found');
      }
  
      // Find and update exam
      const updatedExam = await Exam.findByIdAndUpdate(
        id,
        {
          name,
          description,
          fieldOfStudy: fieldOfStudyId,
        },
        { new: true }
      ).populate('fieldOfStudy', 'name');
  
      if (!updatedExam) {
        throw new Error('Exam not found');
      }
  
      // //await session.commitTransaction();
  
      res.json({
        success: true,
        exam: updatedExam
      });
    } catch (error) {
      // //await session.abortTransaction();
      next(error);
    } finally {
      // session.endSession();

    }
  };
  
  // Delete exam and all related content
  export const deleteExam = async (req, res, next) => {
    // const session = await mongoose.startSession();
    //session.startTransaction();
  
    try {
      const { id } = req.params;
  
      // Find the exam
      const exam = await Exam.findById(id);
      if (!exam) {
        throw new Error('Exam not found');
      }
  
      // Find all subjects for this exam
      const subjects = await Subject.find({ exam: id });
      
      // Delete all related content
      for (const subject of subjects) {
        // Find and delete all topics for each subject
        const topics = await Topic.find({ _id: { $in: subject.topics } });
        
        for (const topic of topics) {
          // Delete all subtopics for each topic
          await Subtopic.deleteMany({ topic: topic._id }, {  });
        }
        
        // Delete all topics for this subject
        await Topic.deleteMany({ _id: { $in: subject.topics } }, {  });
      }
      
      // Delete all subjects for this exam
      await Subject.deleteMany({ exam: id }, {  });
      
      // Finally delete the exam
      await Exam.findByIdAndDelete(id, {  });
  
      //await session.commitTransaction();
  
      res.json({
        success: true,
        message: 'Exam and all related content deleted successfully'
      });
    } catch (error) {
      //await session.abortTransaction();
      next(error);
    } finally {
      // session.endSession();
    }
  };
// Get exam with all its subjects and their topics
export const getExamWithContent = async (req, res, next) => {
  try {
    const { examId } = req.params;
    
    const exam = await Exam.findById(examId)
      .populate({
        path: 'subjects',
        populate: {
          path: 'topics',
          populate: {
            path: 'subtopics'
          }
        }
      })
      .populate('fieldOfStudy');
      
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }
    
    res.json({
      success: true,
      exam
    });
  } catch (error) {
    next(error);
  }
};

// Subject Operations
export const createSubject = async (req, res, next) => {
  const session = await mongoose.startSession();
  //session.startTransaction();
  
  try {
    const { examId, data } = req.body;
    
    // Verify exam exists
    const exam = await Exam.findById(examId);
    if (!exam) {
      throw new Error('Exam not found');
    }
    
    const { name, description, content, isPublic = false } = data;
    
    // Create subject
    const subject = new Subject({
      name,
      description,
      content,
      exam: examId,
      isPublic,
      createdBy: req.user._id
    });
    
    await subject.save({ session });
    
    // Update exam with new subject
    await Exam.findByIdAndUpdate(
      examId,
      { $push: { subjects: subject._id } },
      { session }
    );
    
    //await session.commitTransaction();
    
    res.status(201).json({
      success: true,
      subject
    });
  } catch (error) {
    //await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};
export const getAllSubjects = async (req, res, next) => {
    try {
      const { examId } = req.query;
      const query = examId ? { exam: examId } : {};
  
      const subjects = await Subject.find(query)
        .populate('exam', 'name')
        .populate('topics', 'name')
        .select('name description content isPublic');
  
      res.json({
        success: true,
        data: subjects
      });
    } catch (error) {
      next(error);
    }
  };
  
  export const getSubjectById = async (req, res, next) => {
    try {
      const subject = await Subject.findById(req.params.id)
        .populate('exam', 'name')
        .populate({
          path: 'topics',
          populate: {
            path: 'subtopics'
          }
        });
  
      if (!subject) {
        throw new Error('Subject not found');
      }
  
      res.json({
        success: true,
        data: subject
      });
    } catch (error) {
      next(error);
    }
  };
  
  export const updateSubject = async (req, res, next) => {
    const session = await mongoose.startSession();
    //session.startTransaction();
  
    try {
      const { name, description, content, isPublic } = req.body;
      const { id } = req.params;
  
      const subject = await Subject.findByIdAndUpdate(
        id,
        { name, description, content, isPublic },
        { new: true, session }
      ).populate('exam', 'name');
  
      if (!subject) {
        throw new Error('Subject not found');
      }
  
      //await session.commitTransaction();
      res.json({
        success: true,
        data: subject
      });
    } catch (error) {
      //await session.abortTransaction();
      next(error);
    } finally {
      session.endSession();
    }
  };
  
  export const deleteSubject = async (req, res, next) => {
    const session = await mongoose.startSession();
    //session.startTransaction();
  
    try {
      const { id } = req.params;
      const subject = await Subject.findById(id);
  
      if (!subject) {
        throw new Error('Subject not found');
      }
  
      // Delete all associated topics and subtopics
      const topics = await Topic.find({ _id: { $in: subject.topics } });
      for (const topic of topics) {
        await Subtopic.deleteMany({ topic: topic._id }, { session });
      }
      await Topic.deleteMany({ _id: { $in: subject.topics } }, { session });
  
      // Remove subject from exam
      await Exam.findByIdAndUpdate(
        subject.exam,
        { $pull: { subjects: subject._id } },
        { session }
      );
  
      await Subject.findByIdAndDelete(id, { session });
      //await session.commitTransaction();
  
      res.json({
        success: true,
        message: 'Subject and related content deleted successfully'
      });
    } catch (error) {
      //await session.abortTransaction();
      next(error);
    } finally {
      session.endSession();
    }
  };
// Topic Operations
// Topic Operations
// controllers/Admin/content.js


// Create Topic
export const createTopic = async (req, res, next) => {
  const session = await mongoose.startSession();
  //session.startTransaction();
  
  try {
    const { subjectId, data } = req.body;
    const subject = await Subject.findById(subjectId).populate('exam');
    if (!subject) {
      throw new Error('Subject not found');
    }
    
    const topic = new Topic({
      name: data.name,
      content: data.content,
      isPublic: data.isPublic,
      createdBy: req.user._id
    });
    
    await topic.save({ session });
    await Subject.findByIdAndUpdate(
      subjectId,
      { $push: { topics: topic._id } },
      { session }
    );
    
    //await session.commitTransaction();
    
    const result = {
      ...topic.toObject(),
      subject: {
        _id: subject._id,
        name: subject.name,
        exam: subject.exam
      }
    };
    
    res.status(201).json({
      success: true,
      topic: result
    });
  } catch (error) {
    //await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

// Get All Topics
export const getAllTopics = async (req, res, next) => {
    try {
      const { subjectId, examId } = req.query;
      let topics = [];
  
      if (subjectId) {
        const subject = await Subject.findById(subjectId).populate('exam');
        const subjectTopics = await Topic.find({
          _id: { $in: subject.topics }
        }).populate('subtopics');
        
        topics = subjectTopics.map(topic => ({
          ...topic.toObject(),
          subject: {
            _id: subject._id,
            name: subject.name,
            exam: subject.exam
          }
        }));
      } else if (examId) {
        const subjects = await Subject.find({ exam: examId }).populate('exam');
        for (const subject of subjects) {
          const subjectTopics = await Topic.find({
            _id: { $in: subject.topics }
          }).populate('subtopics');
  
          topics.push(...subjectTopics.map(topic => ({
            ...topic.toObject(),
            subject: {
              _id: subject._id,
              name: subject.name,
              exam: subject.exam
            }
          })));
        }
      } else {
        const subjects = await Subject.find().populate('exam');
        for (const subject of subjects) {
          if (subject.topics.length > 0) {
            const subjectTopics = await Topic.find({
              _id: { $in: subject.topics }
            }).populate('subtopics');
  
            topics.push(...subjectTopics.map(topic => ({
              ...topic.toObject(),
              subject: {
                _id: subject._id,
                name: subject.name,
                exam: subject.exam
              }
            })));
          }
        }
      }
  
      res.json({
        success: true,
        data: topics
      });
    } catch (error) {
      next(error);
    }
  };

// Get Topic by ID
export const getTopicById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const topic = await Topic.findById(id).populate('subtopics');
    
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }

    // Find the subject that contains this topic
    const subject = await Subject.findOne({ 
      topics: id 
    }).populate('exam');

    const result = {
      ...topic.toObject(),
      subject: {
        _id: subject._id,
        name: subject.name,
        exam: subject.exam
      }
    };

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// Update Topic
export const updateTopic = async (req, res, next) => {
  const session = await mongoose.startSession();
  //session.startTransaction();

  try {
    const { id } = req.params;
    const { name, content, isPublic, subjectId } = req.body;

    // If changing subject, verify it exists
    if (subjectId) {
      const newSubject = await Subject.findById(subjectId);
      if (!newSubject) {
        throw new Error('Subject not found');
      }
    }

    const topic = await Topic.findById(id);
    if (!topic) {
      throw new Error('Topic not found');
    }

    // Find current subject
    const currentSubject = await Subject.findOne({ 
      topics: id 
    }).populate('exam');

    // Update topic
    const updatedTopic = await Topic.findByIdAndUpdate(
      id,
      { name, content, isPublic },
      { new: true, session }
    );

    // If changing subject, update subject references
    if (subjectId && subjectId !== currentSubject._id.toString()) {
      // Remove from old subject
      await Subject.findByIdAndUpdate(
        currentSubject._id,
        { $pull: { topics: id } },
        { session }
      );

      // Add to new subject
      await Subject.findByIdAndUpdate(
        subjectId,
        { $push: { topics: id } },
        { session }
      );
    }

    //await session.commitTransaction();

    const result = {
      ...updatedTopic.toObject(),
      subject: {
        _id: subjectId || currentSubject._id,
        name: subjectId 
          ? (await Subject.findById(subjectId)).name 
          : currentSubject.name,
        exam: currentSubject.exam
      }
    };

    res.json({
      success: true,
      topic: result
    });
  } catch (error) {
    //await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

// Delete Topic
export const deleteTopic = async (req, res, next) => {
  const session = await mongoose.startSession();
  //session.startTransaction();

  try {
    const { id } = req.params;

    // Find the topic and related subject
    const topic = await Topic.findById(id);
    if (!topic) {
      throw new Error('Topic not found');
    }

    const subject = await Subject.findOne({ topics: id });
    
    // Delete all subtopics
    await Subtopic.deleteMany({ topic: id }, { session });

    // Remove topic from subject
    await Subject.findByIdAndUpdate(
      subject._id,
      { $pull: { topics: id } },
      { session }
    );

    // Delete the topic
    await Topic.findByIdAndDelete(id, { session });

    //await session.commitTransaction();

    res.json({
      success: true,
      message: 'Topic and all related content deleted successfully'
    });
  } catch (error) {
    //await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

// Get Topics by Subject
export const getTopicsBySubject = async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    
    const subject = await Subject.findById(subjectId)
      .populate({
        path: 'topics',
        populate: {
          path: 'subtopics'
        }
      });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    const topics = subject.topics.map(topic => ({
      ...topic.toObject(),
      subject: {
        _id: subject._id,
        name: subject.name
      }
    }));

    res.json({
      success: true,
      data: topics
    });
  } catch (error) {
    next(error);
  }
};
export const getAllSubtopics = async (req, res, next) => {
    try {
      const { examId, subjectId, topicId } = req.query;
      let topics = [];
  
      if (topicId) {
        const topic = await Topic.findById(topicId);
        if (topic) {
          topics = [topic];
        }
      } else if (subjectId) {
        const subject = await Subject.findById(subjectId).populate('topics');
        if (subject) {
          topics = await Topic.find({ _id: { $in: subject.topics }});
        }
      } else if (examId) {
        const subjects = await Subject.find({ exam: examId });
        const topicIds = subjects.flatMap(s => s.topics);
        topics = await Topic.find({ _id: { $in: topicIds }});
      } else {
        topics = await Topic.find();
      }
  
      const subtopics = [];
      
      for (const topic of topics) {
        if (topic && topic.subtopics?.length > 0) {
          const topicSubtopics = await Subtopic.find({
            _id: { $in: topic.subtopics }
          });
  
          // Find subject info if exists
          const subject = await Subject.findOne({ topics: topic._id }).populate('exam');
          if (subject) {
            subtopics.push(...topicSubtopics.map(subtopic => ({
              ...subtopic.toObject(),
              topic: {
                _id: topic._id, 
                name: topic.name,
                subject: {
                  _id: subject._id, 
                  name: subject.name,
                  exam: subject.exam
                }
              }
            })));
          }
        }
      }
  
      res.json({
        success: true,
        data: subtopics
      });
    } catch (error) {
      next(error);
    }
  };
   
   export const createSubtopic = async (req, res, next) => {
    const session = await mongoose.startSession();
    //session.startTransaction();
   
    try {
      const { topicId, data } = req.body;
   
      const topic = await Topic.findById(topicId);
      if (!topic) {
        throw new Error('Topic not found');
      }
   
      // Find subject and exam info
      const subject = await Subject.findOne({ topics: topicId }).populate('exam');
   
      const subtopic = new Subtopic({
        name: data.name,
        content: data.content,
        isPublic: data.isPublic,
        topic: topicId,
        createdBy: req.user._id
      });
   
      await subtopic.save({ session });
   
      await Topic.findByIdAndUpdate(
        topicId,
        { $push: { subtopics: subtopic._id } },
        { session }
      );
   
      //await session.commitTransaction();
   
      const result = {
        ...subtopic.toObject(),
        topic: {
          _id: topic._id,
          name: topic.name,
          subject: {
            _id: subject._id,
            name: subject.name,
            exam: subject.exam
          }
        }
      };
   
      res.status(201).json({
        success: true,
        subtopic: result
      });
   
    } catch (error) {
      //await session.abortTransaction();
      next(error);
    } finally {
      session.endSession();
    }
   };
   
   export const updateSubtopic = async (req, res, next) => {
    const session = await mongoose.startSession();
    //session.startTransaction();
   
    try {
      const { id } = req.params;
      const { name, content, isPublic, topicId } = req.body;
   
      const subtopic = await Subtopic.findById(id);
      if (!subtopic) {
        throw new Error('Subtopic not found');
      }
   
      if (topicId && topicId !== subtopic.topic.toString()) {
        // Handle topic change
        const newTopic = await Topic.findById(topicId);
        if (!newTopic) {
          throw new Error('New topic not found');
        }
   
        // Remove from old topic
        await Topic.findByIdAndUpdate(
          subtopic.topic,
          { $pull: { subtopics: id } },
          { session }
        );
   
        // Add to new topic
        await Topic.findByIdAndUpdate(
          topicId,
          { $push: { subtopics: id } },
          { session }
        );
   
        subtopic.topic = topicId;
      }
   
      subtopic.name = name;
      subtopic.content = content;
      subtopic.isPublic = isPublic;
   
      await subtopic.save({ session });
   
      const topic = await Topic.findById(subtopic.topic);
      const subject = await Subject.findOne({ topics: topic._id }).populate('exam');
   
      const result = {
        ...subtopic.toObject(),
        topic: {
          _id: topic._id,
          name: topic.name,
          subject: {
            _id: subject._id,
            name: subject.name,
            exam: subject.exam
          }
        }
      };
   
      //await session.commitTransaction();
   
      res.json({
        success: true,
        subtopic: result
      });
   
    } catch (error) {
      //await session.abortTransaction();
      next(error);
    } finally {
      session.endSession();
    }
   };
   
   export const deleteSubtopic = async (req, res, next) => {
    const session = await mongoose.startSession();
    //session.startTransaction();
   
    try {
      const { id } = req.params;
      const subtopic = await Subtopic.findById(id);
      
      if (!subtopic) {
        throw new Error('Subtopic not found'); 
      }
   
      // Remove from topic
      await Topic.findByIdAndUpdate(
        subtopic.topic,
        { $pull: { subtopics: id } },
        { session }
      );
   
      await Subtopic.findByIdAndDelete(id, { session });
   
      //await session.commitTransaction();
   
      res.json({
        success: true,
        message: 'Subtopic deleted successfully'
      });
   
    } catch (error) {
      //await session.abortTransaction();
      next(error);
    } finally {
      session.endSession();
    }
   };
   
   export const getSubtopicById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const subtopic = await Subtopic.findById(id);
      
      if (!subtopic) {
        return res.status(404).json({
          success: false,
          message: 'Subtopic not found'
        });
      }
   
      const topic = await Topic.findById(subtopic.topic);
      const subject = await Subject.findOne({ topics: topic._id }).populate('exam');
   
      const result = {
        ...subtopic.toObject(),
        topic: {
          _id: topic._id,
          name: topic.name,
          subject: {
            _id: subject._id,
            name: subject.name,
            exam: subject.exam
          }
        }
      };
   
      res.json({
        success: true,
        data: result
      });
   
    } catch (error) {
      next(error);
    }
   };
// Batch creation operations
export const createSubjectWithTopicsAndSubtopics = async (req, res, next) => {
  const session = await mongoose.startSession();
  //session.startTransaction();
  
  try {
    const { examId, subjectData, topics } = req.body;
    
    // Validate exam exists
    const examExists = await Exam.findById(examId);
    if (!examExists) {
      throw new Error('Exam not found');
    }

    // Create subject first
    const subject = await Subject.create([{
      ...subjectData,
      exam: examId,
      createdBy: req.user._id
    }], { session });

    let createdTopics = [];
    
    // Create topics and their subtopics
    if (topics && topics.length > 0) {
      for (const topicData of topics) {
        // Extract subtopics from topic data
        const { subtopics, ...topicFields } = topicData;
        
        // Create the topic
        const [topic] = await Topic.create([{
          ...topicFields,
          createdBy: req.user._id
        }], { session });

        // Create subtopics if they exist
        if (subtopics && subtopics.length > 0) {
          const createdSubtopics = await Subtopic.create(
            subtopics.map(subtopic => ({
              ...subtopic,
              topic: topic._id,
              createdBy: req.user._id
            })),
            { session }
          );

          // Update topic with subtopic ids
          const subtopicIds = createdSubtopics.map(subtopic => subtopic._id);
          await Topic.findByIdAndUpdate(
            topic._id,
            { $push: { subtopics: { $each: subtopicIds } } },
            { session }
          );

          // Add subtopics to topic object for response
          topic.subtopics = createdSubtopics;
        }

        createdTopics.push(topic);
      }

      // Update subject with topic ids
      const topicIds = createdTopics.map(topic => topic._id);
      await Subject.findByIdAndUpdate(
        subject[0]._id,
        { $push: { topics: { $each: topicIds } } },
        { session }
      );
    }
    
    // Update exam with new subject
    await Exam.findByIdAndUpdate(
      examId,
      { $push: { subjects: subject[0]._id } },
      { session }
    );
    
    //await session.commitTransaction();

    // Fetch the complete subject with populated topics and subtopics
    const populatedSubject = await Subject.findById(subject[0]._id)
      .populate({
        path: 'topics',
        populate: {
          path: 'subtopics'
        }
      });
    
    res.status(201).json({
      success: true,
      subject: populatedSubject
    });
  } catch (error) {
    //await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

export const createTopicWithSubtopics = async (req, res, next) => {
  const session = await mongoose.startSession();
  //session.startTransaction();
  
  try {
    const { subjectId, topicData, subtopics } = req.body;
    
    // Create topic first
    const topic = await Topic.create([{
      ...topicData,
      createdBy: req.user._id
    }], { session });
    
    // Create subtopics and link them to the topic
    if (subtopics && subtopics.length > 0) {
      const createdSubtopics = await Subtopic.create(
        subtopics.map(subtopic => ({
          ...subtopic,
          topic: topic[0]._id,
          createdBy: req.user._id
        })),
        { session }
      );
      
      const subtopicIds = createdSubtopics.map(subtopic => subtopic._id);
      
      // Update topic with subtopic ids
      await Topic.findByIdAndUpdate(
        topic[0]._id,
        { $push: { subtopics: { $each: subtopicIds } } },
        { session }
      );
    }
    
    // Update subject with new topic
    await Subject.findByIdAndUpdate(
      subjectId,
      { $push: { topics: topic[0]._id } },
      { session }
    );
    
    //await session.commitTransaction();
    
    res.status(201).json({
      success: true,
      topic: topic[0]
    });
  } catch (error) {
    //await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

export const createAuditEntry = async (req, res, next) => {
  try {
    const { type, content } = req.body;
    const userId = '67ae656589aab1ab787e67b8';

    const auditEntry = new ContentAudit({
      type,
      content,
      userId,
      status: 'in_progress'
    });

    await auditEntry.save();

    if (type === 'generate') {
      try {
        const aiResponse = await generateContent(content);
        const updatedAudit = await ContentAudit.findByIdAndUpdate(
          auditEntry._id,
          {
            aiResponse,
            status: 'completed',
            completedAt: new Date()
          },
          { new: true }
        );

        // Parse and update content immediately after AI response
        // await parseAndUpdateContent(updatedAudit._id);
      } catch (error) {
        await ContentAudit.findByIdAndUpdate(auditEntry._id, {
          status: 'failed',
          error: error.message
        });
        throw error;
      }
    }

    res.status(201).json({
      success: true,
      message: type === 'generate' ? 'Content generation started' : 'Content submitted',
      auditId: auditEntry._id
    });
  } catch (error) {
    next(error);
  }
};

export const getAuditEntries = async (req, res, next) => {
  try {
    const entries = await ContentAudit.find({ userId: '67972478bb2d9e30aa9b3e26' })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email');

    res.json({
      success: true,
      data: entries
    });
  } catch (error) {
    next(error);
  }
};
export const updateContentAuditController = async (req, res, next) => {
  try {
    const { auditId } = req.params;
    console.log(auditId,"auditId")
    await parseAndUpdateContent(auditId);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const getAuditEntry = async (req, res, next) => {
  try {
    const entry = await ContentAudit.findById(req.params.id)
      .populate('userId', 'name email');

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Audit entry not found'
      });
    }

    res.json({
      success: true,
      data: entry
    });
  } catch (error) {
    next(error);
  }
};