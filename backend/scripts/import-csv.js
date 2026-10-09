import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse as parseCsv } from 'csv-parse/sync';
import { config } from '../src/config/env.js';
import { connectDatabase, disconnectDatabase } from '../src/db/connection.js';
import { processImport } from '../src/ingestion/ingestion.service.js';
import { rebuildSegments } from '../src/segments/segment.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runCsvImporter() {
  const targetDir = process.argv[2]
    ? path.resolve(process.cwd(), process.argv[2])
    : path.resolve(__dirname, '../data/samples');

  console.log(`[ImportCLI] Reading dataset files from: ${targetDir}`);
  if (!fs.existsSync(targetDir)) {
    console.error(`[ImportCLI] Target directory does not exist: ${targetDir}`);
    process.exit(1);
  }

  await connectDatabase(config.mongoUri);

  // Ingestion sequence: students must be imported first for relational integrity
  const sequence = [
    'students',
    'academic',
    'attendance',
    'lms',
    'placement',
    'skills',
    'engagement',
    'feedback',
  ];

  for (const datasetType of sequence) {
    const filePath = path.join(targetDir, `${datasetType}.csv`);
    if (!fs.existsSync(filePath)) {
      console.log(`[ImportCLI] Optional file not found (skipping): ${datasetType}.csv`);
      continue;
    }

    console.log(`\n[ImportCLI] === Processing ${datasetType}.csv ===`);
    const rawContent = fs.readFileSync(filePath, 'utf-8');
    const records = parseCsv(rawContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
    });

    console.log(`[ImportCLI] Found ${records.length} raw records. Running ingestion pipeline...`);
    const result = await processImport({
      datasetType,
      rawRecords: records,
      fileName: `${datasetType}.csv`,
      uploadedBy: 'cli-importer@campus.edu',
      dryRun: false,
    });

    console.log(`[ImportCLI] Result: ${result.status.toUpperCase()}`);
    console.log(`  - Received: ${result.counts.received}`);
    console.log(`  - Accepted: ${result.counts.accepted}`);
    console.log(`  - Rejected: ${result.counts.rejected}`);
    if (result.rowErrors && result.rowErrors.length > 0) {
      console.log(`  - Errors (first 3):`);
      result.rowErrors.slice(0, 3).forEach((e) => {
        console.log(`    • Row ${e.row}: ${e.message}`);
      });
    }
  }

  console.log('\n[ImportCLI] Recalculating dynamic student segments and risk archetypes...');
  await rebuildSegments().catch(() => {});

  console.log('[ImportCLI] All CSV datasets imported and dynamically analyzed in MongoDB!');
  await disconnectDatabase();
}

runCsvImporter().catch((err) => {
  console.error('[ImportCLI] Import failed:', err);
  process.exit(1);
});
