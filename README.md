# NHS Unified Appointments Prototype — Derby and Derbyshire ICB

A prototype showing patient appointments from four NHS APIs in a single unified view, researched and scoped for the **NHS Derby and Derbyshire Integrated Care Board (ICB)** area. While the national APIs (GP Connect, PCA, BaRS) work the same way across England, the out-of-scope analysis, local providers, mock data, and gap assessment are specific to Derbyshire's health and care landscape.

The APIs used are: **GP Connect** (primary care, FHIR STU3), the **Patient Care Aggregator** (secondary care + e-RS, FHIR R4), the **Vaccinations National Booking Service** (hypothetical FHIR R4 API), and **BaRS urgent dental** (FHIR R4, booked via NHS 111).

Built with React + Vite. Uses mock data only — no real patient data.

> **Derbyshire context:** Mock data references real Derbyshire providers and locations — Whitworth Medical Centre, Northern Care Alliance, Rochdale Infirmary, Royal Derby Hospital, Chesterfield Royal Hospital, Derbyshire Community Health Services NHS FT, Derbyshire Health United (NHS 111), Heywood Vaccination Centre, and Boots Pharmacy Rochdale. The out-of-scope analysis covers Derbyshire-specific services including the Derby and Derbyshire CUES pathway, DCHS health visiting, Derbyshire County Council family support, and the Derbyshire emergency dental service. Other ICB areas may have different local providers, community trust arrangements, and commissioned services — this analysis should not be assumed to apply elsewhere without local validation.

> **Note on vaccination data:** The NBS does not currently expose a patient-facing FHIR API. It integrates with the NHS App via a web view using NHS login credentials. The vaccination data in this prototype uses a hypothetical API response to illustrate what a fully unified appointments view could look like. This is intended as a conversation starter with the Vaccinations Digital Services team.

> **Note on dental data:** Only *urgent* dental appointments booked by NHS 111 via BaRS are represented. Routine NHS dental bookings are managed in practice-level dental software (EXACT, R4, SfD, Dentally etc.) with no national API — see "Not currently possible" below.

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
| GP            | GP Connect (Patient Facing)            | STU3         | Live (draft spec, limited consumers) | GP consultations, nurse, telephone |
| Hospital      | Patient Care Aggregator                | R4           | Live             | Outpatient bookings via PEP portals               |
| e-RS          | Patient Care Aggregator                | R4           | Live             | Referrals from e-Referral Service                 |
| Vaccination   | Vaccinations National Booking Service  | R4           | **Hypothetical** | COVID-19, flu, RSV vaccination bookings            |
| Urgent Dental | Booking and Referral Standard (BaRS)   | R4           | Live             | Emergency dental booked via NHS 111                |

### Note on GP Connect Patient Facing status

The GP Connect *Appointment Management* API (clinician-facing, used by NHS 111, extended access hubs, and practice staff) is live and in production at v1.2.7. However, the *Patient Facing* Appointment Management API — which is the one used by the NHS App and represented in this prototype — has its specification still marked as **draft** on Simplifier. The Patient Facing APIs are currently only available for New Market Entrant GP system suppliers as data providers, with the NHS App as the sole consumer. As of July 2025, NHS England is not onboarding any additional consumer suppliers. This position will be reviewed once all providers are compliant. Additionally, new supplier development for the clinician-facing GP Connect Appointment Management has been paused, with responsibility handed to the Referrals and Appointments Team.

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

### Not currently possible: routine dental bookings (Derbyshire and national)

Routine NHS dental appointments (checkups, hygiene, treatment courses) cannot be surfaced via any national API. They are managed entirely within practice-level dental practice management software (DPMS). The main systems used across England (including Derbyshire) are:

- **EXACT** (Software of Excellence / Henry Schein One) — market leader
- **R4** (Henry Schein One) — large installed base in established practices
- **Systems for Dentists (SfD)** — one of the UK "Big Three", offers patient portal
- **Dentally** — cloud-based, growing market share
- **Bridge-IT**, **DentalPlus**, **Shire Dental System** and others

These are proprietary systems with no standardised FHIR API and no national aggregation layer. Surfacing routine dental bookings would require either a new DPMS interoperability standard (similar to what GP Connect did for GP systems) or mandating that dental software vendors expose a standardised appointment API — a multi-year programme.

