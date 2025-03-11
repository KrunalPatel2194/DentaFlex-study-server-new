// contentParser.js
import mongoose from 'mongoose';

export const parseAndUpdateContent = async (auditId) => {
    try {
      const audit = await mongoose.model('ContentAudit').findById(auditId);
      if (!audit?.aiResponse) return null;
  
      // Parse AI response into subtopic content map
      const contentMap = {};
      let currentSubtopic = '';
      
      audit.aiResponse.split('\n').forEach(line => {
        if (line.trim().startsWith('1.') || line.trim().startsWith('2.') || 
            line.trim().startsWith('3.') || line.trim().startsWith('4.') || 
            line.trim().startsWith('5.')) {
          currentSubtopic = line.split('.')[1].trim();
          contentMap[currentSubtopic] = [];
        } else if (currentSubtopic && line.trim().startsWith('-')) {
          contentMap[currentSubtopic].push(line.trim());
        }
      });
  
      // Update topics and their subtopics
      const updatedTopics = audit.content.topics.map(topic => ({
        ...topic,
        subtopics: topic.subtopics.map(subtopic => ({
          ...subtopic,
          content: contentMap[subtopic.name] ? contentMap[subtopic.name].join('\n') : subtopic.content
        }))
      }));
  
      // Update the document
      const result = await mongoose.model('ContentAudit').findByIdAndUpdate(
        auditId,
        { 'content.topics': updatedTopics },
        { new: true }
      );
  
      return result;
    } catch (error) {
      console.error('Content parsing error:', error);
      throw error;
    }
  };

  