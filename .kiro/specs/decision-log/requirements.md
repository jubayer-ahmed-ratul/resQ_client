# Requirements Document

## Introduction

The Decision Log feature adds a Decision Audit Trail UI to the ResQFlow frontend. The backend already exposes immutable `DecisionLog` records for every algorithmic action (priority calculations, resource recommendations, assignments, and rejections). This feature surfaces those records inside the incident detail page so that ADMIN and COORDINATOR users can inspect exactly why the system made each decision, which algorithm version ran, and what factors drove the outcome. No new backend work is required; the feature is a frontend-only addition to `app/(dashboard)/dashboard/incidents/[id]/page.tsx`.

## Glossary

- **Decision_History_Section**: The React component rendered within the incident detail page that fetches and displays all `DecisionLog` records for a given incident.
- **DecisionLog**: An immutable backend record representing one algorithmic decision. Fields: `id`, `incidentId`, `decisionType`, `priorityScore`, `selectedResourceId`, `explanation`, `factors`, `algorithmVersion`, `createdAt`.
- **Decision_Type**: One of four values — `PRIORITY_CALCULATION`, `RESOURCE_RECOMMENDATION`, `RESOURCE_ASSIGNMENT`, `RESOURCE_REJECTION`.
- **Explanation_Panel**: The collapsible sub-section within a decision card that renders the structured `explanation` and `factors` JSON in a human-readable format.
- **Algorithm_Version**: A string tag stored on each `DecisionLog` (e.g., `priority-v1`, `greedy-resource-v1`, `assignment-v1`) that identifies which algorithm produced the decision.
- **ADMIN**: A user whose `role` field equals `"ADMIN"`. Has full visibility into decision logs.
- **COORDINATOR**: A user whose `role` field equals `"COORDINATOR"`. Has full visibility into decision logs.
- **DISPATCHER**: A user whose `role` field equals `"DISPATCHER"`. Does not have access to decision logs.
- **ResQFlow_Frontend**: The Next.js (App Router) application under `app/`.
- **Decision_API**: The `decisionApi` object exported from `lib/api.ts`, providing `listByIncident` and `getById` methods.

---

## Requirements

### Requirement 1: Role-Based Visibility of the Decision History Section

**User Story:** As an ADMIN or COORDINATOR, I want to see the Decision History section on the incident detail page, so that I can audit every algorithmic decision made for that incident.

#### Acceptance Criteria

1. WHEN the authenticated user's `role` is `"ADMIN"` or `"COORDINATOR"`, THE Decision_History_Section SHALL be rendered on the incident detail page.
2. WHEN the authenticated user's `role` is neither `"ADMIN"` nor `"COORDINATOR"`, THE Decision_History_Section SHALL not be rendered and no decision data SHALL be fetched.
3. THE Decision_History_Section SHALL read the user's role exclusively from the `User` object stored in `localStorage` under the key `"user"`, consistent with the pattern used by the rest of the incident detail page.

---

### Requirement 2: Fetching Decision Logs

**User Story:** As an ADMIN or COORDINATOR, I want the decision logs to load automatically when I open an incident, so that I don't have to trigger a separate action.

#### Acceptance Criteria

1. WHEN the incident detail page mounts and the authenticated user's `role` is `"ADMIN"` or `"COORDINATOR"`, THE Decision_History_Section SHALL call `decisionApi.listByIncident(incidentId, token)` exactly once.
2. WHILE the fetch is in progress, THE Decision_History_Section SHALL display a loading indicator consistent with the spinner style used elsewhere on the incident detail page (`h-8 w-8 animate-spin rounded-full border-2 border-[#19C3B1] border-t-transparent`).
3. IF the `decisionApi.listByIncident` call returns an empty array, THEN THE Decision_History_Section SHALL display an empty-state message indicating no decisions have been recorded for the incident.
4. IF the `decisionApi.listByIncident` call throws an error, THEN THE Decision_History_Section SHALL display a non-blocking inline error message styled with the error palette (`#E63946`) without removing other content from the incident detail page.

---

### Requirement 3: Decision Log List Rendering

**User Story:** As an ADMIN or COORDINATOR, I want to see a chronological list of decision entries, so that I can understand the sequence of algorithmic actions taken for an incident.

#### Acceptance Criteria

1. THE Decision_History_Section SHALL render one decision card per `DecisionLog` record returned by the API.
2. THE Decision_History_Section SHALL render decision cards in descending chronological order, with the most recent `createdAt` timestamp displayed first.
3. WHEN rendering a decision card, THE Decision_History_Section SHALL display the `decisionType`, the `algorithmVersion`, and the `createdAt` timestamp formatted as a human-readable local date-time string.
4. THE Decision_History_Section SHALL visually distinguish the four `Decision_Type` values using distinct label text and color-coded badges consistent with the existing badge patterns in the incident detail page.
5. WHEN a `DecisionLog` has a non-null `priorityScore`, THE Decision_History_Section SHALL display the `priorityScore` on the corresponding decision card.
6. WHEN a `DecisionLog` has a non-null `selectedResourceId`, THE Decision_History_Section SHALL display the `selectedResourceId` on the corresponding decision card.

