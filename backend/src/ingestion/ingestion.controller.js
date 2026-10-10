import {
  extractRawRecords,
  processImport,
  getImportById,
} from './ingestion.service.js';
import auditService from '../audit/audit.service.js';

export async function previewImportHandler(req, res, next) {
  try {
    const { records, fileName } = extractRawRecords(req);
    const autoProvision = req.query.autoProvision !== 'false' && req.body?.autoProvision !== 'false';
    const result = await processImport({
      datasetType: req.params.datasetType,
      rawRecords: records,
      fileName,
      uploadedBy: req.user.email || req.user.id,
      dryRun: true,
      autoProvision,
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
    const autoProvision = req.query.autoProvision !== 'false' && req.body?.autoProvision !== 'false';
    const result = await processImport({
      datasetType: req.params.datasetType,
      rawRecords: records,
      fileName,
      uploadedBy: req.user.email || req.user.id,
      dryRun: false,
      autoProvision,
    });

    await auditService.logAuditEvent({
      actorUserId: req.user.id || req.user.email,
      action: 'IMPORT_COMMITTED',
      resourceType: 'import',
      resourceId: result.importId,
      requestId: req.id,
      metadata: {
        datasetType: req.params.datasetType,
        fileName,
        acceptedCount: result.acceptedCount,
        rejectedCount: result.rejectedCount,
      },
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