### Not currently possible: sexual health bookings (Derbyshire and national)

Sexual health services (e.g. the PHR system at dchs.myphr.online used by Derbyshire Community Health Services, and similar myphr.online instances across England) deliberately operate outside the standard NHS data infrastructure. Patient data is not linked to NHS numbers or NHS records, by design, to protect confidentiality and encourage access to services. Integration would require a new consent-based data sharing model. This is a national architectural decision, not specific to Derbyshire.

### Not currently possible: optometry and eye care bookings (Derbyshire-specific analysis)

NHS eye care appointments in Derbyshire fall into three categories, each with different integration implications:

**Routine NHS sight tests** are booked directly with high-street opticians by phone, walk-in, or through each chain's own platform. The big chains (Specsavers, Boots Opticians, Vision Express) have proprietary online booking systems, and independent practices use commercial practice management software such as Optisoft, Optinet, I-Clarity, Opticabase, or EYEris. There is no national booking service, no FHIR API, and no NHS number linkage for booking. NHS England commissions over 13 million NHS sight tests per year, but the booking infrastructure is entirely practice-level — the same gap as routine dental.

**Community Urgent Eyecare Service (CUES)** is commissioned by ICBs and delivered through local optometry practices via Primary Eyecare Services. In Derbyshire, the CUES service is available for patients registered with a Derby and Derbyshire ICB GP or Glossop GP. Patients call a participating optician, are triaged, and may be given self-care advice, booked for a virtual or face-to-face appointment, or referred onward. Some areas use a clinician-facing platform called OPERA (Optometric Electronic Referral and Assessment) to manage the referrals and link to e-RS. However, CUES and OPERA are clinician-facing — there is no patient-facing API for retrieving CUES appointments.

**Hospital ophthalmology** referrals (cataracts, glaucoma, retinal conditions etc.) go through e-RS and are managed by hospital trusts. These are already covered by the Patient Care Aggregator — if a Derbyshire patient is referred from their optician to Royal Derby Hospital ophthalmology, the referral and any outpatient appointment will surface in the PCA data alongside other secondary care bookings. No additional integration is needed for this pathway.

### Not currently possible: children's centres, family hubs and community health services (Derbyshire-specific analysis, national implications)

Sure Start children's centres in Derbyshire (many now rebranded as Family Hubs under the national Family Hubs programme) and the NHS services delivered through them represent a significant gap in the unified appointments vision. The specific providers and arrangements described below are for the Derby and Derbyshire ICB area — other ICBs will have different community trust configurations — but the underlying gap (no national API for community health appointments) is a national issue.

**Health visitor appointments** (the NHS element) — the mandated Healthy Child Programme reviews (antenatal, new birth, 6-8 week, 9-12 month, 2-2½ year) are delivered by health visitors employed by community NHS trusts. In Derbyshire, this is Derbyshire Community Health Services NHS Foundation Trust (DCHS). Appointments are managed internally by health visiting teams via phone, text (some areas use ChatHealth), or letter. The underlying clinical systems are typically SystmOne (TPP), EMIS Community, or specialist child health information systems like Careplus. None expose a patient-facing appointment API.

**Drop-in sessions** (baby weighing clinics, breastfeeding support, stay-and-play) — overwhelmingly walk-in with no booking. Some moved to bookable slots post-COVID but managed via phone calls to the centre or the health visiting duty line, not through any digital system.

**Local authority family support** — parenting courses, early help assessments, family support workers. These are council services (Derbyshire County Council / Derby City Council), not NHS, managed through local authority case management systems (Mosaic, Liquid Logic, Eclipse) with no NHS data linkage.

**Referred specialist community services** — if a child is referred from a children's centre to speech and language therapy (SALT), community paediatrics, or occupational therapy, those referrals flow through NHS community trust systems. If the specialist service is hospital-based, it could appear via e-RS and the PCA. But community trust appointments (SALT, community paediatrics, health visiting) do not surface in any national patient-facing system.

#### Why the PCA doesn't cover community trusts

