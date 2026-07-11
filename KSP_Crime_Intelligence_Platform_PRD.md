# Product Requirements Document
## Crime Intelligence & Analytical Platform (CIAP) for Karnataka State Police
### Datathon 2026 Submission

**Version:** 1.0
**Prepared for:** Datathon 2026
**Document Owner:** BlackBox
**Status:** Draft for Review

---

## 1. Executive Summary

The Karnataka State Police (KSP) and State Crime Records Bureau (SCRB) currently rely on manual, Excel-based, siloed reporting that prevents state-wide pattern discovery and proactive policing. This PRD defines **CIAP (Crime Intelligence & Analytical Platform)** — a unified web platform that ingests structured crime records (per the schema provided by the hackathon organizers), and layers geospatial visualization, network/link analysis, and AI-driven predictive analytics on top of it, transforming SCRB from a passive report-receiver into an active **Strategic Intelligence Hub**.

The platform is organized around three pillars that map directly to the problem statement:

1. **Advanced Visualization** — interactive maps, drill-downs, hotspot detection, trend alerts
2. **Criminological Network & Link Analysis** — graph-based relationship mapping between suspects, victims, and locations
3. **Sociological & AI-Driven Predictive Dashboards** — risk scoring, socio-economic overlays, anomaly detection

---

## 2. Problem Statement

| Current Gap | Consequence |
|---|---|
| Data silos / manual Excel workflows | No single source of truth; duplication; delayed reporting |
| No advanced analytics | Hidden behavioral patterns, social networks, and criminal syndicates go undetected |
| Fragmented data reaching SCRB | State-wide analysis is incomplete or delayed |
| Reactive policing model | No early warning system for emerging crime trends; resources deployed after the fact, not before |

**Goal statement:** Build a platform that turns raw, tabular crime records into spatial, relational, and predictive intelligence — enabling SCRB and district units to move from "what happened" to "what is likely to happen, where, and to whom."

---

## 3. Objectives & Success Criteria

| Objective | Success Metric (for datathon demo) |
|---|---|
| Replace static reporting with interactive dashboards | Working district → station drill-down map with live filters |
| Reveal hidden criminal networks | Graph visualization linking ≥3 entity types (suspect, victim, location) from schema data |
| Enable proactive resource deployment | Functional hotspot layer (spatiotemporal) with at least one predictive overlay |
| Demonstrate AI/ML value-add | At least one working ML model (clustering, anomaly detection, or risk scoring) with measurable output, not just mockups |
| Prove scalability beyond demo data | Data model and architecture generalize to state-wide, multi-district ingestion |

---

## 4. Target Users & Personas

| Persona | Role | Key Needs |
|---|---|---|
| **SCRB Analyst** | State-level policy & trend analysis | Aggregated, state-wide dashboards; anomaly and trend alerts |
| **District SP / Station Officer** | Local operations | District/station drill-down, hotspot maps, repeat-offender lookups |
| **Investigating Officer (IO)** | Case-level investigation | Network/link analysis for a specific suspect or case; MO matching across jurisdictions |
| **Policy Maker / Home Department** | Strategic planning | Socio-economic correlation views, high-risk zone forecasts |

---

## 5. Scope

### 5.1 In Scope (Datathon MVP)
- Ingestion & normalization of the provided crime records schema (incidents, offenders, victims, locations)
- Interactive geospatial dashboard (district → station drill-down)
- Spatiotemporal hotspot detection (time-of-day × location clustering)
- Node-link graph for suspect–victim–location relationships
- Repeat offender / MO pattern view
- At least one predictive/ML model: risk scoring **or** anomaly detection **or** hotspot forecasting
- Trend-spike visual alerting (e.g., category spike vs. historical baseline)

### 5.2 Out of Scope (Future Phases)
- Real-time integration with live KSP records systems (FIR management systems, CCTNS)
- Full production-grade authentication/RBAC hardening (a basic role mock is sufficient for demo)
- Mobile field-officer app
- Full state-wide socio-economic dataset integration (demo will use a representative subset, e.g., Census/NCRB open data)
- Legal/court outcome tracking

---

## 6. Functional Requirements

