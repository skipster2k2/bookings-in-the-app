import { useState, useMemo } from "react";

// ═══════════════════════════════════════════════════════════════════════
// MOCK DATA — Three sources
// ═══════════════════════════════════════════════════════════════════════

// 1. GP Connect (primary care — FHIR STU3)
const gpConnectAppointments = [
  {
    id: "gpc-1001", source: "gp-connect", status: "booked",
    type: "GP Consultation", specialty: "General Practice",
    description: "GP Appointment", provider: "Whitworth Medical Centre",
    practitioner: "Dr Sarah Mitchell",
    location: "Whitworth Medical Centre, Market Street, Whitworth, OL12 8QN",
    start: "2026-03-15T09:30:00+00:00", end: "2026-03-15T09:45:00+00:00",
    deliveryChannel: "In-person", created: "2026-03-09T14:22:00+00:00",
  },
  {
    id: "gpc-1002", source: "gp-connect", status: "booked",
    type: "Blood Test", specialty: "General Practice",
    description: "Nurse Appointment - Bloods", provider: "Whitworth Medical Centre",
    practitioner: "Nurse James Thornton",
    location: "Whitworth Medical Centre, Market Street, Whitworth, OL12 8QN",
    start: "2026-03-22T11:00:00+00:00", end: "2026-03-22T11:20:00+00:00",
    deliveryChannel: "In-person", created: "2026-03-07T10:15:00+00:00",
  },
  {
    id: "gpc-1003", source: "gp-connect", status: "cancelled",
    type: "Telephone Consultation", specialty: "General Practice",
    description: "GP Telephone Appointment", provider: "Whitworth Medical Centre",
    practitioner: "Dr Sarah Mitchell",
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
    description: "Orthopaedic Outpatient Follow-up",
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
    description: "Ear, Nose and Throat New Patient",
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
    description: "e-RS Referral - Gastroenterology - Ready to Book",
    provider: "NHS e-Referral Service", start: null, end: null,
    created: "2026-02-20T16:45:00+00:00",
    deepLink: "https://www.nhs.uk/nhs-app/e-referrals/referral/000987654321",
    referralStatus: "Ready to Book", ersReference: "000987654321", hasActionableItems: true,
  },
  {
    id: "pca-004", source: "pca", sourceDetail: "e-rs", status: "booked",
    type: "Gynaecology Outpatient", specialty: "Gynaecology",
    description: "e-RS Referral - Gynaecology - Booked",
    provider: "Manchester University NHS Foundation Trust",
    start: "2026-04-22T09:00:00+01:00", end: "2026-04-22T09:30:00+01:00",
    created: "2026-01-15T10:30:00+00:00",
    deepLink: "https://www.nhs.uk/nhs-app/e-referrals/referral/000876543210",
    referralStatus: "Booked", ersReference: "000876543210", hasActionableItems: false,
  },
  {
    id: "pca-005", source: "pca", sourceDetail: "secondary-care", status: "cancelled",
    type: "Orthopaedic Outpatient Follow-up", specialty: "Trauma and Orthopaedics",
    description: "Orthopaedic Outpatient Follow-up - Cancelled",
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
    description: "COVID-19 Autumn Booster 2026",
    provider: "National Booking Service",
    location: "Heywood Vaccination Centre, Phoenix Centre, Heywood, OL10 1LR",
    start: "2026-03-20T10:15:00+00:00", end: "2026-03-20T10:25:00+00:00",
    created: "2026-03-08T19:32:00+00:00",
    deepLink: "https://www.nhs.uk/book-a-vaccination/manage-booking?ref=nbs-appt-001",
    canCancel: true, canReschedule: true,
    vaccine: {
      programme: "COVID-19 Autumn 2026",
      doseNumber: 6,
      eligibility: "Adults at risk (clinical risk group)",
      bookedVia: "NHS App",
    },
    accessibility: { wheelchair: true, parking: true, publicTransport: true },
  },
  {
    id: "nbs-002", source: "nbs", status: "booked",
    type: "Flu Vaccination 2025/26", specialty: "Immunisation",
    description: "Flu Vaccination 2025/26 Season",
    provider: "National Booking Service",
    location: "Boots Pharmacy, Yorkshire Street, Rochdale, OL16 1JZ",
    start: "2026-03-28T14:40:00+00:00", end: "2026-03-28T14:50:00+00:00",
    created: "2026-03-09T08:10:00+00:00",
    deepLink: "https://www.nhs.uk/book-a-vaccination/manage-booking?ref=nbs-appt-002",
    canCancel: true, canReschedule: true,
    vaccine: {
      programme: "Seasonal Influenza 2025/26",
      doseNumber: 1,
      eligibility: "Adults at risk (clinical risk group)",
      bookedVia: "NHS Website",
    },
    accessibility: { wheelchair: true, parking: false, publicTransport: true },
  },
  {
    id: "nbs-003", source: "nbs", status: "cancelled",
    type: "RSV Vaccination", specialty: "Immunisation",
    description: "RSV Vaccination - Cancelled",
    provider: "National Booking Service",
    location: "Middleton Health Centre, Middleton, M24 6DL",
    start: "2026-03-12T09:00:00+00:00", end: "2026-03-12T09:10:00+00:00",
    created: "2026-02-28T12:05:00+00:00",
    deepLink: "https://www.nhs.uk/book-a-vaccination/manage-booking?ref=nbs-appt-003",
    canCancel: false, canReschedule: false,
    cancellationReason: "Rebooked at a different location",
    vaccine: {
      programme: "RSV 2025/26",
      doseNumber: 1,
      eligibility: "Aged 75 to 79",
      bookedVia: "119 telephone service",
    },
  },
];

