// src/services/fieldOfStudy.service.js
import FieldOfStudy from '../models/fieldOfStudy.model.js';

export const getAllFields = async () => {
  return await FieldOfStudy.find();
};

export const getFieldById = async (id) => {
  return await FieldOfStudy.findById(id);
};

export const createField = async (name, exams) => {
  const field = new FieldOfStudy({ name, exams });
  return await field.save();
};

export const addExamToField = async (fieldId, examName) => {
  const field = await FieldOfStudy.findById(fieldId);
  if (!field) throw new Error('Field of Study not found');
  field.exams.push({ name: examName });
  return await field.save();
};
export const getFieldByName = async (name) => {
    return await FieldOfStudy.findOne({ name });
  };