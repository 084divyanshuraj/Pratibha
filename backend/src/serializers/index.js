/**
 * Serializers to enforce data transfer object (DTO) boundaries.
 * Prevents leaking Mongoose internal fields (__v), database implementation details,
 * and sensitive security fields (e.g. passwordHash).
 */

/**
 * Format a User document to a safe public DTO.
 * Guarantees passwordHash is excluded.
 */
export function toUserDTO(userDoc) {
  if (!userDoc) return null;
  const doc = userDoc.toObject ? userDoc.toObject() : { ...userDoc };

  return {
    id: doc._id?.toString() || doc.id,
    email: doc.email,
    displayName: doc.displayName,
    role: doc.role,
    studentId: doc.studentId || null,
    isActive: doc.isActive !== false,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

/**
 * Format a Student document to an API DTO.
 */
export function toStudentDTO(studentDoc) {
  if (!studentDoc) return null;
  const doc = studentDoc.toObject ? studentDoc.toObject() : { ...studentDoc };

  return {
    id: doc._id?.toString() || doc.id,
    studentId: doc.studentId,
    firstName: doc.firstName,
    lastName: doc.lastName,
    fullName: `${doc.firstName} ${doc.lastName}`.trim(),
    institutionId: doc.institutionId || 'INST_MAIN',
    department: doc.department,
    program: doc.program,
    semester: doc.semester,
    cohort: doc.cohort || null,
    enrollmentYear: doc.enrollmentYear,
    status: doc.status || 'active',
    email: doc.email || null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

/**
 * Generic clean document serializer that strips internal Mongoose keys (__v)
 * and never leaks passwordHash.
 */
export function toCleanDTO(rawDoc) {
  if (!rawDoc) return null;
  const doc = rawDoc.toObject ? rawDoc.toObject() : { ...rawDoc };

  delete doc.__v;
  delete doc.passwordHash;

  if (doc._id) {
    doc.id = doc._id.toString();
    delete doc._id;
  }

  return doc;
}

export default {
  toUserDTO,
  toStudentDTO,
  toCleanDTO,
};
