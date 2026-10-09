import {
  listCatalog,
  getCatalogEntry,
  upsertCatalogEntry,
} from './catalog.service.js';

export async function listCatalogHandler(req, res, next) {
  try {
    const activeOnly = req.query.activeOnly === 'true';
    const catalog = await listCatalog({ activeOnly });

    res.status(200).json({
      success: true,
      data: {
        catalog,
        total: catalog.length,
      },
      meta: {
        requestId: req.id,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getCatalogEntryHandler(req, res, next) {
  try {
    const entry = await getCatalogEntry(req.params.interventionType);

    res.status(200).json({
      success: true,
      data: entry,
      meta: {
        requestId: req.id,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function upsertCatalogEntryHandler(req, res, next) {
  try {
    const entry = await upsertCatalogEntry(req.body);

    res.status(200).json({
      success: true,
      data: entry,
      meta: {
        requestId: req.id,
      },
    });
  } catch (err) {
    next(err);
  }
}
