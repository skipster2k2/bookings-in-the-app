import { useState, useMemo } from "react";

// Mock GP Connect response (primary care)
const gpConnectAppointments = [
  {
    id: "gpc-1001",
    source: "gp-connect",
    status: "booked",
    type: "GP Consultation",
    specialty: "General Practice",
    description: "GP Appointment",
    provider: "Whitworth Medical Centre",
    practitioner: "Dr Sarah Mitchell",
    location: "Whitworth Medical Centre, Market Street, Whitworth, OL12 8QN",
    start: "2026-03-15T09:30:00+00:00",
    end: "2026-03-15T09:45:00+00:00",
    deliveryChannel: "In-person",
    created: "2026-03-09T14:22:00+00:00",
  },
  {
    id: "gpc-1002",
    source: "gp-connect",
    status: "booked",
    type: "Blood Test",
    specialty: "General Practice",
    description: "Nurse Appointment - Bloods",
    provider: "Whitworth Medical Centre",
    practitioner: "Nurse James Thornton",
    location: "Whitworth Medical Centre, Market Street, Whitworth, OL12 8QN",
    start: "2026-03-22T11:00:00+00:00",
    end: "2026-03-22T11:20:00+00:00",
    deliveryChannel: "In-person",
    created: "2026-03-07T10:15:00+00:00",
  },
  {
    id: "gpc-1003",
    source: "gp-connect",
    status: "cancelled",
    type: "Telephone Consultation",
    specialty: "General Practice",
    description: "GP Telephone Appointment",
    provider: "Whitworth Medical Centre",
    practitioner: "Dr Sarah Mitchell",
    location: "Whitworth Medical Centre, Market Street, Whitworth, OL12 8QN",
    start: "2026-03-18T14:00:00+00:00",
    end: "2026-03-18T14:10:00+00:00",
    deliveryChannel: "Telephone",
    created: "2026-03-05T09:40:00+00:00",
    cancellationReason: "Patient cancelled",
  },
];

// Mock PCA response (secondary care + e-RS)
const pcaAppointments = [
  {
    id: "pca-001",
    source: "pca",
    sourceDetail: "secondary-care",
    status: "booked",
    type: "Orthopaedic Outpatient Follow-up",
    specialty: "Trauma and Orthopaedics",
    description: "Orthopaedic Outpatient Follow-up",
    provider: "Northern Care Alliance NHS Foundation Trust",
    location: "Rochdale Infirmary, Outpatient Department",
    start: "2026-03-25T10:30:00+00:00",
    end: "2026-03-25T10:50:00+00:00",
    created: "2026-02-10T09:15:00+00:00",
    deepLink: "https://portal.northerncarealliance.nhs.uk/patient/appointments/pca-appt-001",
    canCancel: true,
    canReschedule: true,
    hasActionableItems: true,
    providerSystem: "DrDoctor",
  },
  {
    id: "pca-002",
    source: "pca",
    sourceDetail: "secondary-care",
    status: "booked",
    type: "ENT New Patient",
    specialty: "ENT",
    description: "Ear, Nose and Throat New Patient",
    provider: "Pennine Acute Hospitals NHS Trust",
    location: "Royal Oldham Hospital, ENT Clinic 3",
    start: "2026-04-08T14:00:00+01:00",
    end: "2026-04-08T14:30:00+01:00",
    created: "2026-03-01T11:20:00+00:00",
    deepLink: "https://portal.pat.nhs.uk/patient/appointments/pca-appt-002",
    canCancel: true,
    canReschedule: false,
    hasActionableItems: false,
    providerSystem: "Cinapsis",
  },
  {
    id: "pca-003",
    source: "pca",
    sourceDetail: "e-rs",
    status: "proposed",
    type: "Gastroenterology Referral",
    specialty: "Gastroenterology",
    description: "e-RS Referral - Gastroenterology - Ready to Book",
    provider: "NHS e-Referral Service",
    start: null,
    end: null,
    created: "2026-02-20T16:45:00+00:00",
    deepLink: "https://www.nhs.uk/nhs-app/e-referrals/referral/000987654321",
    referralStatus: "Ready to Book",
    ersReference: "000987654321",
    hasActionableItems: true,
  },
  {
    id: "pca-004",
    source: "pca",
    sourceDetail: "e-rs",
    status: "booked",
    type: "Gynaecology Outpatient",
    specialty: "Gynaecology",
    description: "e-RS Referral - Gynaecology - Booked",
    provider: "Manchester University NHS Foundation Trust",
    start: "2026-04-22T09:00:00+01:00",
    end: "2026-04-22T09:30:00+01:00",
    created: "2026-01-15T10:30:00+00:00",
    deepLink: "https://www.nhs.uk/nhs-app/e-referrals/referral/000876543210",
    referralStatus: "Booked",
    ersReference: "000876543210",
    hasActionableItems: false,
  },
  {
    id: "pca-005",
    source: "pca",
    sourceDetail: "secondary-care",
    status: "cancelled",
    type: "Orthopaedic Outpatient Follow-up",
    specialty: "Trauma and Orthopaedics",
    description: "Orthopaedic Outpatient Follow-up - Cancelled",
    provider: "Northern Care Alliance NHS Foundation Trust",
    location: "Rochdale Infirmary, Outpatient Department",
    start: "2026-03-11T10:30:00+00:00",
    end: "2026-03-11T10:50:00+00:00",
    created: "2026-01-20T14:00:00+00:00",
    deepLink: "https://portal.northerncarealliance.nhs.uk/patient/appointments/pca-appt-005",
    canCancel: false,
    canReschedule: false,
    hasActionableItems: false,
    cancellationReason: "Clinic cancelled by provider",
    providerSystem: "DrDoctor",
  },
];

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
};

