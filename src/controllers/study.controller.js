// src/controllers/studyContent.controller.js
import Subject from '../models/subject.model.js';
import Topic from '../models/topic.model.js';
import Subtopic from '../models/subTopic.model.js';
import Exam from '../models/exam.model.js';
import FieldOfStudy from '../models/fieldOfStudy.model.js';
import Test from '../models/tests.model.js';
import { Subscription } from '../models/subscriptions/subscription.model.js';

// export const getStudyContent = async (req, res) => {
//   try {
//     const { subjectId } = req.params;

//     // Fetch subject with its topics and subtopics
//     const subject = await Subject.findById(subjectId)
//       .select('_id name description')
//       .populate({
//         path: 'topics',
//         select: '_id name content',
//         populate: {
//           path: 'subtopics',
//           select: '_id name content'
//         }
//       });

//     if (!subject) {
//       return res.status(404).json({ message: 'Subject not found' });
//     }

//     // Transform the data to include content and maintain hierarchy
//     const transformedData = {
//       subject: {
//         _id: subject._id,
//         name: subject.name,
//         description: subject.description,
//         topics: subject.topics.map(topic => ({
//           _id: topic._id,
//           name: topic.name,
//           content: topic.content,
//           subtopics: topic.subtopics.map(subtopic => ({
//             _id: subtopic._id,
//             name: subtopic.name,
//             content: subtopic.content
//           }))
//         }))
//       }
//     };

