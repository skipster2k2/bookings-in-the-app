# NHS Unified Appointments Prototype

A prototype showing patient appointments from three NHS services — **GP Connect** (primary care, FHIR STU3), the **Patient Care Aggregator** (secondary care + e-RS, FHIR R4), and the **Vaccinations National Booking Service** (hypothetical FHIR R4 API) — in a single unified view.

Built with React + Vite. Uses mock data only — no real patient data.

> **Note on vaccination data:** The NBS does not currently expose a patient-facing FHIR API. It integrates with the NHS App via a web view using NHS login credentials. The vaccination data in this prototype uses a hypothetical API response to illustrate what a fully unified appointments view could look like. This is intended as a conversation starter with the Vaccinations Digital Services team.

## What it shows

- GP appointments (consultations, nurse appointments, telephone)
- Hospital outpatient bookings (via PCA / Wayfinder)
- e-RS referrals (ready to book, booked)
- Vaccination bookings (COVID-19, flu, RSV — hypothetical API)
- Cancelled appointments from all sources
- Deep links to patient portals and vaccination management
- Vaccination-specific details: programme, dose number, eligibility cohort, booking channel, site accessibility
- Actionable items flagging (questionnaires, bookings needed)
- Filtering by status and data source (GP, Hospital, Referrals, Vaccinations)

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

| Tag         | API                                    | FHIR version | Status          | What it covers                                    |
|-------------|----------------------------------------|--------------|-----------------|---------------------------------------------------|
| GP          | GP Connect (Patient Facing)            | STU3         | Live (draft spec) | GP consultations, nurse, telephone              |
| Hospital    | Patient Care Aggregator                | R4           | Live            | Outpatient bookings via PEP portals               |
| e-RS        | Patient Care Aggregator                | R4           | Live            | Referrals from e-Referral Service                 |
| Vaccination | Vaccinations National Booking Service  | R4           | **Hypothetical** | COVID-19, flu, RSV vaccination bookings           |

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

## Notes

- Mock data uses fictional patients and appointments — no real patient data
- Extension URLs in PCA and NBS mocks are best-effort interpretations — validate against actual specs
- Deep link URLs are illustrative and won't resolve
- The NBS vaccination source is clearly labelled as hypothetical in the UI with a banner and per-card annotations
- This is a demo, not production code — no auth, no error handling, no accessibility audit
- GP Connect uses FHIR STU3; PCA and the hypothetical NBS API use FHIR R4 — a real integration would need a normalisation layer to reconcile the two FHIR versions