### FR-1: Advanced Visualization & Geospatial Intelligence
- **FR-1.1 District-Level Drill-down:** Choropleth/point map of Karnataka districts; click-through to police-station-level view; filterable by crime type, date range, and severity.
- **FR-1.2 Spatiotemporal Clusters ("Hotspots"):** Cluster incidents using density-based clustering (e.g., DBSCAN/HDBSCAN) across (lat, long, time-of-day/day-of-week) to surface hotspots; render as heatmap layer.
- **FR-1.3 Emerging Trend Alerts:** Compare rolling crime-category counts per region against historical (e.g., 6–12 month) baseline using a z-score or percentage-change threshold; trigger a "red-zone pulsing" visual marker on the map when the threshold is exceeded.

### FR-2: Criminological Network & Link Analysis
- **FR-2.1 Relationship Mapping:** Build a graph where nodes = {`Accused`, `Victim`, `ComplainantDetails`, `Unit` (police station), `CaseMaster`} and edges = co-occurrence via shared `CaseMasterID`; render with a force-directed graph layout (interactive: zoom, filter by entity type, expand node).
- **FR-2.2 Repeat Offender Tracking:** For any `Accused` node, surface a timeline/profile of all linked `CaseMaster` records (across `PoliceStationID`/`DistrictID`), joined with `ArrestSurrender` history, and a derived Modus Operandi (MO) signature (see FR-2.2a below — the schema has no native MO field, so this must be engineered).
- **FR-2.2a MO Derivation (engineered feature):** Since there is no explicit MO column, construct an MO signature per case from the combination of `CrimeHeadID` + `CrimeSubHeadID` + `ActSectionAssociation` (Act/Section combo) + `GravityOffenceID` + time-of-day/day-of-week bucket from `IncidentFromDate`. Two cases with a matching/near-matching signature are treated as MO-similar.
- **FR-2.3 Association Detection:** Highlight indirect connections (e.g., two `Accused` who don't share a `CaseMasterID` but share a `Victim`, a `ComplainantDetails` record, or the same `PoliceStationID`/`Unit`) using graph traversal (2-hop/3-hop neighbors) — this is the feature that Excel-based workflows structurally cannot surface.

### FR-3: Sociological & AI-Driven Predictive Dashboards
- **FR-3.1 Socio-Economic Correlation:** Overlay crime density with external socio-economic layers (population density, urbanization index, literacy/income proxies from public datasets) and compute correlation coefficients per district to support "why here" narratives.
- **FR-3.2 Predictive Risk Scoring:** Train a model (e.g., gradient-boosted trees or a simple spatial regression) to output a per-region "risk score" for the next period, based on historical incident density, seasonality, and socio-economic features.
- **FR-3.3 Anomaly Detection:** Flag individual incidents or regional patterns that deviate from learned norms (e.g., isolation forest on incident feature vectors) and visually call them out for investigator review.

### FR-4: Pattern & Trend Discovery
- Statistical summaries: time-series decomposition (trend/seasonality), day-of-week and time-of-day distributions per crime category, per district comparative rankings.

### FR-5: Network & Behavioral Analysis
- MO similarity scoring between offenders (e.g., cosine similarity over encoded MO attribute vectors) to suggest "this suspect may be linked to case X" even without a direct data connection.

### FR-6: AI/ML-Driven Intelligence Layer
- Modular ML service exposing: clustering (hotspots), classification/regression (risk scoring), anomaly detection, and similarity scoring — all consuming the shared schema and exposing results via API to the front-end dashboards.

---

## 7. Data & Schema Mapping (Official Police FIR Schema)

This section maps CIAP's features directly onto the provided **Police FIR System ER schema** (Karnataka Police Department).

**Core transactional tables and their role in CIAP:**

| Table | Role in CIAP |
|---|---|
| `CaseMaster` | Central fact table — every FIR/case. Carries `latitude`/`longitude`, `IncidentFromDate`/`IncidentToDate`, `CrimeMajorHeadID`/`CrimeMinorHeadID`, `GravityOffenceID`, `CaseStatusID`. This is the primary source for the geospatial map, hotspot clustering, and trend alerts. |
| `Victim` | Victim demographics per case → victim nodes in the network graph; age/gender breakdowns for sociological dashboards. |
| `Accused` | Suspect demographics per case (`PersonID` e.g. A1, A2 for multi-accused cases) → suspect nodes; core entity for repeat-offender tracking and MO derivation. |
| `ComplainantDetails` | Complainant demographics, including caste/religion/occupation → sociological correlation layer (handle with care — see Section 10). |
| `ArrestSurrender` | Arrest/surrender events, linked to `Accused`, `IOID` (investigating officer), and jurisdiction (`State`/`District`/`Unit`) → feeds repeat-offender jurisdiction-hopping analysis and IO workload views. |
| `ActSectionAssociation` + `Act` + `Section` | Legal classification of each case → used for MO signature construction and severity weighting. |
| `CrimeHead` / `CrimeSubHead` | Major/minor crime classification (e.g. "Crimes Against Body" → "Murder") → primary category filter for maps and trend alerts. |
| `Unit` / `UnitType` / `District` / `State` | Jurisdiction hierarchy → powers the district → station drill-down (FR-1.1). `Unit.ParentUnit` gives a self-referencing hierarchy useful for circle/range-level rollups. |
| `Employee` / `Rank` / `Designation` | Officer metadata → useful for IO workload dashboards (stretch feature, not in MVP scope). |
| `ChargesheetDetails` | Case outcome (`cstype`: Chargesheet / False Case / Undetected) → a strong candidate **label** for the predictive risk-scoring model (e.g., predicting probability of "Undetected" outcome) and for case-clearance-rate dashboards. |
| `CaseStatusMaster`, `CaseCategory`, `GravityOffence` | Lookup tables for filters across all dashboards. |

**Notable schema gaps to design around:**
- **No explicit `Location`/address table** beyond `Unit` (station) and `CaseMaster.latitude/longitude` — geospatial work relies entirely on validating these two lat/long columns; build a fallback that geocodes to the `Unit`'s station location when they're null.
- **No native MO field** — must be engineered as described in FR-2.2a, from `CrimeHead`/`CrimeSubHead`/`Act`/`Section`/`GravityOffence`/time patterns.
- **`CrimeNo` is itself structurally rich** — it encodes Case Category + District + Station + Year + Serial Number as a composable string. This can be parsed as a free validation check (cross-verify against the FK fields) or as a fast lookup key, but the FK columns remain the source of truth.
- **Multi-accused cases** use `PersonID` (A1, A2…) inside `Accused` — important for correctly building "gang"/multi-offender case nodes in the graph rather than treating each accused as an isolated case.

**Data Preparation Requirements:**
- Null/outlier checks on `CaseMaster.latitude/longitude` before any geospatial clustering
- Entity resolution across `Accused.AccusedName` (name variants/spelling across cases) — needed for accurate repeat-offender linking, since there's no biometric/ID key for accused persons in this schema
- A denormalized analytical view joining `CaseMaster` + `CrimeHead`/`CrimeSubHead` + `District`/`Unit` + `ChargesheetDetails` for fast dashboard queries (avoid live multi-join queries against the transactional schema)
- Pre-computed MO signature column per case (see FR-2.2a) to avoid recomputing at query time

**External Data (for socio-economic overlay, FR-3.1):**
- The schema has no socio-economic table, so this remains an external enrichment layer: public datasets (Census of India, NCRB open reports, Karnataka open-data portal) joined at the `District` level — clearly labeled in the UI as illustrative/demo-scale, not official SCRB data.

**Sensitive fields requiring explicit handling:**
- `ComplainantDetails.CasteID` / `ReligionID` — must never be used as a direct input feature to risk-scoring or anomaly models (bias risk); may only appear in aggregated, opt-in sociological views, never in per-individual displays. See Section 10.

---

## 8. Proposed Technical Architecture

```
┌─────────────────────────────┐
│   Frontend (Dashboard UI)   │  React + TypeScript, map layer (Leaflet/Mapbox GL),
│                             │  graph layer (D3.js / react-force-graph / Cytoscape.js)
└──────────────┬──────────────┘
               │ REST/GraphQL API
┌──────────────▼──────────────┐
│   Backend / API Layer       │  Spring Boot (Java) or Node.js/Express
│                             │  - Auth & role mock (Analyst/Officer/Investigator)
│                             │  - REST endpoints for incidents, graph, hotspots, risk
└──────────────┬──────────────┘
               │
     ┌─────────┴──────────┐
     │                    │
┌────▼─────┐      ┌───────▼────────┐
│ Analytical│      │  ML/AI Service │  Python (FastAPI) — scikit-learn / PyTorch
│ Database  │      │  - Clustering  │  - clustering (hotspots)
│ (MySql)│      │  - Anomaly     │  - risk scoring (XGBoost/regression)
└───────────┘      │  - Similarity  │  - MO similarity scoring
                    └────────────────┘
```


**Option A — Datathon fast path (recommended given the time limit):**
- Single **Python (FastAPI)** backend serving both REST endpoints *and* ML logic in one codebase (scikit-learn, XGBoost) — no inter-service calls to build/debug.
- React + TypeScript frontend consuming that one API.
- MySql for database
- Fastest to build and demo; the trade-off is it's a monolith, which is fine for a 3-day event.


---

## 9. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | Map/dashboard queries should return in <2s for district-level views on demo dataset |
| Scalability | Schema/architecture should conceptually scale to state-wide data (documented, not necessarily load-tested in demo) |
| Security & Privacy | PII (victim/offender identity) must be role-gated in the demo; mock RBAC is acceptable, but the design must show awareness of data sensitivity |
| Explainability | Predictive/risk outputs must show contributing factors (not a black box) — critical for law-enforcement trust and usability |
| Auditability | Every AI-flagged anomaly or risk score should be traceable to the underlying records used |

---

## 10. Ethical & Responsible-AI Considerations

Given the sensitivity of policing data, the platform design must explicitly address:
- **Bias mitigation:** Risk-scoring/anomaly models must be evaluated for disproportionate flagging of specific demographics or areas; document this evaluation even at demo scale.
- **Caste/religion exclusion from models:** `ComplainantDetails.CasteID` and `ReligionID` exist in the schema but must be **excluded as model features** in risk scoring, anomaly detection, and MO similarity — they may only appear in aggregated, opt-in sociological/demographic views (e.g., district-level victim demographics for policy research), never as an input signal or in per-individual displays.
- **Human-in-the-loop:** All predictive outputs (risk scores, anomaly flags, suggested associations) are **decision-support**, not automated action triggers — always reviewed by an investigating officer.
- **Data minimization:** Only fields necessary for analytical value are surfaced in dashboards; raw PII (`ComplainantName`, `VictimName`, `AccusedName`) is masked/role-gated by default in aggregate views, visible only to authorized investigating roles.

*(Including this section explicitly is likely to be a strong differentiator for judges, since responsible-AI framing is often what separates finalist submissions in government-facing datathons.)*

---

## 11. Datathon Execution Plan (Suggested Timeline)

| Phase | Focus | Deliverable |
|---|---|---|
| Day 1 (AM) | Schema review, data cleaning, geocoding | Clean analytical dataset + ER diagram |
| Day 1 (PM) | Core dashboard: district/station drill-down map | Working map with filters |
| Day 2 (AM) | Network/link graph (suspect-victim-location) | Interactive graph view |
| Day 2 (PM) | ML layer: hotspot clustering + one predictive model | API returning clusters/risk scores |
| Day 3 (AM) | Trend alerts, socio-economic overlay, anomaly callouts | Integrated dashboard |
| Day 3 (PM) | Polish, demo script, PPT/pitch, responsible-AI writeup | Final submission + live demo |

---

## 12. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| `CaseMaster.latitude/longitude` null or inaccurate for some records | Pre-build a geocoding fallback using `Unit` (station) location as a centroid substitute |
| `Accused`/`Victim` name variants prevent clean entity linking (no biometric ID in schema) | Apply fuzzy string matching (e.g., Levenshtein/Jaro-Winkler) as a documented limitation, not a silent assumption |
| Limited time for ML model tuning | Prioritize one well-explained model over three shallow ones |
| Graph visualization becomes cluttered with real data volume | Add server-side filtering (top-N connections, entity-type toggle) before rendering |
| Judges question data privacy/ethics | Have the Responsible-AI section (Sec. 10) ready as a dedicated slide |

---

## 13. Appendix: Feature-to-Requirement Traceability

| Problem Statement Ask | PRD Section |
|---|---|
| District-Level Drill-down | FR-1.1 |
| Spatiotemporal Clusters | FR-1.2 |
| Emerging Trend Alerts | FR-1.3 |
| Relationship Mapping | FR-2.1 |
| Repeat Offender Tracking | FR-2.2 |
| Association Detection | FR-2.3 |
| Socio-Economic Correlation | FR-3.1 |
| Predictive Risk Scoring | FR-3.2 |
| Anomaly Detection | FR-3.3 |
| Pattern & Trend Discovery | FR-4 |
| Network & Behavioral Analysis | FR-5 |
| AI/ML-Driven Intelligence | FR-6 |

---

*End of Document*
