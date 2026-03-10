import { useState, useMemo } from "react";

// ═══════════════════════════════════════════════════════════════════════
// MOCK DATA — Four API sources (five logical sources)
// ═══════════════════════════════════════════════════════════════════════

// 1. GP Connect (primary care — FHIR STU3)
const gpConnectAppointments = [
  {
    id: "gpc-1001", source: "gp-connect", status: "booked",
    type: "GP Consultation", specialty: "General Practice",
    provider: "Whitworth Medical Centre", practitioner: "Dr Sarah Mitchell",
    location: "Whitworth Medical Centre, Market Street, Whitworth, OL12 8QN",
    start: "2026-03-15T09:30:00+00:00", end: "2026-03-15T09:45:00+00:00",
    deliveryChannel: "In-person", created: "2026-03-09T14:22:00+00:00",
  },
  {
    id: "gpc-1002", source: "gp-connect", status: "booked",
    type: "Blood Test", specialty: "General Practice",
    provider: "Whitworth Medical Centre", practitioner: "Nurse James Thornton",
    location: "Whitworth Medical Centre, Market Street, Whitworth, OL12 8QN",
    start: "2026-03-22T11:00:00+00:00", end: "2026-03-22T11:20:00+00:00",
    deliveryChannel: "In-person", created: "2026-03-07T10:15:00+00:00",
  },
  {
    id: "gpc-1003", source: "gp-connect", status: "cancelled",
    type: "Telephone Consultation", specialty: "General Practice",
    provider: "Whitworth Medical Centre", practitioner: "Dr Sarah Mitchell",
    location: "Whitworth Medical Centre, Market Street, Whitworth, OL12 8QN",
    start: "2026-03-18T14:00:00+00:00", end: "2026-03-18T14:10:00+00:00",
    deliveryChannel: "Telephone", created: "2026-03-05T09:40:00+00:00",
    cancellationReason: "Patient cancelled",
  },
];

// 2. Patient Care Aggregator (secondary care + e-RS — FHIR R4)
const pcaAppointments = [
  {
    id: "pca-001", source: "pca", sourceDetail: "secondary-care", status: "booked",
    type: "Orthopaedic Outpatient Follow-up", specialty: "Trauma and Orthopaedics",
    provider: "Northern Care Alliance NHS Foundation Trust",
    location: "Rochdale Infirmary, Outpatient Department",
    start: "2026-03-25T10:30:00+00:00", end: "2026-03-25T10:50:00+00:00",
    created: "2026-02-10T09:15:00+00:00",
    deepLink: "https://portal.northerncarealliance.nhs.uk/patient/appointments/pca-appt-001",
    canCancel: true, canReschedule: true, hasActionableItems: true, providerSystem: "DrDoctor",
  },
  {
    id: "pca-002", source: "pca", sourceDetail: "secondary-care", status: "booked",
    type: "ENT New Patient", specialty: "ENT",
    provider: "Pennine Acute Hospitals NHS Trust",
    location: "Royal Oldham Hospital, ENT Clinic 3",
    start: "2026-04-08T14:00:00+01:00", end: "2026-04-08T14:30:00+01:00",
    created: "2026-03-01T11:20:00+00:00",
    deepLink: "https://portal.pat.nhs.uk/patient/appointments/pca-appt-002",
    canCancel: true, canReschedule: false, hasActionableItems: false, providerSystem: "Cinapsis",
  },
  {
    id: "pca-003", source: "pca", sourceDetail: "e-rs", status: "proposed",
    type: "Gastroenterology Referral", specialty: "Gastroenterology",
    provider: "NHS e-Referral Service", start: null, end: null,
    created: "2026-02-20T16:45:00+00:00",
    deepLink: "https://www.nhs.uk/nhs-app/e-referrals/referral/000987654321",
    referralStatus: "Ready to Book", ersReference: "000987654321", hasActionableItems: true,
  },
  {
    id: "pca-004", source: "pca", sourceDetail: "e-rs", status: "booked",
    type: "Gynaecology Outpatient", specialty: "Gynaecology",
    provider: "Manchester University NHS Foundation Trust",
    start: "2026-04-22T09:00:00+01:00", end: "2026-04-22T09:30:00+01:00",
    created: "2026-01-15T10:30:00+00:00",
    deepLink: "https://www.nhs.uk/nhs-app/e-referrals/referral/000876543210",
    referralStatus: "Booked", ersReference: "000876543210", hasActionableItems: false,
  },
  {
    id: "pca-005", source: "pca", sourceDetail: "secondary-care", status: "cancelled",
    type: "Orthopaedic Outpatient Follow-up", specialty: "Trauma and Orthopaedics",
    provider: "Northern Care Alliance NHS Foundation Trust",
    location: "Rochdale Infirmary, Outpatient Department",
    start: "2026-03-11T10:30:00+00:00", end: "2026-03-11T10:50:00+00:00",
    created: "2026-01-20T14:00:00+00:00",
    deepLink: "https://portal.northerncarealliance.nhs.uk/patient/appointments/pca-appt-005",
    canCancel: false, canReschedule: false, hasActionableItems: false,
    cancellationReason: "Clinic cancelled by provider", providerSystem: "DrDoctor",
  },
];