---

### Requirement 4: Per-Decision-Type Explanation Rendering

**User Story:** As an ADMIN or COORDINATOR, I want each decision card to render its explanation data in a structured, human-readable format specific to the decision type, so that I can understand the factors behind each algorithmic choice without reading raw JSON.

#### Acceptance Criteria

1. WHEN the `decisionType` is `PRIORITY_CALCULATION` and `factors` is non-null, THE Explanation_Panel SHALL render each factor entry (e.g., `severity`, `timeSensitivity`) showing the factor's `value` or `normalizedScore`, `weight`, and `contribution` as labeled fields.
2. WHEN the `decisionType` is `RESOURCE_RECOMMENDATION` or `RESOURCE_REJECTION`, THE Explanation_Panel SHALL render each key in the `explanation` object as a labeled field, and SHALL map known reason codes (`RESOURCE_BUSY`, `RESOURCE_UNAVAILABLE`, `RESOURCE_FAILED`, `RESOURCE_MAINTENANCE`, `CAPACITY_INSUFFICIENT`, `CAPABILITY_MISMATCH`, `INVALID_LOCATION`) to human-readable descriptions.
3. WHEN the `decisionType` is `RESOURCE_ASSIGNMENT`, THE Explanation_Panel SHALL render the fields present in the `explanation` object as labeled key-value pairs.
4. WHEN a `DecisionLog`'s `explanation` object contains keys that do not match any known structured format, THE Explanation_Panel SHALL render those keys and their values as generic labeled fields so that no data is silently omitted.
5. THE Explanation_Panel SHALL not render raw unparsed JSON strings directly visible to the user.

---

### Requirement 5: Collapsible Explanation Panel

**User Story:** As an ADMIN or COORDINATOR, I want to expand or collapse the explanation for each decision, so that I can scan the decision list quickly and drill into details only when needed.

#### Acceptance Criteria

1. THE Decision_History_Section SHALL render each decision card in a collapsed state by default, showing only the `decisionType`, `algorithmVersion`, and `createdAt`.
2. WHEN the user activates the expand control on a decision card, THE Explanation_Panel for that card SHALL become visible.
3. WHEN the user activates the collapse control on an expanded decision card, THE Explanation_Panel for that card SHALL be hidden.
4. THE expand/collapse state of one decision card SHALL not affect the expand/collapse state of any other decision card.
5. THE Decision_History_Section SHALL use `ChevronDown` and `ChevronUp` icons from `lucide-react` as the expand and collapse controls, consistent with the collapsible rejected-candidates pattern already present in the incident detail page.

---

### Requirement 6: Visual Consistency with the Incident Detail Page

**User Story:** As a user, I want the Decision History section to look and feel like the rest of the incident detail page, so that the UI remains cohesive.

#### Acceptance Criteria

1. THE Decision_History_Section SHALL use a `rounded-2xl` card container with `shadow-sm` and a border styled with `rgba(11,31,51,0.08)`, matching the existing section cards on the incident detail page.
2. THE Decision_History_Section SHALL use the ResQFlow color palette: primary `#0B1F33`, accent `#19C3B1`, body text `#374151`, muted text `#9CA3AF`, and error `#E63946`.
3. THE Decision_History_Section SHALL use only icons already available in `lucide-react` and SHALL not introduce any new npm dependencies.
4. THE Decision_History_Section SHALL include a section header labeled "Decision History" using the same heading typographic style (`font-bold text-lg`, color `#0B1F33`) as the "Priority Engine" and "Resource Recommendation" section headers.
5. THE Decision_History_Section SHALL include a `History` icon (from `lucide-react`, already imported on the incident detail page) beside the section header, consistent with the icon-beside-header pattern used in other sections.

---

### Requirement 7: Immutability Communication

**User Story:** As an ADMIN or COORDINATOR, I want the UI to make clear that decision logs cannot be edited or deleted, so that I trust the audit trail as a reliable record.

#### Acceptance Criteria

1. THE Decision_History_Section SHALL display a visible indicator — such as a badge or caption — on each decision card communicating that the record is immutable and read-only.
2. THE Decision_History_Section SHALL not render any edit, delete, or modify controls on any decision card.

---

### Requirement 8: Algorithm Version Traceability

**User Story:** As an ADMIN, I want to see the algorithm version on every decision card, so that I can identify which version of the algorithm produced a given decision when reviewing changes over time.

#### Acceptance Criteria

1. THE Decision_History_Section SHALL display the `algorithmVersion` string on every decision card.
2. WHEN multiple decision cards share the same `algorithmVersion` value, THE Decision_History_Section SHALL display the `algorithmVersion` on each card independently without deduplication or grouping.
