import { SimulationScenario } from '../models/SimulationScenario.js';
import { InterventionCatalog } from '../models/InterventionCatalog.js';
import { Intervention } from '../models/Intervention.js';
import { Student } from '../models/Student.js';
import { AcademicRecord } from '../models/AcademicRecord.js';
import { AttendanceRecord } from '../models/AttendanceRecord.js';
import { PlacementAssessment } from '../models/PlacementAssessment.js';
import { StudentScore } from '../models/StudentScore.js';
import { RiskPrediction } from '../models/RiskPrediction.js';
import { runAllocationSimulation } from './simulation.engine.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Gather performance metric snapshots for cohort students
 *
 * @param {Array<string>} studentIds
 * @returns {Promise<Map<string, Object>>}
 */
async function gatherCohortSnapshots(studentIds) {
  const snapshotMap = new Map();
  for (const id of studentIds) {
    snapshotMap.set(id, {
      studentId: id,
      cgpa: null,
      backlogs: 0,
      attendancePercentage: null,
      placementScore: null,
      successScore: null,
      academicRisk: null,
      placementRisk: null,
    });
  }

  if (studentIds.length === 0) {
    return snapshotMap;
  }

  const [academicAgg, attendanceAgg, placementAgg, scoresAgg, riskAgg] =
    await Promise.all([
      AcademicRecord.aggregate([
        { $match: { studentId: { $in: studentIds } } },
        { $sort: { studentId: 1, observedAt: -1, createdAt: -1 } },
        {
          $group: {
            _id: '$studentId',
            cgpa: { $first: '$cgpa' },
            backlog: { $first: '$backlog' },
            backlogsCount: { $first: '$backlogsCount' },
          },
        },
      ]),
      AttendanceRecord.aggregate([
        { $match: { studentId: { $in: studentIds } } },
        { $sort: { studentId: 1, observedAt: -1, createdAt: -1 } },
        {
          $group: {
            _id: '$studentId',
            attendancePercentage: { $first: '$attendancePercentage' },
            classesAttended: { $first: '$classesAttended' },
            classesHeld: { $first: '$classesHeld' },
          },
        },
      ]),
      PlacementAssessment.aggregate([
        { $match: { studentId: { $in: studentIds } } },
        { $sort: { studentId: 1, assessmentDate: -1, createdAt: -1 } },
        {
          $group: {
            _id: '$studentId',
            score: { $first: '$score' },
            maxScore: { $first: '$maxScore' },
            overallScore: { $first: '$overallScore' },
          },
        },
      ]),
      StudentScore.aggregate([
        { $match: { studentId: { $in: studentIds } } },
        { $sort: { studentId: 1, calculatedAt: -1 } },
        {
          $group: {
            _id: '$studentId',
            score: { $first: '$score' },
          },
        },
      ]),
      RiskPrediction.aggregate([
        { $match: { studentId: { $in: studentIds }, status: 'valid' } },
        { $sort: { studentId: 1, target: 1, predictedAt: -1 } },
        {
          $group: {
            _id: { studentId: '$studentId', target: '$target' },
            riskLevel: { $first: '$riskLevel' },
          },
        },
      ]),
    ]);

  for (const a of academicAgg) {
    const s = snapshotMap.get(a._id);
    if (s) {
      s.cgpa = a.cgpa ?? null;
      s.backlogs = a.backlogsCount ?? (a.backlog === true ? 1 : 0);
    }
  }

  for (const att of attendanceAgg) {
    const s = snapshotMap.get(att._id);
    if (s) {
      if (att.attendancePercentage != null) {
        s.attendancePercentage = att.attendancePercentage;
      } else if (att.classesHeld != null && att.classesHeld > 0 && att.classesAttended != null) {
        s.attendancePercentage = Math.round((att.classesAttended / att.classesHeld) * 100);
      }
    }
  }

  for (const p of placementAgg) {
    const s = snapshotMap.get(p._id);
    if (s) {
      if (p.maxScore != null && p.maxScore > 0 && p.score != null) {
        s.placementScore = Math.round((p.score / p.maxScore) * 100);
      } else {
        s.placementScore = p.score ?? p.overallScore ?? null;
      }
    }
  }

  for (const sc of scoresAgg) {
    const s = snapshotMap.get(sc._id);
    if (s) {
      s.successScore = sc.score ?? null;
    }
  }

  for (const r of riskAgg) {
    const s = snapshotMap.get(r._id.studentId);
    if (s) {
      if (r._id.target === 'academic_risk') s.academicRisk = r.riskLevel;
      if (r._id.target === 'placement_risk') s.placementRisk = r.riskLevel;
    }
  }

  return snapshotMap;
}