// 3. Vaccinations National Booking Service (HYPOTHETICAL FHIR R4 API)
const nbsAppointments = [
  {
    id: "nbs-001", source: "nbs", status: "booked",
    type: "COVID-19 Autumn Booster 2026", specialty: "Immunisation",
    provider: "National Booking Service",
    location: "Heywood Vaccination Centre, Phoenix Centre, Heywood, OL10 1LR",
    start: "2026-03-20T10:15:00+00:00", end: "2026-03-20T10:25:00+00:00",
    created: "2026-03-08T19:32:00+00:00",
    deepLink: "https://www.nhs.uk/book-a-vaccination/manage-booking?ref=nbs-appt-001",
    canCancel: true, canReschedule: true,
    vaccine: { programme: "COVID-19 Autumn 2026", doseNumber: 6, eligibility: "Adults at risk (clinical risk group)", bookedVia: "NHS App" },
    accessibility: { wheelchair: true, parking: true, publicTransport: true },
  },
  {
    id: "nbs-002", source: "nbs", status: "booked",
    type: "Flu Vaccination 2025/26", specialty: "Immunisation",
    provider: "National Booking Service",
    location: "Boots Pharmacy, Yorkshire Street, Rochdale, OL16 1JZ",
    start: "2026-03-28T14:40:00+00:00", end: "2026-03-28T14:50:00+00:00",
    created: "2026-03-09T08:10:00+00:00",
    deepLink: "https://www.nhs.uk/book-a-vaccination/manage-booking?ref=nbs-appt-002",
    canCancel: true, canReschedule: true,
    vaccine: { programme: "Seasonal Influenza 2025/26", doseNumber: 1, eligibility: "Adults at risk (clinical risk group)", bookedVia: "NHS Website" },
    accessibility: { wheelchair: true, parking: false, publicTransport: true },
  },
  {
    id: "nbs-003", source: "nbs", status: "cancelled",
    type: "RSV Vaccination", specialty: "Immunisation",
    provider: "National Booking Service",
    location: "Middleton Health Centre, Middleton, M24 6DL",
    start: "2026-03-12T09:00:00+00:00", end: "2026-03-12T09:10:00+00:00",
    created: "2026-02-28T12:05:00+00:00",
    canCancel: false, canReschedule: false,
    cancellationReason: "Rebooked at a different location",
    vaccine: { programme: "RSV 2025/26", doseNumber: 1, eligibility: "Aged 75 to 79", bookedVia: "119 telephone service" },
  },
];

