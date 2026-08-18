# Requirements Document

## Introduction

The Decision Log History UI is a frontend feature that surfaces the algorithmic decision audit trail stored by Part 8 of the backend. It renders inside the Incident Detail page (`/dashboard/incidents/[id]`) and gives ADMIN and COORDINATOR users a structured, readable view of every automated decision that was made for an incident — including priority score calculations, resource recommendations, resource assignments, and resource rejections — complete with factor breakdowns, rejection reason codes, and algorithm version metadata.

The feature has no new business logic of its own; it purely visualises the immutable `DecisionLog` records already returned by `GET /incidents/:incidentId/decisions` and `GET /decisions/:id`.

---

## Glossary

- **Decision_Log_Section**: The UI section rendered at the bottom of the Incident Detail page that lists all `DecisionLog` entries for the incident.
- **DecisionLog**: An immutable backend record describing a single algorithmic decision. Has fields: `id`, `incidentId`, `decisionType`, `priorityScore`, `selectedResourceId`, `explanation`, `factors`, `algorithmVersion`, `createdAt`.
- **DecisionType**: One of four string values: `PRIORITY_CALCULATION`, `RESOURCE_RECOMMENDATION`, `RESOURCE_ASSIGNMENT`, `RESOURCE_REJECTION`.
- **Explanation_Panel**: The collapsible area inside a Decision_Log_Card that shows the full structured detail for a single DecisionLog.
- **Decision_Log_Card**: A single row/card in the Decision_Log_Section that summarises one DecisionLog and contains an Explanation_Panel.
- **Factor_Breakdown**: The per-factor scoring detail stored in the `factors` field of a `PRIORITY_CALCULATION` log.
- **Rejection_Reason**: A structured object `{ code, message }` stored in the `explanation` field of a `RESOURCE_REJECTION` log.
- **Algorithm_Version_Badge**: A small badge showing the `algorithmVersion` string (e.g. `priority-v1`).
- **ADMIN**: A user with role value `"ADMIN"`.
- **COORDINATOR**: A user with role value `"COORDINATOR"`.
- **Authorised_User**: A user whose role is `"ADMIN"` or `"COORDINATOR"`.
- **Incident_Detail_Page**: The Next.js App Router page at `app/(dashboard)/dashboard/incidents/[id]/page.tsx`.

---

## Requirements

### Requirement 1: Role-Gated Visibility

**User Story:** As an ADMIN or COORDINATOR, I want the Decision Log section to be visible only to my role, so that operational staff and viewers are not exposed to internal algorithmic detail.

#### Acceptance Criteria

1. WHILE the authenticated user's role is `"ADMIN"` or `"COORDINATOR"`, THE Decision_Log_Section SHALL be rendered on the Incident_Detail_Page.
2. WHILE the authenticated user's role is neither `"ADMIN"` nor `"COORDINATOR"`, THE Incident_Detail_Page SHALL NOT render the Decision_Log_Section.
3. IF the user object is not yet available from `localStorage`, THEN THE Decision_Log_Section SHALL remain hidden until the user object is loaded.

---

### Requirement 2: Data Fetching and Loading State

**User Story:** As an Authorised_User, I want decision logs to load automatically when I open an incident, so that I do not need to trigger a separate action.

#### Acceptance Criteria

1. WHEN the Incident_Detail_Page mounts and the authenticated user is an Authorised_User, THE Decision_Log_Section SHALL invoke `decisionApi.listByIncident(incidentId, token)` to fetch DecisionLog records.
2. WHILE the fetch request is in progress, THE Decision_Log_Section SHALL display a loading spinner.
3. IF the `decisionApi.listByIncident` call fails, THEN THE Decision_Log_Section SHALL silently suppress the error and render an empty state, without interrupting the rest of the Incident_Detail_Page.
4. WHEN the fetch completes successfully and the response contains zero records, THE Decision_Log_Section SHALL display an empty-state message indicating no decisions have been logged yet.
5. WHEN the fetch completes successfully and the response contains one or more records, THE Decision_Log_Section SHALL render one Decision_Log_Card per record, ordered with the most recent `createdAt` first.

---

### Requirement 3: Decision Log Card — Summary Row

**User Story:** As an Authorised_User, I want each log entry to show its type, algorithm version, and timestamp at a glance, so that I can quickly scan the history without expanding every entry.

#### Acceptance Criteria

1. THE Decision_Log_Card SHALL display the `decisionType` value in a human-readable label: `PRIORITY_CALCULATION` → "Priority Calculation", `RESOURCE_RECOMMENDATION` → "Resource Recommendation", `RESOURCE_ASSIGNMENT` → "Resource Assignment", `RESOURCE_REJECTION` → "Resource Rejection".
2. THE Decision_Log_Card SHALL display an Algorithm_Version_Badge containing the `algorithmVersion` string.
3. THE Decision_Log_Card SHALL display the `createdAt` timestamp formatted as a localised date-time string.
4. WHERE the `decisionType` is `PRIORITY_CALCULATION` and `priorityScore` is not null, THE Decision_Log_Card SHALL display the `priorityScore` value rounded to one decimal place in the summary row.
5. THE Decision_Log_Card SHALL include a toggle control (chevron icon) that expands or collapses the Explanation_Panel.