// ═══════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : null;
const fmtTime = (d) => d ? new Date(d).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : null;
const fmtDur = (s, e) => (s && e) ? Math.round((new Date(e) - new Date(s)) / 60000) + " min" : null;

// ═══════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════

const statusColors = {
  booked:          { bg: "#d4edda", text: "#155724", border: "#b1dfbb" },
  proposed:        { bg: "#fff3cd", text: "#856404", border: "#ffc107" },
  cancelled:       { bg: "#f8d7da", text: "#721c24", border: "#f5c6cb" },
  "Ready to Book": { bg: "#fff3cd", text: "#856404", border: "#ffc107" },
  Booked:          { bg: "#d4edda", text: "#155724", border: "#b1dfbb" },
};

const StatusBadge = ({ status, referralStatus }) => {
  const label = referralStatus || status;
  const c = statusColors[label] || statusColors.booked;
  return (
    <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, backgroundColor: c.bg, color: c.text, border: `1px solid ${c.border}`, textTransform: "capitalize", letterSpacing: "0.02em" }}>
      {label}
    </span>
  );
};

const SourceTag = ({ source, sourceDetail }) => {
  const isGP = source === "gp-connect";
  const isERS = sourceDetail === "e-rs";
  const isNBS = source === "nbs";
  const label = isGP ? "GP" : isNBS ? "Vaccination" : isERS ? "e-RS" : "Hospital";
  const color = isGP ? "#005eb8" : isNBS ? "#AE2573" : isERS ? "#7C2855" : "#00A499";
  return (
    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700, backgroundColor: color, color: "#fff", letterSpacing: "0.05em", textTransform: "uppercase" }}>
      {label}
    </span>
  );
};

const ActionBadge = () => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600, backgroundColor: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d" }}>
    <span style={{ fontSize: 13 }}>!</span> Action needed
  </span>
);

const DoseBadge = ({ doseNumber }) => (
  <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600, backgroundColor: "#ede9fe", color: "#5b21b6", border: "1px solid #c4b5fd" }}>
    Dose {doseNumber}
  </span>
);

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

const DeepLinkButton = ({ url, label }) => (
  <button
    onClick={() => window.open(url, "_blank")}
    style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 6, fontSize: 13, fontWeight: 600, backgroundColor: "#005eb8", color: "#fff", border: "none", cursor: "pointer", transition: "background-color 0.15s" }}
    onMouseEnter={(e) => e.target.style.backgroundColor = "#003d78"}
    onMouseLeave={(e) => e.target.style.backgroundColor = "#005eb8"}
  >
    {label} <span style={{ fontSize: 14 }}>{"\u2192"}</span>
  </button>
);

