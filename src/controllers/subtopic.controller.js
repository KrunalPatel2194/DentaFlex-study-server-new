// src/controllers/subtopic.controller.js
import Subtopic from '../models/subTopic.model.js';
import Topic from '../models/topic.model.js';

export const createSubtopic = async (req, res) => {
    try {
      const { name, topicId, createdBy } = req.body;
  
      // Create a new subtopic
      const subtopic = new Subtopic({
        name,
        topic: topicId,
        createdBy,
      });
  
      const savedSubtopic = await subtopic.save();
  
      // Link the subtopic to the parent topic
      const updatedTopic = await Topic.findByIdAndUpdate(
        topicId,
        { $push: { subtopics: savedSubtopic._id } },
        { new: true } // Return the updated topic
      );
  
      if (!updatedTopic) {
        return res.status(404).json({ message: 'Topic not found' });
      }
  
      res.status(201).json({ message: 'Subtopic created successfully', subtopic: savedSubtopic });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };

export const getSubtopicsByTopic = async (req, res, next) => {
  try {
    const { topicId } = req.params;
    const subtopics = await Subtopic.find({ topic: topicId });
    res.status(200).json(subtopics);
  } catch (error) {
    next(error);
  }
};
