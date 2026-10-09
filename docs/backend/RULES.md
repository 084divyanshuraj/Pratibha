# Smart Campus Analytics — Backend Engineering Rules

These rules are mandatory for human contributors and coding agents working on the backend. If a rule conflicts with existing repository constraints, report the conflict before making destructive changes.

## 1. Work safely in the existing repository

1. Inspect the current repository, git status, package manager and existing conventions before editing.
2. Never delete, overwrite or mass-reformat existing work just to match a preferred scaffold.
3. Do not reset branches, force-push, discard user changes, or run destructive database commands without explicit approval.
4. Implement in small reviewable phases from `TASK.md`; run relevant tests after each phase.
5. If a required product/data decision is unresolved, document it and use a clearly labelled development-only stub where necessary. Do not silently turn assumptions into production behavior.

## 2. Shared contracts are source interfaces

1. `DESIGN.md` defines the first shared API/data contract. Keep request and response field names consistent across frontend/backend/ML.
2. Never make the frontend call MongoDB or the ML service directly.
3. Keep normal routes under `/api/v1`; provide stable error codes and response envelopes.
4. Do not return raw database documents. Use explicit response DTOs/serializers.
5. Update docs, fixtures and tests whenever a contract intentionally changes; prefer backward-compatible additions.
6. ML endpoint, features, target, version and output semantics must be agreed with the ML teammate before real integration. Mock responses must be explicitly marked as test-only.

## 3. Security and privacy

1. Never commit secrets, database URIs, real access tokens, API keys, or production credentials. Use `.env.example` with placeholders.
2. Validate required environment variables at startup; do not silently use insecure production defaults.
3. Enforce authentication, role checks and object-level authorization on every protected route. UI-level hiding is not authorization.
4. Students may read only their own protected records. Verify the authenticated user's identity rather than trusting request-supplied `studentId`.
5. Do not permit public self-registration with elevated roles. Hash passwords with an accepted password-hashing algorithm; never store plaintext passwords.
6. Restrict CORS to approved frontend origins. Do not use wildcard CORS with credentialed requests.
7. Validate body, query, path parameters, content type, file size, upload row count and allowed values before database operations.
8. Do not build MongoDB filters by blindly spreading user input into queries. Whitelist allowed filters and fields.
9. Never log passwords, authorization headers, JWTs, secrets, full raw feedback or unnecessary sensitive student fields.
10. Restrict access to raw feedback. Do not automatically make free-text comments part of the ML feature set.

## 4. Data integrity

1. Use a stable `studentId` consistently across all category records and API responses.
2. Preserve missing values as missing/null according to each schema; do not silently replace them with 0, false or a “low risk” label.
3. Validate numeric ranges and relationships (for example attended classes cannot exceed held classes).
4. Keep source/observation timestamps and import provenance where practical.
5. Store score formula version, model/feature version and prediction timestamp with calculated outputs.
6. Features used in a prediction must reflect only information available at the prediction cutoff; guard against target leakage.
7. Use bounded pagination and bounded result sizes. Do not load entire collections for list/analytics requests.
8. Add indexes that support documented query patterns and enforce unique identifiers where required.
9. Model output must not be invented when ML is down or unavailable. Return a stable error or an explicitly configured rules-based result labelled as such.
10. Composite Success Score is not a probability. Only return `probability` when the model contract and evaluation support that meaning.

## 5. ML and decision-support integrity

1. Keep training code/artifacts under the ML team's ownership. The Node backend orchestrates inference but does not train the model.
2. Call the ML service using `ML_SERVICE_URL`; never hardcode a production host.
3. Use bounded timeouts; handle service unavailability and invalid response schema.
4. Persist the model version and relevant feature-set version for accepted predictions.
5. Do not claim predictive accuracy without held-out evaluation evidence provided by the ML owner.
6. Keep predictions, hypothetical scenario estimates and observed outcomes separate.
7. The Intervention Sandbox must state strategy, constraints, allocation rule/version and assumptions.
8. Do not create improvement percentages or claim an intervention caused an outcome without appropriate evidence and evaluation design.
9. Require authorized human review/approval for intervention plans before creating assignments.
10. Treat predictions as decision-support signals, not definitive judgments about students.

## 6. Code quality

1. Keep HTTP handling, business logic, persistence and external-service clients separated enough to test independently.
2. Prefer small domain modules and explicit functions over a large generic controller.
3. Use one centralized error-handling strategy. Do not swallow exceptions or send ambiguous success responses.
4. Validate external data at system boundaries (HTTP, imports, ML service) even if an internal type/schema exists.
5. Keep configuration in environment variables with documented defaults only for non-secret local development settings.
6. Avoid unnecessary dependencies and microservices. Backend is a modular monolith; ML inference is the separate service.
7. Do not hardcode demo student data in production code paths.
8. Add meaningful comments for non-obvious business rules, not comments that merely restate code.

## 7. Testing requirements

- Unit-test Success Score formula, normalization, missing-data policy and boundary values.
- Integration-test repository/data-access operations against a test database or isolated fixtures.
- API-test authentication, roles, validation, error envelopes and pagination.
- Include negative tests proving a student cannot query another student's profile, score, records or interventions.
- Test CSV import with valid rows, malformed rows, duplicate/unknown student IDs and oversized uploads.
- Test ML timeout, unavailable endpoint, invalid payload, unsupported target and valid response.
- Test scenario capacity limits, determinism, excluded-student reasons, approval requirements and status transitions.
- Use synthetic fixtures; never copy real student personal data into tests.
- Do not claim a test passed without actually running it.

## 8. Deployment rules

1. Backend must support Render using the configured runtime port and a clear start command.
2. Database URI, JWT secret, frontend origin and ML service URL are environment variables.
3. Health endpoints must be safe and not reveal credentials or full connection strings.
4. `/health/live` checks process liveness; `/health/ready` checks required dependency readiness.
5. No production URL may default to `localhost`.
6. Provide a `.env.example`, deployment notes and a safe local setup guide.
7. Use MongoDB Atlas with least-privilege credentials and a network policy suitable for the deployment configuration.

## 9. Completion/reporting rules

For each finished task, report:
- files/modules changed;
- APIs/contracts added or changed;
- tests run and their real results;
- environment variables required;
- known limitations/open questions;
- any updates required in `MEMORY.md` or the other docs.

Never state that a feature is complete merely because a route or UI placeholder exists. Completion means the expected data path, permissions, validation, error handling and tests work.
