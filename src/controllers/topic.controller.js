// src/controllers/topic.controller.js
import Subject from '../models/subject.model.js';
import Topic from '../models/topic.model.js';

export const createTopic = async (req, res) => {
    try {
      const { name, subjectId, createdBy } = req.body;
  
      // Create a new topic
      const topic = new Topic({
        name,
        subject: subjectId,
        createdBy,
      });
  
      const savedTopic = await topic.save();
  
      // Link the topic to the parent subject
      const updatedSubject = await Subject.findByIdAndUpdate(
        subjectId,
        { $push: { topics: savedTopic._id } },
        { new: true } // Return the updated subject
      );
  
      if (!updatedSubject) {
        return res.status(404).json({ message: 'Subject not found' });
      }
  
      res.status(201).json({ message: 'Topic created successfully', topic: savedTopic });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };

export const getTopicsBySubject = async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    const topics = await Topic.find({ subject: subjectId }).populate('subtopics');
    res.status(200).json(topics);
  } catch (error) {
    next(error);
  }
};