The Patient Care Aggregator's scope is explicitly limited to **acute/secondary care**. Its eligibility criteria require that a booking system represents "at least one acute NHS trust that handles outpatient appointments in England", and the March 2024 mandate was for "all non-specialist acute care settings" to integrate. The language throughout the PCA documentation is consistently "secondary care", "acute trusts", and "hospital" — community trusts are not mentioned.

This means community NHS trusts fall into a gap between all three national APIs:

| API | Scope | Community trusts? |
|-----|-------|-------------------|
| GP Connect | Primary care (GP practices) | No |
| Patient Care Aggregator | Acute/secondary care (hospitals) | No — explicitly scoped to acute trusts |
| BaRS | Urgent care booking between services | No — system-to-system, not patient-facing retrieval |

The PCA's technical architecture (FHIR R4, deep links to patient portals, Get Appointments API standard) *could* theoretically be extended to community trusts, but this would require:

1. A policy decision to broaden the PCA's scope beyond acute care
2. Community trusts to build patient engagement portals (PEPs) and Get Appointments APIs
3. Community trust PAS/clinical systems (SystmOne, EMIS Community, Careplus) to expose appointment data in a standardised format
4. Assurance and onboarding of community trust suppliers through the Partner Gateway

#### Strategic significance

This is arguably the most important gap for the NHS App to address. Health visitor appointments, district nursing visits, community paediatric assessments, and SALT sessions are genuine NHS appointments that patients and families need to attend, but they are invisible to every national API in this prototype.

The gap will become more visible as the NHS 10 Year Health Plan's emphasis on moving care into community settings takes effect. The 2024 House of Lords Integration of Primary and Community Care Committee report highlighted the challenge of integrating primary and community care, noting that fragmented digital infrastructure is a barrier to the integrated care that ICSs are expected to deliver.

Possible approaches to closing this gap:

- **Extend the PCA to community trusts** — leverage existing architecture, but requires community trusts to build PEPs and APIs
- **Extend GP Connect to community health trusts** — some community services (district nursing, health visiting) are similar in character to primary care
- **Build a new community services aggregator** — purpose-built for the different appointment patterns in community care (home visits, group sessions, drop-ins)
- **Mandate community trust PAS vendors to expose FHIR APIs** — similar to what GP Connect did for GP system suppliers, but for community clinical systems

### Not currently possible (with future potential): community pharmacy (national, with Derbyshire context)

Community pharmacy appointments present a mixed picture — mostly walk-in today, but with national digital standards actively being developed that could enable integration in future.

#### Current landscape

Community pharmacies in England use one of four NHS-assured Pharmacy First IT systems to manage consultations and claims: **PharmOutcomes** (Pinnacle Health Partnership), **Sonar** (Cegedim), **NHSPharmacy** (Positive Solutions / EMIS), and **Titan PMR** (Invatech Health). These are mandated for recording Pharmacy First consultations and submitting claims to the NHSBSA.

Current booking pathways into pharmacy are:

- **Walk-in** — the majority of Pharmacy First consultations require no appointment. Pharmacists can see patients without a booking.
- **GP referral** — when a patient contacts their GP with symptoms suitable for Pharmacy First (7 common conditions including UTI, shingles, impetigo, infected insect bites, sinusitis, sore throat, earache), practice care navigators can refer the patient to a community pharmacist of their choice.
- **NHS 111 referral** — 111 can refer patients to pharmacy via the Directory of Services.
- **NBS vaccinations** — the National Booking Service handles COVID-19 vaccination bookings at pharmacies, with flu vaccine booking being piloted (already covered by the hypothetical NBS source in this prototype).
- **Chain-specific online booking** — some pharmacy chains (Pharmacy+Health, Pharmacy2U, Boots) offer their own proprietary online booking for Pharmacy First, but these are not standardised.

None of these pathways currently expose a patient-facing API for retrieving "my upcoming pharmacy appointments".

#### Why this is different from dental and optometry

Unlike routine dental and optometry (which have no national integration standards on the horizon), pharmacy has active national digital development underway:

