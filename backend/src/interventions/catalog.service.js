import { InterventionCatalog } from '../models/InterventionCatalog.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * List all intervention catalog entries
 *
 * @param {Object} options
 * @param {boolean} [options.activeOnly=false]
 * @returns {Promise<Array>}
 */
export async function listCatalog({ activeOnly = false } = {}) {
  const query = activeOnly ? { active: true } : {};
  return InterventionCatalog.find(query).sort({ name: 1 }).lean();
}

/**
 * Retrieve a single intervention catalog entry by interventionType
 *
 * @param {string} interventionType
 * @returns {Promise<Object>}
 */
export async function getCatalogEntry(interventionType) {
  if (!interventionType || typeof interventionType !== 'string') {
    throw new AppError('interventionType is required.', 400, 'VALIDATION_ERROR');
  }

  const entry = await InterventionCatalog.findOne({
    interventionType: interventionType.toLowerCase().trim(),
  }).lean();

  if (!entry) {
    throw new AppError(
      `Intervention type '${interventionType}' not found in catalog.`,
      404,
      'NOT_FOUND'
    );
  }

  return entry;
}

/**
 * Upsert an intervention catalog entry (Admin only)
 *
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export async function upsertCatalogEntry(data = {}) {
  if (!data.interventionType || typeof data.interventionType !== 'string') {
    throw new AppError('interventionType is required.', 400, 'VALIDATION_ERROR');
  }
  if (!data.name || typeof data.name !== 'string') {
    throw new AppError('name is required.', 400, 'VALIDATION_ERROR');
  }
  if (!data.description || typeof data.description !== 'string') {
    throw new AppError('description is required.', 400, 'VALIDATION_ERROR');
  }

  const interventionType = data.interventionType.toLowerCase().trim();

  const updateDoc = {
    interventionType,
    name: data.name.trim(),
    description: data.description.trim(),
    eligibilityRules: data.eligibilityRules || {},
    capacityUnit: data.capacityUnit || 'seats',
    costUnits: data.costUnits != null ? Number(data.costUnits) : 0,
    durationDays: data.durationDays != null ? Number(data.durationDays) : 30,
    active: data.active !== undefined ? Boolean(data.active) : true,
    version: data.version || 'v1',
  };

  const updated = await InterventionCatalog.findOneAndUpdate(
    { interventionType },
    { $set: updateDoc },
    { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true }
  );

  return updated.toObject();
}
