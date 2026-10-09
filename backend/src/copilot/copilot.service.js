import { config } from '../config/env.js';
import { getOverviewKpis, getRiskSummary } from '../analytics/analytics.service.js';
import { listSegments } from '../segments/segment.service.js';
import { listCatalog } from '../interventions/catalog.service.js';
import { AppError } from '../middleware/errorHandler.js';

// Strict regex to detect injection attacks or arbitrary database query attempts
const INJECTION_PATTERN =
  /\b(\$where|\$regex|dropDatabase|deleteMany|remove|eval|system\.js|function\s*\(|SELECT\s+.*FROM|DROP\s+TABLE|INSERT\s+INTO|DELETE\s+FROM)\b/i;

/**
 * Process a copilot natural language query.
 * Strictly routes through authorized internal backend services with zero ungrounded DB execution.
 */
export async function processQuery(body = {}, user) {
  const query = body.query;
  if (!query || typeof query !== 'string' || query.trim().length < 2) {
    throw new AppError('Query text is required (minimum 2 characters).', 400, 'VALIDATION_ERROR');
  }

  const cleanQuery = query.trim();
  if (cleanQuery.length > 500) {
    throw new AppError('Query exceeds maximum allowed length of 500 characters.', 400, 'VALIDATION_ERROR');
  }

  // Security gate: Disallow arbitrary database commands or script injections
  if (INJECTION_PATTERN.test(cleanQuery)) {
    throw new AppError(
      'Arbitrary database commands or ungrounded script queries are strictly prohibited.',
      400,
      'UNAUTHORIZED_QUERY_SYNTAX'
    );
  }

  // If Copilot is not enabled in environment, return explicit not_configured response
  if (!config.copilot.enabled) {
    return {
      status: 'not_configured',
      configured: false,
      provider: config.copilot.provider || 'none',
      message:
        'AI Copilot query assistant is not configured. External LLM provider has not been enabled for this deployment. Queries must be fulfilled via standard analytics and simulation APIs.',
      disclaimer:
        'All campus analytics and risk metrics are computed deterministically via official verified backend endpoints.',
      suggestedEndpoints: [
        '/api/v1/analytics/overview',
        '/api/v1/analytics/risk-summary',
        '/api/v1/segments',
        '/api/v1/intervention-catalog',
      ],
      queryReceived: cleanQuery,
    };
  }

  // Copilot is enabled: resolve through authorized backend services
  const normalized = cleanQuery.toLowerCase();

  // 1. Overview KPIs Intent
  if (
    normalized.includes('kpi') ||
    normalized.includes('overview') ||
    normalized.includes('metric') ||
    normalized.includes('campus') ||
    normalized.includes('average score') ||
    normalized.includes('overall')
  ) {
    const kpis = await getOverviewKpis();
    return {
      status: 'answered',
      configured: true,
      grounded: true,
      intent: 'INSTITUTION_OVERVIEW',
      summary: `The campus currently has ${kpis.totalStudents} enrolled students with an overall average Student Success Score of ${kpis.averageSuccessScore || 'N/A'}. Data coverage spans all 7 source categories.`,
      data: kpis,
      sources: ['/api/v1/analytics/overview'],
      disclaimer: 'Verified against stored MongoDB records. Zero LLM hallucination.',
    };
  }

  // 2. Risk Distribution Intent
  if (
    normalized.includes('risk') ||
    normalized.includes('struggling') ||
    normalized.includes('academic risk') ||
    normalized.includes('placement risk') ||
    normalized.includes('at risk') ||
    normalized.includes('divergence')
  ) {
    const risk = await getRiskSummary();
    let acHigh = 0;
    let plHigh = 0;
    for (const d of risk.departmentBreakdown || []) {
      acHigh += d.academicRisk?.high || 0;
      plHigh += d.placementRisk?.high || 0;
    }
    const divergence = risk.decoupledDivergence?.count || 0;

    return {
      status: 'answered',
      configured: true,
      grounded: true,
      intent: 'RISK_SUMMARY',
      summary: `There are ${acHigh} students flagged with high Academic Risk and ${plHigh} students with high Placement Risk. ${divergence} students exhibit decoupled divergence where academic and placement risk profiles diverge.`,
      data: risk,
      sources: ['/api/v1/analytics/risk-summary'],
      disclaimer: 'Verified against stored predictions and feature records. Zero LLM hallucination.',
    };
  }

  // 3. Student Segmentation Intent
  if (
    normalized.includes('segment') ||
    normalized.includes('cohort') ||
    normalized.includes('archetype') ||
    normalized.includes('cluster')
  ) {
    const segments = await listSegments({ includeStudents: false });
    const topSegments = segments.map((s) => `${s.name} (${s.studentCount})`).join(', ');

    return {
      status: 'answered',
      configured: true,
      grounded: true,
      intent: 'STUDENT_SEGMENTS',
      summary: `Identified ${segments.length} student segments across the campus: ${topSegments}.`,
      data: { segments, count: segments.length },
      sources: ['/api/v1/segments'],
      disclaimer: 'Derived from versioned deterministic segmentation rules (ssr-v1). Zero LLM hallucination.',
    };
  }

  // 4. Interventions & Catalog Intent
  if (
    normalized.includes('intervention') ||
    normalized.includes('catalog') ||
    normalized.includes('sandbox') ||
    normalized.includes('program') ||
    normalized.includes('tutoring') ||
    normalized.includes('mentorship')
  ) {
    const catalog = await listCatalog();
    const programs = catalog.map((c) => `${c.name} (type: ${c.interventionType})`).join(', ');

    return {
      status: 'answered',
      configured: true,
      grounded: true,
      intent: 'INTERVENTION_CATALOG',
      summary: `There are ${catalog.length} active intervention programs available: ${programs}. Capacity constraints and deterministic allocation apply in sandbox simulations.`,
      data: { catalog, count: catalog.length },
      sources: ['/api/v1/intervention-catalog'],
      disclaimer: 'Verified against active catalog entries. Zero outcome fabrication.',
    };
  }

  // Fallback for unsupported or ambiguous questions
  return {
    status: 'unsupported_intent',
    configured: true,
    grounded: true,
    message:
      'The Copilot assistant can only answer questions grounded in verified institution analytics, risk summaries, student segments, and intervention programs.',
    supportedTopics: [
      'Overview KPIs and campus performance ("What is the overall average score and student count?")',
      'Risk levels and decoupled divergences ("How many students have high academic or placement risk?")',
      'Student segments and cohorts ("List the current student segments")',
      'Intervention programs and catalog ("What intervention programs are currently available?")',
    ],
    sources: [],
    disclaimer: 'Arbitrary database queries or ungrounded generative speculation are strictly prohibited.',
  };
}

export default {
  processQuery,
};