---

### Requirement 4: Explanation Panel — Priority Calculation

**User Story:** As an Authorised_User, I want to see the full factor breakdown for a priority calculation decision, so that I can understand exactly why an incident received its score.

#### Acceptance Criteria

1. WHEN the Explanation_Panel of a `PRIORITY_CALCULATION` Decision_Log_Card is expanded and the `factors` field is not null, THE Explanation_Panel SHALL render one row per factor key found in `factors`, showing the factor's `value` (or `rawValue`), `normalizedScore`, `weight`, and `contribution` (or `weightedScore`).
2. WHEN the Explanation_Panel of a `PRIORITY_CALCULATION` Decision_Log_Card is expanded, THE Explanation_Panel SHALL display the `priorityScore` as the overall score.
3. IF the `factors` field is null for a `PRIORITY_CALCULATION` log, THEN THE Explanation_Panel SHALL display the raw `explanation` JSON as formatted text.

---

### Requirement 5: Explanation Panel — Resource Recommendation

**User Story:** As an Authorised_User, I want to see which resource was selected and which were rejected with structured reason codes, so that I can audit the greedy algorithm's choices.

#### Acceptance Criteria

1. WHEN the Explanation_Panel of a `RESOURCE_RECOMMENDATION` Decision_Log_Card is expanded and `selectedResourceId` is not null, THE Explanation_Panel SHALL display the selected resource identifier.
2. WHEN the Explanation_Panel of a `RESOURCE_RECOMMENDATION` Decision_Log_Card is expanded, THE Explanation_Panel SHALL display each entry in the `explanation` field that represents a rejected candidate, showing the rejection `code` and `message`.
3. IF `selectedResourceId` is null for a `RESOURCE_RECOMMENDATION` log, THEN THE Explanation_Panel SHALL display a "No resource selected" indicator.

---

### Requirement 6: Explanation Panel — Resource Assignment and Rejection

**User Story:** As an Authorised_User, I want to see assignment confirmation details and structured rejection codes, so that I can trace every step of the dispatch workflow.

#### Acceptance Criteria

1. WHEN the Explanation_Panel of a `RESOURCE_ASSIGNMENT` Decision_Log_Card is expanded, THE Explanation_Panel SHALL display the `selectedResourceId` and any key-value pairs present in the `explanation` field.
2. WHEN the Explanation_Panel of a `RESOURCE_REJECTION` Decision_Log_Card is expanded, THE Explanation_Panel SHALL display the rejection `code` and `message` from the `explanation` field.
3. THE Explanation_Panel for a `RESOURCE_REJECTION` log SHALL visually distinguish the rejection code using the danger colour token `#E63946`.

---

### Requirement 7: Visual Design Consistency

**User Story:** As a user, I want the Decision Log section to match the design system of the rest of the dashboard, so that the page feels cohesive.

#### Acceptance Criteria

1. THE Decision_Log_Section SHALL use the card pattern `rounded-2xl border bg-white shadow-sm` consistent with other cards on the Incident_Detail_Page.
2. THE Decision_Log_Section header SHALL use the `History` icon from `lucide-react` and the heading text "Decision Log History".
3. THE Decision_Log_Card SHALL use colour token `#19C3B1` (teal) for type icons and positive indicators, `#E63946` (red) for rejection or error indicators, and `#0B1F33` (dark) for primary text.
4. THE Algorithm_Version_Badge SHALL use a muted background style consistent with other badges on the page (e.g. `bg-slate-100 text-slate-500`).
5. THE Decision_Log_Section SHALL be positioned below the Priority Engine card and above the page footer within the Incident_Detail_Page.

---

### Requirement 8: Expand/Collapse Interaction

**User Story:** As an Authorised_User, I want to expand only the decision entries I care about, so that the page does not become overwhelming with all entries open at once.

#### Acceptance Criteria

1. THE Decision_Log_Section SHALL render all Decision_Log_Cards in a collapsed state by default when the section first loads.
2. WHEN an Authorised_User clicks the toggle control on a Decision_Log_Card, THE Explanation_Panel SHALL toggle between expanded and collapsed states.
3. WHILE multiple Decision_Log_Cards are present, THE Decision_Log_Section SHALL allow any number of Explanation_Panels to be open simultaneously.
4. WHEN a Decision_Log_Card is expanded, the toggle control icon SHALL change from a down-facing chevron to an up-facing chevron.
