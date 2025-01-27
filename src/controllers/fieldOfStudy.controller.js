// src/controllers/fieldOfStudy.controller.js
import { getAllFields, getFieldById, createField, addExamToField, getFieldByName } from '../services/fieldOfStudy.service.js';

export const getFields = async (req, res, next) => {
  try {
    const fields = await getAllFields();
    res.json(fields);
  } catch (error) {
    next(error);
  }
};

export const getFieldDetails = async (req, res, next) => {
  try {
    const field = await getFieldById(req.params.id);
    if (!field) return res.status(404).json({ message: 'Field not found' });
    res.json(field);
  } catch (error) {
    next(error);
  }
};
export const getFieldThroughName = async (req, res, next) => {
    try {
      const field = await getFieldByName(req.params.name);
      if (!field) return res.status(404).json({ message: 'Field not found' });
      res.json(field);
    } catch (error) {
      next(error);
    }
  };

export const createNewField = async (req, res, next) => {
  try {
    const { name, exams } = req.body;
    const field = await createField(name, exams);
    res.status(201).json(field);
  } catch (error) {
    next(error);
  }
};

export const addExam = async (req, res, next) => {
  try {
    const { fieldId, examName } = req.body;
    const field = await addExamToField(fieldId, examName);
    res.json(field);
  } catch (error) {
    next(error);
  }
};


export const getExamsByFieldId = async (req, res) => {
  try {
    const { fieldId } = req.params;

    // Find the field of study by ID
    const field = await FieldOfStudy.findById(fieldId).select('exams');
    if (!field) {
      return res.status(404).json({ message: 'Field of Study not found' });
    }

    // Return the exams
    res.status(200).json(field.exams);
  } catch (error) {
    console.error('Error fetching exams:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};