- **BaRS for pharmacy** — Community Pharmacy England and NHS England are actively working on implementing the Booking and Referral Standard for pharmacy, including Pharmacy First referrals from GP practices and NHS 111. IT suppliers will be required to meet BaRS. Once live, GP→pharmacy and 111→pharmacy referrals will flow through standardised FHIR R4 pathways.
- **GP Connect Update Record** — already used by Pharmacy First IT systems to send consultation outcomes back to the patient's GP. This demonstrates that pharmacy systems can participate in national interoperability standards.
- **Directory of Services (DoS)** — participating pharmacies are already listed on the DoS, making them discoverable by 111 and other referring services.

#### What would be needed to surface pharmacy appointments in the NHS App

1. **BaRS implementation for pharmacy to complete** — once GP→pharmacy referrals flow through BaRS, the booking data exists in a standardised format
2. **A patient-facing retrieval mechanism** — BaRS is system-to-system; an additional layer would be needed for the NHS App to retrieve a patient's pharmacy bookings (similar to the gap noted for urgent dental)
3. **Walk-in consultations to be retrospectively visible** — most pharmacy interactions are walk-in, so a "past consultations" view (from GP Connect Update Record notifications) might be more valuable than a "future appointments" view
4. **Pharmacy patient portals** — pharmacies would need to build or adopt patient engagement portals, similar to the PEPs used by secondary care in the PCA

The pharmacy sector is arguably closest to having the national plumbing in place for future integration, even though no patient-facing API exists today. BaRS maturity for pharmacy is the key milestone to watch.

## Notes

- Mock data uses fictional patients and appointments — no real patient data
- Extension URLs in PCA, NBS and BaRS mocks are best-effort interpretations — validate against actual specs
- Deep link URLs are illustrative and won't resolve
- The NBS vaccination source is clearly labelled as hypothetical in the UI with a banner and per-card annotations
- The BaRS urgent dental source uses a real standard but the mock assumes a patient-facing retrieval mechanism that may not exist today — BaRS is primarily a system-to-system booking standard
- This is a demo, not production code — no auth, no error handling, no accessibility audit
- GP Connect uses FHIR STU3; PCA, NBS (hypothetical) and BaRS use FHIR R4 — a real integration would need a normalisation layer to reconcile the two FHIR versions

## Derbyshire-specific providers referenced in mock data and analysis

| Provider | ODS code | Role in prototype |
|----------|----------|-------------------|
| Whitworth Medical Centre | — | Mock GP practice (GP Connect) |
| Northern Care Alliance NHS FT | RXA | Mock hospital outpatient (PCA) |
| Pennine Acute Hospitals NHS Trust | RW6 | Mock hospital outpatient (PCA) |
| Manchester University NHS FT | R0A | Mock e-RS referral (PCA) |
| University Hospitals of Derby and Burton NHS FT | RTG | Mock ophthalmology outpatient (PCA) |
| Chesterfield Royal Hospital NHS FT | — | Mock ophthalmology follow-up (PCA) |
| Derbyshire Community Health Services NHS FT | RTG | Emergency dental provider (BaRS), health visiting (not currently possible), sexual health PHR (not currently possible) |
| Derbyshire Health United | DHU | NHS 111 provider for Derbyshire (BaRS booking sender) |
| Heywood Vaccination Centre | — | Mock vaccination site (NBS hypothetical) |
| Boots Pharmacy, Rochdale | FLJ64 | Mock pharmacy vaccination site (NBS hypothetical) |

## Applicability to other ICB areas

The **national APIs** (GP Connect, PCA, BaRS, NBS) work the same way across England — the data sources table and integration patterns described here apply nationally.

The **out-of-scope analysis** is Derbyshire-specific and may differ in other ICB areas:

- **CUES** — commissioned by individual ICBs; coverage, participating practices and triage pathways vary by area
- **Community health trusts** — each ICB area has different community trust arrangements (some areas have combined acute/community trusts, some have standalone community trusts, some have integrated care organisations)
- **Emergency dental** — commissioned locally; the specific provider (DCHS in Derbyshire) and locations will differ
- **Sexual health** — the PHR (myphr.online) system is used across multiple areas but not universally; some areas use different platforms
- **Pharmacy** — the four NHS-assured IT systems and Pharmacy First pathways are national, but local commissioning of enhanced services varies

Before applying this analysis to another ICB area, validate the local provider landscape, commissioned pathways, and community trust configurations with that ICB's digital team.