// 4. BaRS — Urgent Dental (FHIR R4, booked via NHS 111)
const barsDentalAppointments = [
  {
    id: "bars-dental-001", source: "bars-dental", status: "booked",
    type: "Emergency Dental — Toothache", specialty: "Dental Medicine",
    provider: "Derbyshire Community Health Services NHS FT",
    location: "Derby Emergency Dental Service, London Road Community Hospital, Derby, DE1 2QY",
    start: "2026-03-10T09:20:00+00:00", end: "2026-03-10T09:40:00+00:00",
    created: "2026-03-09T14:32:00+00:00",
    canCancel: false, canReschedule: false,
    dental: {
      bookedBy: "Derbyshire Health United (NHS 111)",
      bookedVia: "NHS 111 Telephony",
      triageSummary: "Severe toothache, lower left, 3 days, not controlled by OTC analgesia",
      disposition: "Contact primary care dental service within 24 hours",
      clinicalTimeframe: "2026-03-10T14:32:00+00:00",
      dosServiceId: "124889750",
    },
  },
  {
    id: "bars-dental-002", source: "bars-dental", status: "fulfilled",
    type: "Emergency Dental — Facial Swelling", specialty: "Dental Medicine",
    provider: "Derbyshire Community Health Services NHS FT",
    location: "Chesterfield Emergency Dental Clinic, Chesterfield Royal Hospital, S44 5BL",
    start: "2026-02-15T11:00:00+00:00", end: "2026-02-15T11:30:00+00:00",
    created: "2026-02-14T22:15:00+00:00",
    canCancel: false, canReschedule: false,
    dental: {
      bookedBy: "Derbyshire Health United (NHS 111)",
      bookedVia: "NHS 111 Online",
      triageSummary: "Facial swelling, right side, associated with upper right tooth",
      disposition: "Attend emergency dental service within 12 hours",
      clinicalTimeframe: "2026-02-15T10:15:00+00:00",
      dosServiceId: "124889751",
    },
  },
];

// ═══════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : null;
const fmtTime = (d) => d ? new Date(d).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : null;
const fmtDur = (s, e) => (s && e) ? Math.round((new Date(e) - new Date(s)) / 60000) + " min" : null;

const timeUntil = (iso) => {
  if (!iso) return null;
  const diff = new Date(iso) - new Date("2026-03-09T15:00:00+00:00");
  if (diff <= 0) return "Overdue";
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 1) return "< 1 hour";
  if (hrs < 24) return `${hrs} hours`;
  return `${Math.floor(hrs / 24)} days`;
};

// ═══════════════════════════════════════════════════════════════════════
// SOURCE COLOURS & LABELS
// ═══════════════════════════════════════════════════════════════════════
const sourceConfig = {
  "gp-connect":    { label: "GP",          color: "#005eb8" },
  "nbs":           { label: "Vaccination", color: "#AE2573" },
  "bars-dental":   { label: "Urgent Dental", color: "#ED8B00" },
  "pca:secondary-care": { label: "Hospital", color: "#00A499" },
  "pca:e-rs":      { label: "e-RS",        color: "#7C2855" },
};
const getSourceKey = (a) => a.source === "pca" ? `pca:${a.sourceDetail}` : a.source;
const getSourceConfig = (a) => sourceConfig[getSourceKey(a)] || { label: "Unknown", color: "#6b7280" };

// ═══════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════
const statusColors = {
  booked: { bg: "#d4edda", text: "#155724", border: "#b1dfbb" },
  proposed: { bg: "#fff3cd", text: "#856404", border: "#ffc107" },
  cancelled: { bg: "#f8d7da", text: "#721c24", border: "#f5c6cb" },
  fulfilled: { bg: "#d1ecf1", text: "#0c5460", border: "#bee5eb" },
  "Ready to Book": { bg: "#fff3cd", text: "#856404", border: "#ffc107" },
  Booked: { bg: "#d4edda", text: "#155724", border: "#b1dfbb" },
};

const StatusBadge = ({ status, referralStatus }) => {
  const label = referralStatus || status;
  const c = statusColors[label] || statusColors.booked;
  return <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, backgroundColor: c.bg, color: c.text, border: `1px solid ${c.border}`, textTransform: "capitalize", letterSpacing: "0.02em" }}>{label}</span>;
};

