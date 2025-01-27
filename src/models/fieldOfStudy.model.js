// models/FieldOfStudy.js
import mongoose from 'mongoose';

const fieldOfStudySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
});

const FieldOfStudy = mongoose.model('FieldOfStudy', fieldOfStudySchema);

export default FieldOfStudy;