//     res.json(transformedData);
//   } catch (error) {
//     console.error('Error fetching study content:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };
export const getSubjectContent = async (req, res) => {
  try {
    const { subjectId } = req.params;

    const subject = await Subject.findById(subjectId)
      .select('_id name description content');
    console.log(subject,"subject")
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const transformedData = {
      subject: {
        _id: subject._id,
        name: subject.name,
        description: subject.description,
        content: subject.content
      }
    };

    res.json(transformedData);
  } catch (error) {
    console.error('Error fetching subject content:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
export const getTopicWithContent = async (req, res) => {
  try {
    const { topicId } = req.params;
    console.log(topicId ,"topicID")
    // Fetch only the topic with minimal required data
    const topic = await Topic.findById(topicId)
      .select('_id name content subject')
      console.log(topic,"topic")
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    const transformedData = {
      topic: {
        _id: topic._id,
        name: topic.name,
        content: topic.content
      }
    };

    res.json(transformedData);
  } catch (error) {
    console.error('Error fetching topic content:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getSubtopicContent = async (req, res) => {
  try {
    const { subtopicId } = req.params;

    // Fetch the subtopic with its topic reference
    const subtopic = await Subtopic.findById(subtopicId)
      .select('_id name content topic')
      .populate('topic', '_id name');

    if (!subtopic) {
      return res.status(404).json({ message: 'Subtopic not found' });
    }
    console.log(subtopic ,"SUBTOPIC")
    // Return the response with just the topic information we have
    res.json({
      subtopic: {
        _id: subtopic._id,
        name: subtopic.name,
        content: subtopic.content,
        topic: {
          _id: subtopic.topic._id,
          name: subtopic.topic.name
        }
      }
    });
  } catch (error) {
    console.error('Error fetching subtopic content:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
// src/controllers/examContent.controller.js
// controllers/examStructure.controller.js
export const getCompleteExamStructure = async (req, res) => {
    try {
      const { examId } = req.params;
  
      // Fetch the exam with all related data, using only inclusions in select
      const exam = await Exam.findById(examId)
        .select('_id name description fieldOfStudy')
        .populate({
          path: 'fieldOfStudy',
          select: '_id name'
        })
        .populate({
          path: 'subjects',
          select: '_id name description createdAt',
          options: { sort: { createdAt: 1 } },
          populate: [
            {
              path: 'topics',
              select: '_id name content createdAt',
              options: { sort: { createdAt: 1 } },
              populate: [
                {
                  path: 'subtopics',
                  select: '_id name content createdAt',
                  options: { sort: { createdAt: 1 } }
                },
                {
                  path: 'createdBy',
                  select: '_id name email'
                }
              ]
            },
            {
              path: 'createdBy',
              select: '_id name email'
            }
          ]
        });
  
      if (!exam) {
        return res.status(404).json({ message: 'Exam not found' });
      }
  
      // Transform the data to create a structured response with complete content
      const transformedData = {
        exam: {
          _id: exam._id,
          name: exam.name,
          description: exam.description,
          fieldOfStudy: {
            _id: exam.fieldOfStudy._id,
            name: exam.fieldOfStudy.name
          },
          subjects: exam.subjects.map(subject => ({
            _id: subject._id,
            name: subject.name,
            description: subject.description,
            createdAt: subject.createdAt,
            createdBy: subject.createdBy ? {
              _id: subject.createdBy._id,
              name: subject.createdBy.name,
              email: subject.createdBy.email
            } : null,
            topics: subject.topics.map(topic => ({
              _id: topic._id,
              name: topic.name,
              content: topic.content,
              createdAt: topic.createdAt,
              createdBy: topic.createdBy ? {
                _id: topic.createdBy._id,
                name: topic.createdBy.name,
                email: topic.createdBy.email
              } : null,
              subtopics: topic.subtopics.map(subtopic => ({
                _id: subtopic._id,
                name: subtopic.name,
                content: subtopic.content,
                createdAt: subtopic.createdAt
              }))
            }))
          }))
        }
      };
  
      // Add study metadata with content information
      const metadata = {
        totalSubjects: exam.subjects.length,
        subjectDetails: exam.subjects.map(subject => ({
          subjectId: subject._id,
          subjectName: subject.name,
          totalTopics: subject.topics.length,
          totalSubtopics: subject.topics.reduce((acc, topic) => acc + topic.subtopics.length, 0),
          contentStatus: {
            topicsWithContent: subject.topics.filter(topic => topic.content && topic.content.length > 0).length,
            subtopicsWithContent: subject.topics.reduce((acc, topic) => 
              acc + topic.subtopics.filter(subtopic => subtopic.content && subtopic.content.length > 0).length, 0
            )
          },
          topics: subject.topics.map(topic => ({
            topicId: topic._id,
            topicName: topic.name,
            hasContent: topic.content && topic.content.length > 0,
            contentLength: topic.content ? topic.content.length : 0,
            totalSubtopics: topic.subtopics.length,
            subtopicsWithContent: topic.subtopics.filter(subtopic => 
              subtopic.content && subtopic.content.length > 0
            ).length
          }))
        }))
      };
  
      // Add navigation helpers with content status and preview
      const navigation = {
        subjects: exam.subjects.map(subject => ({
          _id: subject._id,
          name: subject.name,
          firstContentItem: getFirstContentItem(subject),
          lastContentItem: getLastContentItem(subject),
          topics: subject.topics.map(topic => ({
            _id: topic._id,
            name: topic.name,
            hasContent: topic.content && topic.content.length > 0,
            contentPreview: topic.content ? topic.content.substring(0, 100) : null,
            subtopics: topic.subtopics.map(st => ({
              _id: st._id,
              name: st.name,
              hasContent: st.content && st.content.length > 0,
              contentPreview: st.content ? st.content.substring(0, 100) : null
            }))
          }))
        }))
      };
  
      res.json({
        ...transformedData,
        metadata,
        navigation
      });
    } catch (error) {
      console.error('Error fetching complete exam structure:', error);
      res.status(500).json({ 
        message: 'Server error',
        error: error.message 
      });
    }
  };
  
  // Helper functions remain the same
  const getFirstContentItem = (subject) => {
    const firstTopicWithContent = subject.topics.find(topic => 
      topic.content && topic.content.length > 0
    );
    
    if (firstTopicWithContent) {
      return {
        type: 'topic',
        _id: firstTopicWithContent._id,
        name: firstTopicWithContent.name,
        contentPreview: firstTopicWithContent.content.substring(0, 100)
      };
    }
  
    for (const topic of subject.topics) {
      const firstSubtopicWithContent = topic.subtopics.find(st => 
        st.content && st.content.length > 0
      );
      if (firstSubtopicWithContent) {
        return {
          type: 'subtopic',
          _id: firstSubtopicWithContent._id,
          name: firstSubtopicWithContent.name,
          contentPreview: firstSubtopicWithContent.content.substring(0, 100),
          parentTopic: {
            _id: topic._id,
            name: topic.name
          }
        };
      }
    }
  
    return null;
  };
  
  const getLastContentItem = (subject) => {
    const topicsWithContent = subject.topics.filter(topic => 
      topic.content && topic.content.length > 0
    );
    const lastTopicWithContent = topicsWithContent[topicsWithContent.length - 1];
  
    if (lastTopicWithContent) {
      return {
        type: 'topic',
        _id: lastTopicWithContent._id,
        name: lastTopicWithContent.name,
        contentPreview: lastTopicWithContent.content.substring(0, 100)
      };
    }
  
    for (const topic of [...subject.topics].reverse()) {
      const subtopicsWithContent = topic.subtopics.filter(st => 
        st.content && st.content.length > 0
      );
      const lastSubtopicWithContent = subtopicsWithContent[subtopicsWithContent.length - 1];
      
      if (lastSubtopicWithContent) {
        return {
          type: 'subtopic',
          _id: lastSubtopicWithContent._id,
          name: lastSubtopicWithContent.name,
          contentPreview: lastSubtopicWithContent.content.substring(0, 100),
          parentTopic: {
            _id: topic._id,
            name: topic.name
          }
        };
      }
    }
  
    return null;
  };
  // Helper function to get exam progress (can be extended based on your needs)
  export const getExamProgress = async (req, res) => {
    try {
      const { examId } = req.params;
      const { userId } = req.user; // Assuming you have user info in request
  
      const exam = await Exam.findById(examId).populate({
        path: 'subjects',
        populate: {
          path: 'topics',
          populate: {
            path: 'subtopics'
          }
        }
      });
  
      if (!exam) {
        return res.status(404).json({ message: 'Exam not found' });
      }
  
      // Calculate total content items
      const totalItems = {
        subjects: exam.subjects.length,
        topics: exam.subjects.reduce((acc, subject) => acc + subject.topics.length, 0),
        subtopics: exam.subjects.reduce((acc, subject) => 
          acc + subject.topics.reduce((tacc, topic) => tacc + topic.subtopics.length, 0), 0)
      };
  
      res.json({
        examId: exam._id,
        totalItems,
        // Add more progress-related data as needed
      });
    } catch (error) {
      console.error('Error fetching exam progress:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  // study.controller.js

export const getExamHierarchy = async (req, res) => {
  try {
      const { fieldOfStudy, examName } = req.params;
      const userId = req.userId;

      // Find field and exam
      const field = await FieldOfStudy.findOne({ name: fieldOfStudy });
      if (!field) return res.status(404).json({ message: 'Field not found' });

      const exam = await Exam.findOne({ 
          fieldOfStudy: field._id,
          name: examName 
      });
      if (!exam) return res.status(404).json({ message: 'Exam not found' });

      // Check subscription with exact exam ID
      const subscription = await Subscription.findOne({
          userId,
          examId: exam._id,
          status: 'active',
          expiryDate: { $gt: new Date() }
      });

      console.log('Found subscription:', subscription); // Debug log

      const tests = await Test.find({ exam: exam._id });
      const mockTests = tests
          .filter(test => test.type === 'mock-test')
          .map(test => ({
              _id: test._id,
              name: test.name,
              locked: !subscription || !['mock_access', 'full_access'].includes(subscription.type)
          }));
      
      const selfAssessments = tests
          .filter(test => test.type === 'self-assessment')
          .map(test => ({
              _id: test._id,
              name: test.name
          }));

      const subjects = await Subject.find({ exam: exam._id }).lean();
      
      const subjectsWithTopics = await Promise.all(subjects.map(async (subject) => {
          const isLocked = !subject.isPublic && (!subscription || 
              !['content_only', 'full_access'].includes(subscription.type));

          const topics = await Topic.find({ _id: { $in: subject.topics } })
              .select('_id name isPublic')
              .lean();
          
          const topicsWithSubtopics = await Promise.all(topics.map(async (topic) => {
              const subtopics = await Subtopic.find({ topic: topic._id })
                  .select('_id name isPublic')
                  .lean();
              
              return {
                  ...topic,
                  locked: !topic.isPublic && isLocked,
                  subtopics: subtopics.map(subtopic => ({
                      ...subtopic,
                      locked: !subtopic.isPublic && isLocked
                  }))
              };
          }));
          
          return {
              ...subject,
              locked: isLocked,
              topics: topicsWithSubtopics
          };
      }));

      res.json({
          examId: exam._id,
          subscriptionStatus: subscription?.type || null,
          sideBarContent: [
              {
                  type: 'mock-test',
                  selfContent: mockTests
              },
              {
                  type: 'self-assessment',
                  selfContent: selfAssessments
              },
              {
                  type: 'Subjects',
                  selfContent: subjectsWithTopics
              }
          ]
      });
  } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: error.message });
  }
};
export const getMockTest = async (req, res) => {
  try {
    const { mockTestId } = req.params;
    
    if (!mockTestId) {
      return res.status(400).json({ message: 'Mock test ID is required' });
    }

    const mockTest = await Test.findOne({
      _id: mockTestId,
      type: 'mock-test'
    })
    .select('_id name questions createdAt createdBy')
    .populate('createdBy', '_id name email');

    if (!mockTest) {
      return res.status(404).json({ message: 'Mock test not found' });
    }

    const transformedData = {
      mockTest: {
        _id: mockTest._id,
        name: mockTest.name,
        totalQuestions: mockTest.questions.length,
        questions: mockTest.questions,
        createdAt: mockTest.createdAt,
        createdBy: mockTest.createdBy ? {
          _id: mockTest.createdBy._id,
          name: mockTest.createdBy.name,
          email: mockTest.createdBy.email
        } : null
      }
    };

    res.json(transformedData);
  } catch (error) {
    console.error('Error fetching mock test:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const getSelfAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;

    if (!assessmentId) {
      return res.status(400).json({ message: 'Assessment ID is required' });
    }

    const selfAssessment = await Test.findOne({
      _id: assessmentId,
      type: 'self-assessment'
    })
    .select('_id name questions createdAt createdBy')
    .populate('createdBy', '_id name email');

    if (!selfAssessment) {
      return res.status(404).json({ message: 'Self assessment not found' });
    }

    const transformedData = {
      selfAssessment: {
        _id: selfAssessment._id,
        name: selfAssessment.name,
        totalQuestions: selfAssessment.questions.length,
        questions: selfAssessment.questions,
        createdAt: selfAssessment.createdAt,
        createdBy: selfAssessment.createdBy ? {
          _id: selfAssessment.createdBy._id,
          name: selfAssessment.createdBy.name,
          email: selfAssessment.createdBy.email
        } : null
      }
    };

    res.json(transformedData);
  } catch (error) {
    console.error('Error fetching self assessment:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};