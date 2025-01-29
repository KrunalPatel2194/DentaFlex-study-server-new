// controllers/admin.controller.js

import { AuthError } from '../../middleware/error.js';
import Exam from '../../models/exam.model.js';
// import FieldOfStudy from '../../models/fieldOfStudy.model.js';

// Get all fields of study with pagination and search
// export const getAllFieldsOfStudy = async (req, res, next) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const search = req.query.search || '';
//     const skip = (page - 1) * limit;

//     // Create search query
//     const searchQuery = search
//       ? {
//           name: { $regex: search, $options: 'i' }
//         }
//       : {};

//     // Get total count for pagination
//     const total = await FieldOfStudy.countDocuments(searchQuery);

//     // Get paginated and filtered results
//     const fieldsOfStudy = await FieldOfStudy.find(searchQuery)
//       .skip(skip)
//       .limit(limit)
//       .sort({ createdAt: -1 });

//     res.json({
//       success: true,
//       data: fieldsOfStudy,
//       pagination: {
//         total,
//         page,
//         totalPages: Math.ceil(total / limit)
//       }
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// Create new field of study
export const createExam = async (req, res, next) => {
  try {
    const { name, status } = req.body;

    if (!name) {
      throw new AuthError('Name is required');
    }

    // Check if field of study already exists
    const existing = await Exam.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });

    if (existing) {
      throw new AuthError('Field of study already exists');
    }

    const exam = new Exam({
      name,
      status: status || 'Active'
    });

    await exam.save();

    res.status(201).json({
      success: true,
      data: exam
    });
  } catch (error) {
    next(error);
  }
};

// Update field of study
// export const updateFieldOfStudy = async (req, res, next) => {
//   try {

//     console.log("rewquests",req.params)
//     const { Id } = req.params;
//     const { name, status } = req.body;

//     if (!name) {
//       throw new AuthError('Name is required');
//     }

//     // Check if new name already exists for different field
//     const existing = await FieldOfStudy.findOne({
//       _id: { $ne: Id },
//       name: { $regex: new RegExp(`^${name}$`, 'i') }
//     });

//     if (existing) {
//       throw new AuthError('Field of study with this name already exists');
//     }

//     const fieldOfStudy = await FieldOfStudy.findByIdAndUpdate(
//       Id,
//       { name, status },
//       { new: true }
//     );

//     if (!fieldOfStudy) {
//       throw new AuthError('Field of study not found');
//     }

//     res.json({
//       success: true,
//       data: fieldOfStudy
//     });
//   } catch (error) {
//     next(error);
//   }
// };


// Delete field of study
// export const deleteFieldOfStudy = async (req, res, next) => {
//   try {
//     const { id } = req.params;

//     const fieldOfStudy = await FieldOfStudy.findByIdAndDelete(id);

//     if (!fieldOfStudy) {
//       throw new AuthError('Field of study not found');
//     }

//     res.json({
//       success: true,
//       message: 'Field of study deleted successfully'
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // Get single field of study
// export const getFieldOfStudy = async (req, res, next) => {
//   try {
//     const { id } = req.params;

//     const fieldOfStudy = await FieldOfStudy.findById(id);

//     if (!fieldOfStudy) {
//       throw new AuthError('Field of study not found');
//     }

//     res.json({
//       success: true,
//       data: fieldOfStudy
//     });
//   } catch (error) {
//     next(error);
//   }
// };