/**
 * Save a new simulation scenario definition
 *
 * @param {Object} data
 * @param {Object} user
 * @returns {Promise<Object>}
 */
export async function createScenario(data = {}, user) {
  const scenarioId =
    data.scenarioId ||
    `SCN_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const strategy = data.strategy || 'targeted';
  const allowedStrategies = ['targeted', 'uniform', 'mixed', 'custom'];
  if (!allowedStrategies.includes(strategy)) {
    throw new AppError(
      `Invalid strategy '${strategy}'. Allowed: ${allowedStrategies.join(', ')}`,
      400,
      'VALIDATION_ERROR'
    );
  }

  let interventionTypes = data.interventionTypes || [];
  if (typeof interventionTypes === 'string') {
    interventionTypes = [interventionTypes];
  }
  if (!Array.isArray(interventionTypes) || interventionTypes.length === 0) {
    throw new AppError(
      'At least one interventionType must be specified in interventionTypes array.',
      400,
      'VALIDATION_ERROR'
    );
  }

  const scenario = await SimulationScenario.create({
    scenarioId,
    createdBy: user?.email || user?.id || 'admin',
    cohortFilters: data.cohortFilters || {},
    strategy,
    interventionTypes: interventionTypes.map((t) => t.toLowerCase().trim()),
    capacityConstraints: data.capacityConstraints || {},
    assumptions: data.assumptions || [],
    status: 'draft',
  });

  return scenario.toObject();
}

/**
 * Run deterministic simulation for an existing scenario
 *
 * @param {string} scenarioId
 * @returns {Promise<Object>}
 */
export async function runScenario(scenarioId) {
  if (!scenarioId || typeof scenarioId !== 'string') {
    throw new AppError('scenarioId is required.', 400, 'VALIDATION_ERROR');
  }

  const scenario = await SimulationScenario.findOne({ scenarioId: scenarioId.trim() });
  if (!scenario) {
    throw new AppError(`Simulation scenario '${scenarioId}' not found.`, 404, 'NOT_FOUND');
  }

  // 1. Build cohort student query
  const studentQuery = { status: 'active' };
  const filters = scenario.cohortFilters || {};
  if (filters.department && typeof filters.department === 'string') {
    studentQuery.department = new RegExp(`^${filters.department.trim()}$`, 'i');
  }
  if (filters.semester != null) {
    const sem = Number(filters.semester);
    if (!Number.isNaN(sem)) {
      studentQuery.$or = [{ semester: sem }, { currentSemester: sem }];
    }
  }
  if (filters.cohort && typeof filters.cohort === 'string') {
    studentQuery.cohort = filters.cohort.trim();
  }

  const students = await Student.find(studentQuery, {
    studentId: 1,
    semester: 1,
    currentSemester: 1,
    department: 1,
  }).lean();

  const studentIds = students.map((s) => s.studentId);
  const snapshotMap = await gatherCohortSnapshots(studentIds);

  const cohortStudents = students.map((s) => {
    const snap = snapshotMap.get(s.studentId) || {};
    return {
      studentId: s.studentId,
      semester: s.semester ?? s.currentSemester ?? null,
      department: s.department,
      cgpa: snap.cgpa,
      backlogs: snap.backlogs,
      attendancePercentage: snap.attendancePercentage,
      placementScore: snap.placementScore,
      successScore: snap.successScore,
      academicRisk: snap.academicRisk,
      placementRisk: snap.placementRisk,
    };
  });

  // 2. Fetch active intervention assignments to prevent double assignment
  const activeInterventions = await Intervention.find(
    { status: { $in: ['assigned', 'in_progress'] } },
    { studentId: 1, interventionType: 1 }
  ).lean();

  const activeAssignments = new Set(
    activeInterventions.map((i) => `${i.studentId}:${i.interventionType}`)
  );

  // 3. Fetch catalog entries
  const catalogDocs = await InterventionCatalog.find({
    interventionType: { $in: scenario.interventionTypes },
  }).lean();

  const catalogMap = new Map();
  for (const c of catalogDocs) {
    catalogMap.set(c.interventionType, c);
  }

  // Normalize capacity constraints from Map/Object
  const capacityObj =
    scenario.capacityConstraints instanceof Map
      ? Object.fromEntries(scenario.capacityConstraints)
      : scenario.capacityConstraints || {};

  // 4. Run deterministic allocation
  const simulationResult = runAllocationSimulation({
    cohortStudents,
    activeAssignments,
    catalogMap,
    interventionTypes: scenario.interventionTypes,
    capacityConstraints: capacityObj,
    strategy: scenario.strategy,
  });

  // 5. Update and persist simulation results
  scenario.allocationResults = simulationResult.allocationResults;
  scenario.excludedResults = simulationResult.excludedResults;
  scenario.resourceSummary = simulationResult.resourceSummary;
  scenario.assumptions = simulationResult.assumptions;
  scenario.outcomeEstimates = simulationResult.outcomeEstimates;
  scenario.estimateMethod = simulationResult.estimateMethod;
  scenario.status = 'simulated';

  await scenario.save();

  return scenario.toObject();
}

/**
 * Retrieve a simulation scenario by scenarioId
 *
 * @param {string} scenarioId
 * @returns {Promise<Object>}
 */
export async function getScenario(scenarioId) {
  if (!scenarioId || typeof scenarioId !== 'string') {
    throw new AppError('scenarioId is required.', 400, 'VALIDATION_ERROR');
  }

  const scenario = await SimulationScenario.findOne({ scenarioId: scenarioId.trim() }).lean();
  if (!scenario) {
    throw new AppError(`Simulation scenario '${scenarioId}' not found.`, 404, 'NOT_FOUND');
  }

  return scenario;
}

/**
 * Approve a simulated scenario and create official student Intervention assignments
 *
 * @param {string} scenarioId
 * @param {Object} user
 * @returns {Promise<Object>}
 */
export async function approveScenario(scenarioId, user) {
  if (!scenarioId || typeof scenarioId !== 'string') {
    throw new AppError('scenarioId is required.', 400, 'VALIDATION_ERROR');
  }

  const scenario = await SimulationScenario.findOne({ scenarioId: scenarioId.trim() });
  if (!scenario) {
    throw new AppError(`Simulation scenario '${scenarioId}' not found.`, 404, 'NOT_FOUND');
  }

  if (scenario.status === 'draft') {
    throw new AppError(
      'Scenario must be simulated before it can be approved.',
      400,
      'INVALID_STATE'
    );
  }

  if (scenario.status === 'approved' || scenario.status === 'implemented') {
    throw new AppError(
      `Scenario '${scenarioId}' is already approved.`,
      409,
      'ALREADY_APPROVED'
    );
  }

  // Generate official Intervention documents
  const createdInterventions = [];

  for (const alloc of scenario.allocationResults) {
    const invId = `INV_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const inv = await Intervention.create({
      interventionId: invId,
      studentId: alloc.studentId,
      scenarioId: scenario.scenarioId,
      interventionType: alloc.interventionType,
      assignedBy: user?.email || user?.id || 'admin',
      assignedAt: new Date(),
      status: 'assigned',
      notes: `Assigned via approved simulation scenario '${scenario.scenarioId}'. Reason: ${alloc.reason}`,
    });
    createdInterventions.push(inv);
  }

  scenario.status = 'approved';
  await scenario.save();

  return {
    scenarioId: scenario.scenarioId,
    status: 'approved',
    approvedBy: user?.email || user?.id || 'admin',
    createdInterventionsCount: createdInterventions.length,
    interventions: createdInterventions.map((i) => ({
      interventionId: i.interventionId,
      studentId: i.studentId,
      interventionType: i.interventionType,
      status: i.status,
    })),
  };
}
