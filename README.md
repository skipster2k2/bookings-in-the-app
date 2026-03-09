# NHS Unified Appointments Prototype

A prototype showing patient appointments from two NHS APIs — **GP Connect** (primary care, FHIR STU3) and the **Patient Care Aggregator** (secondary care + e-RS, FHIR R4) — in a single unified view.

Built with React + Vite. Uses mock data only — no real patient data.

## What it shows

- GP appointments (consultations, nurse appointments, telephone)
- Hospital outpatient bookings (via PCA / Wayfinder)
- e-RS referrals (ready to book, booked)
- Cancelled appointments from both sources
- Deep links to patient portals for secondary care
- Actionable items flagging (questionnaires, bookings needed)
- Filtering by status and data source

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

| Tag      | API                          | FHIR version | What it covers                          |
|----------|------------------------------|--------------|-----------------------------------------|
| GP       | GP Connect (Patient Facing)  | STU3         | GP consultations, nurse, telephone      |
| Hospital | Patient Care Aggregator      | R4           | Outpatient bookings via PEP portals     |
| e-RS     | Patient Care Aggregator      | R4           | Referrals from e-Referral Service       |

## Notes

- Mock data uses fictional patients and appointments
- Extension URLs in PCA mock are best-effort interpretations — validate against the actual OAS spec
- Deep link URLs are illustrative and won't resolve
- This is a demo, not production code — no auth, no error handling, no accessibility audit