const SourceTag = ({ appt }) => {
  const { label, color } = getSourceConfig(appt);
  return <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700, backgroundColor: color, color: "#fff", letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</span>;
};

const ActionBadge = () => <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600, backgroundColor: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d" }}><span style={{ fontSize: 13 }}>!</span> Action needed</span>;

const DoseBadge = ({ n }) => <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600, backgroundColor: "#ede9fe", color: "#5b21b6", border: "1px solid #c4b5fd" }}>Dose {n}</span>;

const VaccineInfo = ({ vaccine, accessibility }) => (
  <div style={{ backgroundColor: "#fdf2f8", borderRadius: 8, padding: "10px 14px", marginBottom: 12, border: "1px solid #f9a8d4" }}>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, fontSize: 13, color: "#831843" }}>
      <span><strong>Programme:</strong> {vaccine.programme}</span>
      <span><strong>Eligible as:</strong> {vaccine.eligibility}</span>
      <span><strong>Booked via:</strong> {vaccine.bookedVia}</span>
    </div>
    {accessibility && (
      <div style={{ display: "flex", gap: 10, marginTop: 8, fontSize: 12, color: "#9d174d" }}>
        {accessibility.wheelchair && <span>{"\u267F"} Wheelchair accessible</span>}
        {accessibility.parking && <span>{"\uD83C\uDD7F\uFE0F"} Parking</span>}
        {accessibility.publicTransport && <span>{"\uD83D\uDE8C"} Public transport</span>}
      </div>
    )}
  </div>
);

const DentalInfo = ({ dental }) => {
  const remaining = timeUntil(dental.clinicalTimeframe);
  return (
    <div style={{ backgroundColor: "#fef3e2", borderRadius: 8, padding: "10px 14px", marginBottom: 12, border: "1px solid #f59e0b" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, fontSize: 13, color: "#78350f" }}>
        <span><strong>Booked by:</strong> {dental.bookedBy}</span>
        <span><strong>Via:</strong> {dental.bookedVia}</span>
      </div>
      <p style={{ margin: "6px 0 0", fontSize: 13, color: "#92400e" }}>
        <strong>Triage:</strong> {dental.triageSummary}
      </p>
      <div style={{ display: "flex", gap: 16, marginTop: 6, fontSize: 12, color: "#a16207", flexWrap: "wrap" }}>
        <span><strong>Disposition:</strong> {dental.disposition}</span>
        {remaining && <span style={{ fontWeight: 600, color: remaining === "Overdue" ? "#dc2626" : "#a16207" }}>{"\u23F1"} {remaining} remaining</span>}
      </div>
    </div>
  );
};

const DeepLinkButton = ({ url, label }) => (
  <button onClick={() => window.open(url, "_blank")}
    style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 6, fontSize: 13, fontWeight: 600, backgroundColor: "#005eb8", color: "#fff", border: "none", cursor: "pointer", transition: "background-color 0.15s" }}
    onMouseEnter={(e) => e.target.style.backgroundColor = "#003d78"}
    onMouseLeave={(e) => e.target.style.backgroundColor = "#005eb8"}
  >{label} <span style={{ fontSize: 14 }}>{"\u2192"}</span></button>
);

