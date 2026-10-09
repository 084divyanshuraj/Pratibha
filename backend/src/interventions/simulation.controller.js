import {
  createScenario,
  runScenario,
  getScenario,
  approveScenario,
} from './simulation.service.js';

export async function createScenarioHandler(req, res, next) {
  try {
    const scenario = await createScenario(req.body, req.user);

    res.status(201).json({
      success: true,
      data: scenario,
      meta: {
        requestId: req.id,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function runScenarioHandler(req, res, next) {
  try {
    const result = await runScenario(req.params.scenarioId);

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

export async function getScenarioHandler(req, res, next) {
  try {
    const scenario = await getScenario(req.params.scenarioId);

    res.status(200).json({
      success: true,
      data: scenario,
      meta: {
        requestId: req.id,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function approveScenarioHandler(req, res, next) {
  try {
    const result = await approveScenario(req.params.scenarioId, req.user);

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
