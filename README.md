# NHS Unified Appointments Prototype

A prototype showing patient appointments from four NHS APIs — **GP Connect** (primary care, FHIR STU3), the **Patient Care Aggregator** (secondary care + e-RS, FHIR R4), the **Vaccinations National Booking Service** (hypothetical FHIR R4 API), and **BaRS urgent dental** (FHIR R4, booked via NHS 111) — in a single unified view.

Built with React + Vite. Uses mock data only — no real patient data.

> **Note on vaccination data:** The NBS does not currently expose a patient-facing FHIR API. It integrates with the NHS App via a web view using NHS login credentials. The vaccination data in this prototype uses a hypothetical API response to illustrate what a fully unified appointments view could look like. This is intended as a conversation starter with the Vaccinations Digital Services team.

> **Note on dental data:** Only *urgent* dental appointments booked by NHS 111 via BaRS are represented. Routine NHS dental bookings are managed in practice-level dental software (EXACT, R4, SfD, Dentally etc.) with no national API — see "Out of scope" below.

## What it shows

- GP appointments (consultations, nurse appointments, telephone)
- Hospital outpatient bookings (via PCA / Wayfinder)
- e-RS referrals (ready to book, booked)
- Vaccination bookings (COVID-19, flu, RSV — hypothetical API)
- Urgent dental appointments (booked by NHS 111 via BaRS)
- Cancelled and past (fulfilled) appointments from all sources
- Deep links to patient portals, vaccination management, and dental service info
- Vaccination-specific details: programme, dose number, eligibility cohort, booking channel, site accessibility
- Dental-specific details: triage summary, Dx3 disposition, clinical timeframe countdown, booking source (111 telephony/online)
- Actionable items flagging (questionnaires, bookings needed)
- Filtering by status (upcoming, action needed, past, cancelled) and data source (GP, Hospital, Referrals, Vaccinations, Urgent Dental)

## Local development

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`

## Deploy to Netlify

### Option A: Git-connected (auto-deploy on push)

1. Push this repo to GitHub/GitLab
2. In Netlify: **Add new site → Import an existing project**
3. Connect your repo — Netlify will auto-detect the `netlify.toml` config
4. Deploy. Done.

### Option B: CLI deploy

```bash
npm install
npm run build
npx netlify-cli deploy --prod --dir=dist
```

### Option C: Drag and drop

```bash
npm install
npm run build
```

Then drag the `dist/` folder to [app.netlify.com/drop](https://app.netlify.com/drop).

## Project structure

```
├── index.html              # Vite entry point
├── netlify.toml            # Netlify build config
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx            # React mount
    └── UnifiedAppointments.jsx  # Main component (all mock data + UI)
```

## Data sources

| Tag           | API                                    | FHIR version | Status           | What it covers                                    |
|---------------|----------------------------------------|--------------|------------------|---------------------------------------------------|
| GP            | GP Connect (Patient Facing)            | STU3         | Live (draft spec)| GP consultations, nurse, telephone                |
| Hospital      | Patient Care Aggregator                | R4           | Live             | Outpatient bookings via PEP portals               |
| e-RS          | Patient Care Aggregator                | R4           | Live             | Referrals from e-Referral Service                 |
| Vaccination   | Vaccinations National Booking Service  | R4           | **Hypothetical** | COVID-19, flu, RSV vaccination bookings            |
| Urgent Dental | Booking and Referral Standard (BaRS)   | R4           | Live             | Emergency dental booked via NHS 111                |

### Why is the NBS API hypothetical?

The Vaccinations National Booking Service is built on the Q-Flow platform (ACF Technologies) and currently integrates with the NHS App by embedding the booking web journey using NHS login credentials. There is no documented patient-facing FHIR API for retrieving vaccination appointments.

The mock response in this prototype imagines what such an API could return, including vaccination-specific extensions for:

- **VaccineProgramme** — which national programme (COVID-19 Autumn 2026, Seasonal Flu 2025/26, RSV)
- **DoseNumber** — where the patient is in the vaccination course
- **EligibilityCohort** — why they qualified (clinical risk group, age band)
- **BookingChannel** — how the booking was made (NHS App, NHS website, 119)
- **SiteAccessibility** — wheelchair access, parking, public transport
- **ManageBookingLink** — deep link to the existing NBS manage booking journey

The SNOMED codes used for vaccine types are real and align with the existing Vaccination Events FHIR integration used for recording administered doses.

### How BaRS urgent dental works

The Booking and Referral Standard (BaRS) is a live FHIR R4 interoperability standard that enables NHS service providers to send booking and referral information between systems. When a patient calls NHS 111 with a dental emergency, the 111 system (e.g. Derbyshire Health United) uses the Directory of Services (DoS) to find an appropriate emergency dental service and books a slot via BaRS.

The mock includes BaRS-specific data:

- **BookingSender** — the NHS 111 provider that made the booking (ODS code)
- **DoSServiceId** — the Directory of Services identifier used to discover the emergency dental service
- **BookingSource** — whether the booking was made via 111 telephony or 111 online
- **AssessmentOutcomeTimeframe** — the clinical deadline from the Dx3 triage disposition
- **LinkedServiceRequest** — reference to the BaRS referral carrying clinical triage information (not surfaced to the patient)
- **Triage summary** — presenting complaint summary from the 111 assessment

Emergency dental services are a valid BaRS provider type. The mock uses the real ODS code for Derbyshire Community Health Services NHS Foundation Trust (RTG) which runs the emergency dental service across Derby and Chesterfield.

### Out of scope: routine dental bookings

Routine NHS dental appointments (checkups, hygiene, treatment courses) cannot be surfaced via any national API. They are managed entirely within practice-level dental practice management software (DPMS). The main systems used across England are:

- **EXACT** (Software of Excellence / Henry Schein One) — market leader
- **R4** (Henry Schein One) — large installed base in established practices
- **Systems for Dentists (SfD)** — one of the UK "Big Three", offers patient portal
- **Dentally** — cloud-based, growing market share
- **Bridge-IT**, **DentalPlus**, **Shire Dental System** and others

These are proprietary systems with no standardised FHIR API and no national aggregation layer. Surfacing routine dental bookings would require either a new DPMS interoperability standard (similar to what GP Connect did for GP systems) or mandating that dental software vendors expose a standardised appointment API — a multi-year programme.

### Out of scope: sexual health bookings

Sexual health services (e.g. the PHR system at myphr.online) deliberately operate outside the standard NHS data infrastructure. Patient data is not linked to NHS numbers or NHS records, by design, to protect confidentiality and encourage access to services. Integration would require a new consent-based data sharing model.

## Notes

- Mock data uses fictional patients and appointments — no real patient data
- Extension URLs in PCA, NBS and BaRS mocks are best-effort interpretations — validate against actual specs
- Deep link URLs are illustrative and won't resolve
- The NBS vaccination source is clearly labelled as hypothetical in the UI with a banner and per-card annotations
- The BaRS urgent dental source uses a real standard but the mock assumes a patient-facing retrieval mechanism that may not exist today — BaRS is primarily a system-to-system booking standard
- This is a demo, not production code — no auth, no error handling, no accessibility audit
- GP Connect uses FHIR STU3; PCA, NBS (hypothetical) and BaRS use FHIR R4 — a real integration would need a normalisation layer to reconcile the two FHIR versions