// ═══════════════════════════════════════════════════════════════════════
// APPOINTMENT CARD
// ═══════════════════════════════════════════════════════════════════════
const AppointmentCard = ({ appt }) => {
  const dead = appt.status === "cancelled";
  const isReferral = appt.sourceDetail === "e-rs" && !appt.start;
  const isVax = appt.source === "nbs";
  const isDental = appt.source === "bars-dental";
  const isPast = appt.status === "fulfilled";

  return (
    <div style={{ backgroundColor: "#fff", borderRadius: 12, border: "1px solid #d2d6db", padding: "20px 24px", opacity: dead ? 0.65 : 1, position: "relative", transition: "box-shadow .2s, transform .15s" }}
      onMouseEnter={(e) => { if (!dead) { e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,94,184,.1)"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}>
      {dead && <div style={{ position: "absolute", inset: 0, borderRadius: 12, background: "repeating-linear-gradient(135deg,transparent,transparent 10px,rgba(114,28,36,.02) 10px,rgba(114,28,36,.02) 20px)", pointerEvents: "none" }} />}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <SourceTag appt={appt} />
          <StatusBadge status={appt.status} referralStatus={appt.referralStatus} />
          {appt.hasActionableItems && <ActionBadge />}
          {isVax && appt.vaccine && <DoseBadge n={appt.vaccine.doseNumber} />}
        </div>
        {appt.deliveryChannel && <span style={{ fontSize: 12, color: "#6b7280" }}>{appt.deliveryChannel === "Telephone" ? "\uD83D\uDCDE" : "\uD83C\uDFE5"} {appt.deliveryChannel}</span>}
      </div>

      {/* Title */}
      <h3 style={{ margin: "0 0 4px", fontSize: 17, fontWeight: 700, color: "#212b32", textDecoration: dead ? "line-through" : "none" }}>{appt.type}</h3>
      <p style={{ margin: "0 0 12px", fontSize: 14, color: "#4c6272" }}>
        {appt.specialty} — {appt.provider}
        {isVax && <span style={{ fontSize: 12, marginLeft: 6, color: "#9d174d", fontStyle: "italic" }}>(hypothetical API)</span>}
      </p>

      {/* Source-specific panels */}
      {isVax && appt.vaccine && !dead && <VaccineInfo vaccine={appt.vaccine} accessibility={appt.accessibility} />}
      {isDental && appt.dental && <DentalInfo dental={appt.dental} />}

      {/* Referral CTA */}
      {isReferral ? (
        <div style={{ backgroundColor: "#fef9e7", borderRadius: 8, padding: "12px 16px", marginBottom: 12, border: "1px solid #fcd34d" }}>
          <p style={{ margin: 0, fontSize: 14, color: "#92400e", fontWeight: 500 }}>This referral is waiting to be booked. Select "Book now" to choose your appointment.</p>
          {appt.ersReference && <p style={{ margin: "6px 0 0", fontSize: 12, color: "#a16207" }}>e-RS ref: {appt.ersReference}</p>}
        </div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 12 }}>
          {appt.start && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 16 }}>{"\uD83D\uDCC5"}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#212b32" }}>{fmtDate(appt.start)}</div>
                <div style={{ fontSize: 13, color: "#6b7280" }}>{fmtTime(appt.start)}–{fmtTime(appt.end)}{fmtDur(appt.start, appt.end) && <span> ({fmtDur(appt.start, appt.end)})</span>}</div>
              </div>
            </div>
          )}
          {appt.location && <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 16 }}>{"\uD83D\uDCCD"}</span><span style={{ fontSize: 13, color: "#4c6272" }}>{appt.location}</span></div>}
        </div>
      )}

      {appt.practitioner && <p style={{ margin: "0 0 12px", fontSize: 13, color: "#4c6272" }}><strong>With:</strong> {appt.practitioner}</p>}
      {dead && appt.cancellationReason && <p style={{ margin: "0 0 12px", fontSize: 13, color: "#721c24", fontStyle: "italic" }}>Cancelled: {appt.cancellationReason}</p>}
      {appt.ersReference && appt.start && <p style={{ margin: "0 0 12px", fontSize: 12, color: "#6b7280" }}>e-RS ref: {appt.ersReference}</p>}

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {appt.deepLink && !dead && !isPast && <DeepLinkButton url={appt.deepLink} label={isReferral ? "Book now" : isVax ? "Manage vaccination" : "View details"} />}
        {appt.canReschedule && !dead && !isPast && <button style={{ padding: "6px 14px", borderRadius: 6, fontSize: 13, fontWeight: 600, backgroundColor: "transparent", color: "#005eb8", border: "1px solid #005eb8", cursor: "pointer" }}>Reschedule</button>}
        {appt.canCancel && !dead && !isPast && <button style={{ padding: "6px 14px", borderRadius: 6, fontSize: 13, fontWeight: 600, backgroundColor: "transparent", color: "#d5281b", border: "1px solid #d5281b", cursor: "pointer" }}>Cancel</button>}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════
