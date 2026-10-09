import {
  extractRawRecords,
  processImport,
  getImportById,
} from './ingestion.service.js';

export async function previewImportHandler(req, res, next) {
  try {
    const { records, fileName } = extractRawRecords(req);
    const result = await processImport({
      datasetType: req.params.datasetType,
      rawRecords: records,
      fileName,
      uploadedBy: req.user.email || req.user.id,
      dryRun: true,
    });

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

export async function commitImportHandler(req, res, next) {
  try {
    const { records, fileName } = extractRawRecords(req);
    const result = await processImport({
      datasetType: req.params.datasetType,
      rawRecords: records,
      fileName,
      uploadedBy: req.user.email || req.user.id,
      dryRun: false,
    });

    res.status(201).json({
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

export async function getImportByIdHandler(req, res, next) {
  try {
    const importReport = await getImportById(req.params.importId);
    res.status(200).json({
      success: true,
      data: importReport,
      meta: {
        requestId: req.id,
      },
    });
  } catch (err) {
    next(err);
  }
}

export default {
  previewImportHandler,
  commitImportHandler,
  getImportByIdHandler,
};