const formatTime = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
};

const getTimeDiff = (start, end) => {
  if (!start || !end) return null;
  const mins = Math.round((new Date(end) - new Date(start)) / 60000);
  return `${mins} min`;
};

const StatusBadge = ({ status, referralStatus }) => {
  const label = referralStatus || status;
  const colors = {
    booked: { bg: "#d4edda", text: "#155724", border: "#b1dfbb" },
    proposed: { bg: "#fff3cd", text: "#856404", border: "#ffc107" },
    cancelled: { bg: "#f8d7da", text: "#721c24", border: "#f5c6cb" },
    "Ready to Book": { bg: "#fff3cd", text: "#856404", border: "#ffc107" },
    Booked: { bg: "#d4edda", text: "#155724", border: "#b1dfbb" },
  };
  const c = colors[label] || colors.booked;
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 10px",
      borderRadius: "12px",
      fontSize: "12px",
      fontWeight: 600,
      backgroundColor: c.bg,
      color: c.text,
      border: `1px solid ${c.border}`,
      textTransform: "capitalize",
      letterSpacing: "0.02em",
    }}>
      {label}
    </span>
  );
};

const SourceTag = ({ source, sourceDetail }) => {
  const isGP = source === "gp-connect";
  const isERS = sourceDetail === "e-rs";
  const label = isGP ? "GP" : isERS ? "e-RS" : "Hospital";
  const color = isGP ? "#005eb8" : isERS ? "#7C2855" : "#00A499";
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 8px",
      borderRadius: "4px",
      fontSize: "11px",
      fontWeight: 700,
      backgroundColor: color,
      color: "#fff",
      letterSpacing: "0.05em",
      textTransform: "uppercase",
    }}>
      {label}
    </span>
  );
};

const ActionBadge = () => (
  <span style={{
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: "2px 8px",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: 600,
    backgroundColor: "#fef3c7",
    color: "#92400e",
    border: "1px solid #fcd34d",
  }}>
    <span style={{ fontSize: "13px" }}>!</span> Action needed
  </span>
);

const DeepLinkButton = ({ url, label }) => (
  <button
    onClick={() => window.open(url, "_blank")}
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: "6px 14px",
      borderRadius: "6px",
      fontSize: "13px",
      fontWeight: 600,
      backgroundColor: "#005eb8",
      color: "#fff",
      border: "none",
      cursor: "pointer",
      transition: "background-color 0.15s",
    }}
    onMouseEnter={(e) => e.target.style.backgroundColor = "#003d78"}
    onMouseLeave={(e) => e.target.style.backgroundColor = "#005eb8"}
  >
    {label} <span style={{ fontSize: "14px" }}>→</span>
  </button>
);

