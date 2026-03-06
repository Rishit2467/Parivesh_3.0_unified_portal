// ── Status Badge Component ───────────────────────────────────────────
// Renders a colored badge for application workflow statuses

const statusConfig = {
  draft:                { label: "Draft",              className: "badge-draft" },
  submitted:            { label: "Submitted",          className: "badge-submitted" },
  under_scrutiny:       { label: "Under Scrutiny",     className: "badge-scrutiny" },
  query_raised:         { label: "Query Raised",       className: "badge-query" },
  approved_for_meeting: { label: "Approved for Meeting", className: "badge-approved" },
  mom_preparation:      { label: "MoM Preparation",    className: "badge-mom" },
  final_publication:    { label: "Published",           className: "badge-published" },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || { label: status, className: "badge-draft" };
  return <span className={`badge ${config.className}`}>{config.label}</span>;
}
