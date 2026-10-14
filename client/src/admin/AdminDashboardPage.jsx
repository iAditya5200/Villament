/**
 * AdminDashboardPage.jsx
 * ----------------------
 * The first screen after logging in. Gives a quick overview:
 *   • headline numbers (properties, leads, uncontacted leads, conversion)
 *   • the lead pipeline (how many leads are in each status)
 *   • follow-ups that are due today or overdue
 *   • the most recent enquiries
 *   • which properties attract the most enquiries
 */

import { Link } from "react-router-dom";

import Icon from "../components/Icon.jsx";
import { LoadingSpinner, ErrorMessage } from "../components/LoadingAndErrorStates.jsx";
import { AdminPageHeader, LeadStatusBadge, LEAD_STATUSES } from "./AdminShared.jsx";
import { adminApi } from "../api/apiClient.js";
import { useApiData } from "../hooks/useApiData.js";
import { useAdminAuth } from "../context/AdminAuthContext.jsx";
import { formatDate, formatTimeAgo } from "../utils/formatters.js";

/** Greets the admin according to the time of day. */
function getGreeting() {
  const currentHour = new Date().getHours();
  if (currentHour < 12) return "Good morning";
  if (currentHour < 17) return "Good afternoon";
  return "Good evening";
}

export default function AdminDashboardPage() {
  const { admin } = useAdminAuth();
  const { data, isLoading, errorMessage, reload } = useApiData(() => adminApi.getDashboard(), []);

  if (isLoading) return <LoadingSpinner label="Loading dashboard…" />;
  if (errorMessage) return <ErrorMessage message={errorMessage} onRetry={reload} />;

  const { totals, leadsByStatus, recentEnquiries, followUpsDue, topProperties, propertiesByStatus } = data;
  const largestStatusCount = Math.max(...Object.values(leadsByStatus), 1);
  const largestPropertyCount = Math.max(...topProperties.map((row) => row.enquiryCount), 1);

  return (
    <div className="admin-page">
      <AdminPageHeader
        title={`${getGreeting()}, ${admin?.name?.split(" ")[0] || "there"}`}
        subtitle="Here's what's happening with Villament today."
      >
        <Link to="/admin/properties/new" className="button button--forest">
          <Icon name="plus" size={16} /> Add property
        </Link>
      </AdminPageHeader>

      {/* ---------- Headline numbers ---------- */}
      <div className="stat-cards">
        <StatCard
          label="Leads not contacted"
          value={totals.uncontactedEnquiries}
          note="Waiting for a first call"
          highlight={totals.uncontactedEnquiries > 0}
          linkTo="/admin/enquiries?contacted=no"
        />
        <StatCard label="New leads this week" value={totals.enquiriesThisWeek} note="Last 7 days" linkTo="/admin/enquiries" />
        <StatCard label="Total leads" value={totals.totalEnquiries} note={`${totals.conversionRatePercent}% converted`} linkTo="/admin/enquiries" />
        <StatCard
          label="Properties listed"
          value={totals.totalProperties}
          note={`${propertiesByStatus["Now Selling"] || 0} selling · ${propertiesByStatus["Coming Soon"] || 0} upcoming`}
          linkTo="/admin/properties"
        />
      </div>

      <div className="admin-grid">
        {/* ---------- Lead pipeline ---------- */}
        <section className="admin-card">
          <h2 className="admin-card__title">Lead pipeline</h2>
          <ul className="bar-list">
            {LEAD_STATUSES.map((statusName) => (
              <li key={statusName}>
                <Link to={`/admin/enquiries?leadStatus=${encodeURIComponent(statusName)}`} className="bar-list__row">
                  <span className="bar-list__label">{statusName}</span>
                  <span className="bar-list__track">
                    <span
                      className={`bar-list__fill bar-list__fill--${statusName.toLowerCase().replace(/\s+/g, "-")}`}
                      style={{ width: `${(leadsByStatus[statusName] / largestStatusCount) * 100}%` }}
                    />
                  </span>
                  <strong className="bar-list__value">{leadsByStatus[statusName]}</strong>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------- Follow-ups due ---------- */}
        <section className="admin-card">
          <h2 className="admin-card__title">
            Follow-ups due <span className="admin-card__count">{followUpsDue.length}</span>
          </h2>
          {followUpsDue.length === 0 ? (
            <p className="muted-text">Nothing due today. Nice work.</p>
          ) : (
            <ul className="compact-list">
              {followUpsDue.map((enquiry) => (
                <li key={enquiry._id}>
                  <Link to={`/admin/enquiries?open=${enquiry._id}`} className="compact-list__row">
                    <span>
                      <strong>{enquiry.fullName}</strong>
                      <small>{enquiry.propertyTitle || "General enquiry"}</small>
                    </span>
                    <span className="compact-list__meta">
                      <Icon name="clock" size={14} /> {formatDate(enquiry.nextFollowUpDate)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ---------- Recent enquiries ---------- */}
        <section className="admin-card admin-card--wide">
          <div className="admin-card__header">
            <h2 className="admin-card__title">Latest enquiries</h2>
            <Link to="/admin/enquiries" className="text-link">
              All leads <Icon name="arrowRight" size={16} />
            </Link>
          </div>
          <div className="table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Property</th>
                  <th>Status</th>
                  <th>Received</th>
                </tr>
              </thead>
              <tbody>
                {recentEnquiries.map((enquiry) => (
                  <tr key={enquiry._id}>
                    <td>
                      <Link to={`/admin/enquiries?open=${enquiry._id}`} className="admin-table__primary">
                        {enquiry.fullName}
                      </Link>
                      <small>{enquiry.phone}</small>
                    </td>
                    <td>{enquiry.enquiryType}</td>
                    <td>{enquiry.propertyTitle || "—"}</td>
                    <td>
                      <LeadStatusBadge status={enquiry.leadStatus} />
                    </td>
                    <td>{formatTimeAgo(enquiry.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ---------- Most enquired properties ---------- */}
        <section className="admin-card">
          <h2 className="admin-card__title">Most enquired properties</h2>
          {topProperties.length === 0 ? (
            <p className="muted-text">No property enquiries yet.</p>
          ) : (
            <ul className="bar-list">
              {topProperties.map((row) => (
                <li key={row.propertyTitle} className="bar-list__row">
                  <span className="bar-list__label">{row.propertyTitle}</span>
                  <span className="bar-list__track">
                    <span className="bar-list__fill" style={{ width: `${(row.enquiryCount / largestPropertyCount) * 100}%` }} />
                  </span>
                  <strong className="bar-list__value">{row.enquiryCount}</strong>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

/** One of the headline number cards at the top of the dashboard. */
function StatCard({ label, value, note, highlight = false, linkTo }) {
  return (
    <Link to={linkTo} className={`stat-card ${highlight ? "stat-card--highlight" : ""}`}>
      <span className="stat-card__label">{label}</span>
      <strong className="stat-card__value">{value}</strong>
      <span className="stat-card__note">{note}</span>
    </Link>
  );
}
