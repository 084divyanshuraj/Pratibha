import {
  listStudents,
  createStudent,
  getStudentById,
  updateStudent,
  getStudentRecords,
} from './student.service.js';

export async function listStudentsHandler(req, res, next) {
  try {
    const result = await listStudents(req.query);
    res.status(200).json({
      success: true,
      data: result,
      meta: {
        requestId: req.id,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function createStudentHandler(req, res, next) {
  try {
    const student = await createStudent(req.body);
    res.status(201).json({
      success: true,
      data: student,
      meta: {
        requestId: req.id,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getStudentByIdHandler(req, res, next) {
  try {
    const student = await getStudentById(req.params.studentId);
    res.status(200).json({
      success: true,
      data: student,
      meta: {
        requestId: req.id,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateStudentHandler(req, res, next) {
  try {
    const student = await updateStudent(req.params.studentId, req.body);
    res.status(200).json({
      success: true,
      data: student,
      meta: {
        requestId: req.id,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getStudentRecordsHandler(req, res, next) {
  try {
    const recordsData = await getStudentRecords(req.params.studentId, req.user);
    res.status(200).json({
      success: true,
      data: recordsData,
      meta: {
        requestId: req.id,
      },
    });
  } catch (err) {
    next(err);
  }
}

export default {
  listStudentsHandler,
  createStudentHandler,
  getStudentByIdHandler,
  updateStudentHandler,
  getStudentRecordsHandler,
};
