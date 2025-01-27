// src/routes/fieldOfStudy.routes.js
import express from 'express';
import {
  getFields,
  getFieldDetails,
  createNewField,
  addExam,
  getFieldThroughName
} from '../controllers/fieldOfStudy.controller.js';

const router = express.Router();

router.get('/', getFields);
router.get('/:id', getFieldDetails);
router.post('/', createNewField);
router.post('/exam', addExam);
// router.get('/:name',getFieldThroughName);

export default router;