// ═══════════════════════════════════════════════════════════════════════
// APPOINTMENT CARD
// ═══════════════════════════════════════════════════════════════════════

const AppointmentCard = ({ appt }) => {
  const isCancelled = appt.status === "cancelled";
  const isReferral = appt.sourceDetail === "e-rs" && !appt.start;
  const isVaccination = appt.source === "nbs";

  return (
    <div style={{
      backgroundColor: "#fff", borderRadius: 12, border: "1px solid #d2d6db",
      padding: "20px 24px", opacity: isCancelled ? 0.65 : 1, position: "relative",
      transition: "box-shadow .2s, transform .15s",
    }}
      onMouseEnter={(e) => { if (!isCancelled) { e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,94,184,.1)"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}
    >
      {isCancelled && (
        <div style={{ position: "absolute", inset: 0, borderRadius: 12, background: "repeating-linear-gradient(135deg,transparent,transparent 10px,rgba(114,28,36,.02) 10px,rgba(114,28,36,.02) 20px)", pointerEvents: "none" }} />
      )}

      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <SourceTag source={appt.source} sourceDetail={appt.sourceDetail} />
          <StatusBadge status={appt.status} referralStatus={appt.referralStatus} />
          {appt.hasActionableItems && <ActionBadge />}
          {isVaccination && appt.vaccine && <DoseBadge doseNumber={appt.vaccine.doseNumber} />}
        </div>
        {appt.deliveryChannel && (
          <span style={{ fontSize: 12, color: "#6b7280" }}>
            {appt.deliveryChannel === "Telephone" ? "\uD83D\uDCDE" : "\uD83C\uDFE5"} {appt.deliveryChannel}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 style={{ margin: "0 0 4px", fontSize: 17, fontWeight: 700, color: "#212b32", textDecoration: isCancelled ? "line-through" : "none", fontFamily: "'Frutiger', 'Noto Sans', Arial, sans-serif" }}>
        {appt.type}
      </h3>
      <p style={{ margin: "0 0 12px", fontSize: 14, color: "#4c6272" }}>
        {appt.specialty} — {appt.provider}
        {isVaccination && <span style={{ fontSize: 12, marginLeft: 6, color: "#9d174d", fontStyle: "italic" }}>(hypothetical API)</span>}
      </p>

      {/* Vaccination info panel */}
      {isVaccination && appt.vaccine && !isCancelled && (
        <VaccineInfo vaccine={appt.vaccine} accessibility={appt.accessibility} />
      )}

      {/* Referral CTA */}
      {isReferral ? (
        <div style={{ backgroundColor: "#fef9e7", borderRadius: 8, padding: "12px 16px", marginBottom: 12, border: "1px solid #fcd34d" }}>
          <p style={{ margin: 0, fontSize: 14, color: "#92400e", fontWeight: 500 }}>
            This referral is waiting to be booked. Select "Book now" to choose your appointment.
          </p>
          {appt.ersReference && <p style={{ margin: "6px 0 0", fontSize: 12, color: "#a16207" }}>e-RS ref: {appt.ersReference}</p>}
        </div>
      ) : (
        /* Date / time / location */
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 12 }}>
          {appt.start && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 16 }}>{"\uD83D\uDCC5"}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#212b32" }}>{fmtDate(appt.start)}</div>
                <div style={{ fontSize: 13, color: "#6b7280" }}>
                  {fmtTime(appt.start)}–{fmtTime(appt.end)}
                  {fmtDur(appt.start, appt.end) && <span> ({fmtDur(appt.start, appt.end)})</span>}
                </div>
              </div>
            </div>
          )}
          {appt.location && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 16 }}>{"\uD83D\uDCCD"}</span>
              <span style={{ fontSize: 13, color: "#4c6272" }}>{appt.location}</span>
            </div>
          )}
        </div>
      )}

      {/* Practitioner */}
      {appt.practitioner && <p style={{ margin: "0 0 12px", fontSize: 13, color: "#4c6272" }}><strong>With:</strong> {appt.practitioner}</p>}

      {/* Cancellation reason */}
      {isCancelled && appt.cancellationReason && (
        <p style={{ margin: "0 0 12px", fontSize: 13, color: "#721c24", fontStyle: "italic" }}>
          Cancelled: {appt.cancellationReason}
        </p>
      )}

      {/* e-RS ref */}
      {appt.ersReference && appt.start && <p style={{ margin: "0 0 12px", fontSize: 12, color: "#6b7280" }}>e-RS ref: {appt.ersReference}</p>}

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {appt.deepLink && !isCancelled && (
          <DeepLinkButton
            url={appt.deepLink}
            label={isReferral ? "Book now" : isVaccination ? "Manage vaccination" : "View details"}
          />
        )}
        {appt.canReschedule && !isCancelled && (
          <button style={{ padding: "6px 14px", borderRadius: 6, fontSize: 13, fontWeight: 600, backgroundColor: "transparent", color: "#005eb8", border: "1px solid #005eb8", cursor: "pointer" }}>
            Reschedule
          </button>
        )}
        {appt.canCancel && !isCancelled && (
          <button style={{ padding: "6px 14px", borderRadius: 6, fontSize: 13, fontWeight: 600, backgroundColor: "transparent", color: "#d5281b", border: "1px solid #d5281b", cursor: "pointer" }}>
            Cancel
          </button>
        )}
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

  const allAppointments = useMemo(() => {
    return [...gpConnectAppointments, ...pcaAppointments, ...nbsAppointments].sort((a, b) => {
      if (!a.start && !b.start) return 0;
      if (!a.start) return -1;
      if (!b.start) return 1;
      return new Date(a.start) - new Date(b.start);
    });
  }, []);

  const filtered = useMemo(() => {
    const now = new Date("2026-03-09T12:00:00+00:00");
    return allAppointments.filter((a) => {
      if (filter === "upcoming" && a.status === "cancelled") return false;
      if (filter === "upcoming" && a.start && new Date(a.start) < now) return false;
      if (filter === "cancelled" && a.status !== "cancelled") return false;
      if (filter === "action" && !a.hasActionableItems) return false;

      if (sourceFilter === "gp" && a.source !== "gp-connect") return false;
      if (sourceFilter === "hospital" && !(a.source === "pca" && a.sourceDetail === "secondary-care")) return false;
      if (sourceFilter === "referrals" && !(a.source === "pca" && a.sourceDetail === "e-rs")) return false;
      if (sourceFilter === "vaccinations" && a.source !== "nbs") return false;

      return true;
    });
  }, [allAppointments, filter, sourceFilter]);

  const actionCount = allAppointments.filter((a) => a.hasActionableItems && a.status !== "cancelled").length;

  const filterBtn = (key, label, count) => (
    <button key={key} onClick={() => setFilter(key)} style={{
      padding: "8px 16px", borderRadius: 24, fontSize: 13,
      fontWeight: filter === key ? 700 : 500,
      backgroundColor: filter === key ? "#005eb8" : "#f0f4f5",
      color: filter === key ? "#fff" : "#4c6272",
      border: "none", cursor: "pointer", transition: "all 0.15s",
      display: "flex", alignItems: "center", gap: 6,
    }}>
      {label}
      {count > 0 && (
        <span style={{ backgroundColor: filter === key ? "rgba(255,255,255,0.25)" : "#005eb8", color: "#fff", borderRadius: 10, padding: "1px 7px", fontSize: 11, fontWeight: 700 }}>
          {count}
        </span>
      )}
    </button>
  );

  const sourceBtn = (key, label) => (
    <button key={key} onClick={() => setSourceFilter(key)} style={{
      padding: "5px 12px", borderRadius: 6, fontSize: 12,
      fontWeight: sourceFilter === key ? 700 : 500,
      backgroundColor: sourceFilter === key ? "#212b32" : "transparent",
      color: sourceFilter === key ? "#fff" : "#6b7280",
      border: sourceFilter === key ? "1px solid #212b32" : "1px solid #d2d6db",
      cursor: "pointer", transition: "all 0.15s",
    }}>
      {label}
    </button>
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f0f4f5", fontFamily: "'Noto Sans', 'Frutiger', Arial, sans-serif" }}>

      {/* NHS header */}
      <header style={{ backgroundColor: "#005eb8", padding: "16px 24px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 40, height: 40, backgroundColor: "#fff", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: "#005eb8" }}>NHS</div>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#fff" }}>My Appointments</h1>
          <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.75)" }}>GP, hospital and vaccination appointments in one place</p>
        </div>
      </header>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px" }}>

        {/* Hypothetical API notice */}
        <div style={{ backgroundColor: "#fdf2f8", border: "1px solid #f9a8d4", borderRadius: 8, padding: "10px 16px", marginBottom: 20, fontSize: 12, color: "#831843", display: "flex", alignItems: "flex-start", gap: 8 }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>{"\u26A0\uFE0F"}</span>
          <span>
            <strong>Prototype note:</strong> Vaccination appointments (NBS) use a hypothetical API that does not exist today.
            The NBS currently integrates with the NHS App via a web view, not a FHIR API. Shown here to illustrate the vision of a fully unified appointments view.
          </span>
        </div>

        {/* Action banner */}
        {actionCount > 0 && (
          <div onClick={() => setFilter("action")} style={{
            backgroundColor: "#fff", border: "2px solid #fcd34d", borderRadius: 12,
            padding: "16px 20px", marginBottom: 20, display: "flex", alignItems: "center",
            gap: 12, cursor: "pointer", transition: "box-shadow 0.15s",
          }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 2px 12px rgba(252,211,77,0.3)"}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
          >
            <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>!</div>
            <div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#92400e" }}>{actionCount} {actionCount === 1 ? "item needs" : "items need"} your attention</p>
              <p style={{ margin: "2px 0 0", fontSize: 13, color: "#a16207" }}>You have appointments or referrals that require action</p>
            </div>
            <span style={{ marginLeft: "auto", fontSize: 18, color: "#a16207" }}>{"\u2192"}</span>
          </div>
        )}

        {/* Status filters */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          {filterBtn("upcoming", "Upcoming", 0)}
          {filterBtn("action", "Action needed", actionCount)}
          {filterBtn("cancelled", "Cancelled", 0)}
          {filterBtn("all", "All", 0)}
        </div>

        {/* Source filters */}
        <div style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
          {sourceBtn("all", "All sources")}
          {sourceBtn("gp", "GP")}
          {sourceBtn("hospital", "Hospital")}
          {sourceBtn("referrals", "Referrals")}
          {sourceBtn("vaccinations", "Vaccinations")}
        </div>

        {/* Data source legend */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20, padding: "10px 16px", backgroundColor: "#e8edee", borderRadius: 8, fontSize: 11, color: "#4c6272", flexWrap: "wrap" }}>
          <span><strong style={{ color: "#005eb8" }}>GP</strong> GP Connect (STU3)</span>
          <span><strong style={{ color: "#00A499" }}>Hospital</strong> PCA (R4)</span>
          <span><strong style={{ color: "#7C2855" }}>e-RS</strong> PCA (R4)</span>
          <span><strong style={{ color: "#AE2573" }}>Vaccination</strong> NBS (R4, hypothetical)</span>
        </div>

        {/* Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 24px", backgroundColor: "#fff", borderRadius: 12, border: "1px solid #d2d6db" }}>
              <p style={{ fontSize: 16, color: "#4c6272", margin: 0 }}>No appointments found for this filter.</p>
            </div>
          ) : (
            filtered.map((appt) => <AppointmentCard key={appt.id} appt={appt} />)
          )}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 32, padding: 16, fontSize: 12, color: "#6b7280", lineHeight: 1.5, borderTop: "1px solid #d2d6db" }}>
          <p style={{ margin: "0 0 4px" }}>
            <strong>Data sources:</strong> GP appointments via GP Connect (FHIR STU3).
            Hospital appointments and referrals via the Patient Care Aggregator (FHIR R4).
            Vaccination appointments via the National Booking Service (hypothetical FHIR R4 API — does not exist today).
          </p>
          <p style={{ margin: 0 }}>
            This prototype combines data from three NHS services to illustrate a unified patient appointments view.
            For full details, select the action button on each card.
          </p>
        </div>
      </main>
    </div>
  );
}