const AppointmentCard = ({ appt }) => {
  const isCancelled = appt.status === "cancelled";
  const isReferral = appt.sourceDetail === "e-rs" && !appt.start;

  return (
    <div style={{
      backgroundColor: "#fff",
      borderRadius: "12px",
      border: "1px solid #d2d6db",
      padding: "20px 24px",
      opacity: isCancelled ? 0.65 : 1,
      position: "relative",
      transition: "box-shadow 0.2s, transform 0.15s",
      cursor: "default",
    }}
      onMouseEnter={(e) => {
        if (!isCancelled) {
          e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,94,184,0.1)";
          e.currentTarget.style.transform = "translateY(-1px)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "none";
      }}
    >
      {isCancelled && (
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0, bottom: 0,
          borderRadius: "12px",
          background: "repeating-linear-gradient(135deg, transparent, transparent 10px, rgba(114,28,36,0.02) 10px, rgba(114,28,36,0.02) 20px)",
          pointerEvents: "none",
        }} />
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <SourceTag source={appt.source} sourceDetail={appt.sourceDetail} />
          <StatusBadge status={appt.status} referralStatus={appt.referralStatus} />
          {appt.hasActionableItems && <ActionBadge />}
        </div>
        {appt.deliveryChannel && (
          <span style={{ fontSize: "12px", color: "#6b7280", display: "flex", alignItems: "center", gap: "4px" }}>
            {appt.deliveryChannel === "Telephone" ? "📞" : "🏥"} {appt.deliveryChannel}
          </span>
        )}
      </div>

      <h3 style={{
        margin: "0 0 4px 0",
        fontSize: "17px",
        fontWeight: 700,
        color: "#212b32",
        textDecoration: isCancelled ? "line-through" : "none",
        fontFamily: "'Frutiger', 'Noto Sans', Arial, sans-serif",
      }}>
        {appt.type}
      </h3>

      <p style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#4c6272", fontFamily: "'Noto Sans', Arial, sans-serif" }}>
        {appt.specialty} — {appt.provider}
      </p>

      {isReferral ? (
        <div style={{
          backgroundColor: "#fef9e7",
          borderRadius: "8px",
          padding: "12px 16px",
          marginBottom: "12px",
          border: "1px solid #fcd34d",
        }}>
          <p style={{ margin: 0, fontSize: "14px", color: "#92400e", fontWeight: 500 }}>
            This referral is waiting to be booked. Select "Book now" to choose your appointment.
          </p>
          {appt.ersReference && (
            <p style={{ margin: "6px 0 0 0", fontSize: "12px", color: "#a16207" }}>
              e-RS ref: {appt.ersReference}
            </p>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "16px" }}>📅</span>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "#212b32" }}>{formatDate(appt.start)}</div>
              <div style={{ fontSize: "13px", color: "#6b7280" }}>
                {formatTime(appt.start)}–{formatTime(appt.end)}
                {getTimeDiff(appt.start, appt.end) && <span> ({getTimeDiff(appt.start, appt.end)})</span>}
              </div>
            </div>
          </div>
          {appt.location && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "16px" }}>📍</span>
              <span style={{ fontSize: "13px", color: "#4c6272" }}>{appt.location}</span>
            </div>
          )}
        </div>
      )}

      {appt.practitioner && (
        <p style={{ margin: "0 0 12px 0", fontSize: "13px", color: "#4c6272" }}>
          <span style={{ fontWeight: 600 }}>With:</span> {appt.practitioner}
        </p>
      )}

      {isCancelled && appt.cancellationReason && (
        <p style={{ margin: "0 0 12px 0", fontSize: "13px", color: "#721c24", fontStyle: "italic" }}>
          Cancelled: {appt.cancellationReason}
        </p>
      )}

      {appt.ersReference && appt.start && (
        <p style={{ margin: "0 0 12px 0", fontSize: "12px", color: "#6b7280" }}>
          e-RS ref: {appt.ersReference}
        </p>
      )}

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
        {appt.deepLink && !isCancelled && (
          <DeepLinkButton
            url={appt.deepLink}
            label={isReferral ? "Book now" : "View details"}
          />
        )}
        {appt.canReschedule && !isCancelled && (
          <button style={{
            padding: "6px 14px", borderRadius: "6px", fontSize: "13px", fontWeight: 600,
            backgroundColor: "transparent", color: "#005eb8", border: "1px solid #005eb8",
            cursor: "pointer",
          }}>
            Reschedule
          </button>
        )}
        {appt.canCancel && !isCancelled && (
          <button style={{
            padding: "6px 14px", borderRadius: "6px", fontSize: "13px", fontWeight: 600,
            backgroundColor: "transparent", color: "#d5281b", border: "1px solid #d5281b",
            cursor: "pointer",
          }}>
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default function UnifiedAppointments() {
  const [filter, setFilter] = useState("upcoming");
  const [sourceFilter, setSourceFilter] = useState("all");

  const allAppointments = useMemo(() => {
    return [...gpConnectAppointments, ...pcaAppointments].sort((a, b) => {
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

      return true;
    });
  }, [allAppointments, filter, sourceFilter]);

  const actionCount = allAppointments.filter((a) => a.hasActionableItems && a.status !== "cancelled").length;

  const filterBtn = (key, label, count) => (
    <button
      key={key}
      onClick={() => setFilter(key)}
      style={{
        padding: "8px 16px",
        borderRadius: "24px",
        fontSize: "13px",
        fontWeight: filter === key ? 700 : 500,
        backgroundColor: filter === key ? "#005eb8" : "#f0f4f5",
        color: filter === key ? "#fff" : "#4c6272",
        border: "none",
        cursor: "pointer",
        transition: "all 0.15s",
        display: "flex",
        alignItems: "center",
        gap: "6px",
      }}
    >
      {label}
      {count > 0 && (
        <span style={{
          backgroundColor: filter === key ? "rgba(255,255,255,0.25)" : "#005eb8",
          color: filter === key ? "#fff" : "#fff",
          borderRadius: "10px",
          padding: "1px 7px",
          fontSize: "11px",
          fontWeight: 700,
        }}>
          {count}
        </span>
      )}
    </button>
  );

  const sourceBtn = (key, label) => (
    <button
      key={key}
      onClick={() => setSourceFilter(key)}
      style={{
        padding: "5px 12px",
        borderRadius: "6px",
        fontSize: "12px",
        fontWeight: sourceFilter === key ? 700 : 500,
        backgroundColor: sourceFilter === key ? "#212b32" : "transparent",
        color: sourceFilter === key ? "#fff" : "#6b7280",
        border: sourceFilter === key ? "1px solid #212b32" : "1px solid #d2d6db",
        cursor: "pointer",
        transition: "all 0.15s",
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#f0f4f5",
      fontFamily: "'Noto Sans', 'Frutiger', Arial, sans-serif",
    }}>
      {/* NHS-style header */}
      <header style={{
        backgroundColor: "#005eb8",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}>
        <div style={{
          width: "40px", height: "40px",
          backgroundColor: "#fff",
          borderRadius: "8px",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 800, fontSize: "14px", color: "#005eb8",
        }}>
          NHS
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "#fff" }}>
            My Appointments
          </h1>
          <p style={{ margin: 0, fontSize: "12px", color: "rgba(255,255,255,0.75)" }}>
            All your GP and hospital appointments in one place
          </p>
        </div>
      </header>

      <main style={{ maxWidth: "720px", margin: "0 auto", padding: "24px 16px" }}>
        {/* Action required banner */}
        {actionCount > 0 && (
          <div
            onClick={() => setFilter("action")}
            style={{
              backgroundColor: "#fff",
              border: "2px solid #fcd34d",
              borderRadius: "12px",
              padding: "16px 20px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              cursor: "pointer",
              transition: "box-shadow 0.15s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 2px 12px rgba(252,211,77,0.3)"}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
          >
            <div style={{
              width: "40px", height: "40px", borderRadius: "50%",
              backgroundColor: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "20px", flexShrink: 0,
            }}>
              !
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#92400e" }}>
                {actionCount} {actionCount === 1 ? "item needs" : "items need"} your attention
              </p>
              <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "#a16207" }}>
                You have appointments or referrals that require action
              </p>
            </div>
            <span style={{ marginLeft: "auto", fontSize: "18px", color: "#a16207" }}>→</span>
          </div>
        )}

        {/* Status filters */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
          {filterBtn("upcoming", "Upcoming", 0)}
          {filterBtn("action", "Action needed", actionCount)}
          {filterBtn("cancelled", "Cancelled", 0)}
          {filterBtn("all", "All", 0)}
        </div>

        {/* Source filters */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "24px", flexWrap: "wrap" }}>
          {sourceBtn("all", "All sources")}
          {sourceBtn("gp", "GP")}
          {sourceBtn("hospital", "Hospital")}
          {sourceBtn("referrals", "Referrals")}
        </div>

        {/* Data source indicator */}
        <div style={{
          display: "flex", gap: "16px", marginBottom: "20px",
          padding: "10px 16px", backgroundColor: "#e8edee", borderRadius: "8px",
          fontSize: "11px", color: "#4c6272",
        }}>
          <span><strong style={{ color: "#005eb8" }}>GP</strong> via GP Connect (FHIR STU3)</span>
          <span><strong style={{ color: "#00A499" }}>Hospital</strong> via Patient Care Aggregator (FHIR R4)</span>
          <span><strong style={{ color: "#7C2855" }}>e-RS</strong> via Patient Care Aggregator (FHIR R4)</span>
        </div>

        {/* Appointment cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filtered.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "48px 24px",
              backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #d2d6db",
            }}>
              <p style={{ fontSize: "16px", color: "#4c6272", margin: 0 }}>
                No appointments found for this filter.
              </p>
            </div>
          ) : (
            filtered.map((appt) => <AppointmentCard key={appt.id} appt={appt} />)
          )}
        </div>

        {/* Footer note */}
        <div style={{
          marginTop: "32px", padding: "16px",
          fontSize: "12px", color: "#6b7280", lineHeight: 1.5,
          borderTop: "1px solid #d2d6db",
        }}>
          <p style={{ margin: "0 0 4px 0" }}>
            <strong>Data sources:</strong> GP appointments are retrieved from your registered GP practice via GP Connect.
            Hospital appointments and referrals are retrieved from secondary care providers via the Patient Care Aggregator.
          </p>
          <p style={{ margin: 0 }}>
            For full appointment details, select "View details" to go to the relevant patient portal.
            This is a prototype combining data from two separate NHS APIs.
          </p>
        </div>
      </main>
    </div>
  );
}