export default function UnifiedAppointments() {
  const [filter, setFilter] = useState("upcoming");
  const [sourceFilter, setSourceFilter] = useState("all");

  const all = useMemo(() =>
    [...gpConnectAppointments, ...pcaAppointments, ...nbsAppointments, ...barsDentalAppointments].sort((a, b) => {
      if (!a.start && !b.start) return 0;
      if (!a.start) return -1;
      if (!b.start) return 1;
      return new Date(a.start) - new Date(b.start);
    }), []);

  const actionCount = all.filter((a) => a.hasActionableItems && a.status !== "cancelled").length;

  const filtered = useMemo(() => {
    const now = new Date("2026-03-09T12:00:00+00:00");
    return all.filter((a) => {
      if (filter === "upcoming" && (a.status === "cancelled" || a.status === "fulfilled")) return false;
      if (filter === "upcoming" && a.start && new Date(a.start) < now) return false;
      if (filter === "cancelled" && a.status !== "cancelled") return false;
      if (filter === "action" && !a.hasActionableItems) return false;
      if (filter === "past" && a.status !== "fulfilled") return false;

      if (sourceFilter === "gp" && a.source !== "gp-connect") return false;
      if (sourceFilter === "hospital" && !(a.source === "pca" && a.sourceDetail === "secondary-care")) return false;
      if (sourceFilter === "referrals" && !(a.source === "pca" && a.sourceDetail === "e-rs")) return false;
      if (sourceFilter === "vaccinations" && a.source !== "nbs") return false;
      if (sourceFilter === "dental" && a.source !== "bars-dental") return false;
      return true;
    });
  }, [all, filter, sourceFilter]);

  const pill = (key, label, count) => (
    <button key={key} onClick={() => setFilter(key)} style={{
      padding: "8px 16px", borderRadius: 24, fontSize: 13,
      fontWeight: filter === key ? 700 : 500,
      backgroundColor: filter === key ? "#005eb8" : "#f0f4f5",
      color: filter === key ? "#fff" : "#4c6272",
      border: "none", cursor: "pointer", transition: "all 0.15s",
      display: "flex", alignItems: "center", gap: 6,
    }}>
      {label}
      {count > 0 && <span style={{ backgroundColor: filter === key ? "rgba(255,255,255,.25)" : "#005eb8", color: "#fff", borderRadius: 10, padding: "1px 7px", fontSize: 11, fontWeight: 700 }}>{count}</span>}
    </button>
  );

  const srcBtn = (key, label) => (
    <button key={key} onClick={() => setSourceFilter(key)} style={{
      padding: "5px 12px", borderRadius: 6, fontSize: 12,
      fontWeight: sourceFilter === key ? 700 : 500,
      backgroundColor: sourceFilter === key ? "#212b32" : "transparent",
      color: sourceFilter === key ? "#fff" : "#6b7280",
      border: sourceFilter === key ? "1px solid #212b32" : "1px solid #d2d6db",
      cursor: "pointer", transition: "all 0.15s",
    }}>{label}</button>
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f0f4f5", fontFamily: "'Noto Sans', 'Frutiger', Arial, sans-serif" }}>
      <header style={{ backgroundColor: "#005eb8", padding: "16px 24px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 40, height: 40, backgroundColor: "#fff", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: "#005eb8" }}>NHS</div>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#fff" }}>My Appointments</h1>
          <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,.75)" }}>GP, hospital, vaccination and dental appointments in one place</p>
        </div>
      </header>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px" }}>
        {/* Prototype notices */}
        <div style={{ backgroundColor: "#fdf2f8", border: "1px solid #f9a8d4", borderRadius: 8, padding: "10px 16px", marginBottom: 10, fontSize: 12, color: "#831843", display: "flex", alignItems: "flex-start", gap: 8 }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>{"\u26A0\uFE0F"}</span>
          <span><strong>Vaccination (NBS):</strong> Uses a hypothetical API. NBS currently integrates via web view, not FHIR.</span>
        </div>
        <div style={{ backgroundColor: "#fef3e2", border: "1px solid #f59e0b", borderRadius: 8, padding: "10px 16px", marginBottom: 20, fontSize: 12, color: "#78350f", display: "flex", alignItems: "flex-start", gap: 8 }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>{"\uD83E\uDDB7"}</span>
          <span><strong>Urgent Dental (BaRS):</strong> Real standard — NHS 111 books emergency dental via BaRS today. Routine dental bookings are not available via any national API.</span>
        </div>

        {actionCount > 0 && (
          <div onClick={() => setFilter("action")} style={{ backgroundColor: "#fff", border: "2px solid #fcd34d", borderRadius: 12, padding: "16px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 2px 12px rgba(252,211,77,.3)"}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>!</div>
            <div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#92400e" }}>{actionCount} {actionCount === 1 ? "item needs" : "items need"} your attention</p>
              <p style={{ margin: "2px 0 0", fontSize: 13, color: "#a16207" }}>You have appointments or referrals that require action</p>
            </div>
            <span style={{ marginLeft: "auto", fontSize: 18, color: "#a16207" }}>{"\u2192"}</span>
          </div>
        )}

        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          {pill("upcoming", "Upcoming", 0)}
          {pill("action", "Action needed", actionCount)}
          {pill("past", "Past", 0)}
          {pill("cancelled", "Cancelled", 0)}
          {pill("all", "All", 0)}
        </div>

        <div style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
          {srcBtn("all", "All sources")}
          {srcBtn("gp", "GP")}
          {srcBtn("hospital", "Hospital")}
          {srcBtn("referrals", "Referrals")}
          {srcBtn("vaccinations", "Vaccinations")}
          {srcBtn("dental", "Urgent Dental")}
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 20, padding: "10px 16px", backgroundColor: "#e8edee", borderRadius: 8, fontSize: 11, color: "#4c6272", flexWrap: "wrap" }}>
          <span><strong style={{ color: "#005eb8" }}>GP</strong> GP Connect (STU3)</span>
          <span><strong style={{ color: "#00A499" }}>Hospital</strong> PCA (R4)</span>
          <span><strong style={{ color: "#7C2855" }}>e-RS</strong> PCA (R4)</span>
          <span><strong style={{ color: "#AE2573" }}>Vaccination</strong> NBS (R4, hypothetical)</span>
          <span><strong style={{ color: "#ED8B00" }}>Urgent Dental</strong> BaRS (R4)</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.length === 0
            ? <div style={{ textAlign: "center", padding: "48px 24px", backgroundColor: "#fff", borderRadius: 12, border: "1px solid #d2d6db" }}><p style={{ fontSize: 16, color: "#4c6272", margin: 0 }}>No appointments found for this filter.</p></div>
            : filtered.map((a) => <AppointmentCard key={a.id} appt={a} />)}
        </div>

        <div style={{ marginTop: 32, padding: 16, fontSize: 12, color: "#6b7280", lineHeight: 1.5, borderTop: "1px solid #d2d6db" }}>
          <p style={{ margin: "0 0 4px" }}>
            <strong>Data sources:</strong> GP appointments via GP Connect (FHIR STU3). Hospital appointments and referrals via the Patient Care Aggregator (FHIR R4).
            Vaccination appointments via the National Booking Service (hypothetical FHIR R4 API). Urgent dental appointments via BaRS (FHIR R4, booked by NHS 111).
          </p>
          <p style={{ margin: 0 }}>This prototype combines data from four NHS APIs to illustrate a unified patient appointments view. Routine NHS dental bookings are managed in practice-level systems (EXACT, R4, SfD, Dentally) with no national API.</p>
        </div>
      </main>
    </div>
  );
}
