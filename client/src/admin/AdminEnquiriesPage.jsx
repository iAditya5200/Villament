/**
 * AdminEnquiriesPage.jsx
 * ----------------------
 * The lead tracker. Every form submitted on the website appears here.
 *
 * What the admin can do:
 *   • switch between status tabs (All, Not contacted, New, Contacted ...)
 *   • search by name, email, phone or property, and filter by type / date
 *   • change a lead's status straight from the table
 *   • click a lead to open the detail drawer (notes, follow-up date, history)
 *   • download the filtered list as a CSV file for Excel / Google Sheets
 *
 * Filters live in the page address, e.g. /admin/enquiries?contacted=no,
 * so the dashboard can link straight to a filtered view.
 */

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import Icon from "../components/Icon.jsx";
import { LoadingSpinner, ErrorMessage, EmptyState } from "../components/LoadingAndErrorStates.jsx";
import { AdminPageHeader, LEAD_STATUSES, Toast } from "./AdminShared.jsx";
import EnquiryDetailDrawer from "./EnquiryDetailDrawer.jsx";
import { adminApi } from "../api/apiClient.js";
import { useApiData } from "../hooks/useApiData.js";
import { formatDate, formatTimeAgo } from "../utils/formatters.js";

const ENQUIRY_TYPES = ["General", "Site Visit", "Register Interest", "Brochure Request"];
const SEARCH_TYPING_DELAY_IN_MILLISECONDS = 350;

/** Turns "Site Visit Scheduled" into "site-visit-scheduled" for CSS classes. */
function toCssName(text) {
  return text.toLowerCase().replace(/\s+/g, "-");
}

/** Makes a WhatsApp link from any phone format: "+91 98200 11223" -> wa.me/919820011223 */
function buildWhatsappLink(phoneNumber) {
  let digitsOnly = phoneNumber.replace(/\D/g, "");
  if (digitsOnly.length === 10) digitsOnly = `91${digitsOnly}`; // assume India if no country code
  return `https://wa.me/${digitsOnly}`;
}

export default function AdminEnquiriesPage() {
  const [searchParameters, setSearchParameters] = useSearchParams();

  // ----- Read filters from the address bar -----
  const filters = {
    leadStatus: searchParameters.get("leadStatus") || "",
    contacted: searchParameters.get("contacted") || "",
    enquiryType: searchParameters.get("enquiryType") || "",
    propertyId: searchParameters.get("propertyId") || "",
    search: searchParameters.get("search") || "",
    fromDate: searchParameters.get("fromDate") || "",
    toDate: searchParameters.get("toDate") || "",
    page: searchParameters.get("page") || "1",
  };
  const openEnquiryId = searchParameters.get("open") || "";

  const [searchBoxText, setSearchBoxText] = useState(filters.search);
  const [toast, setToast] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const closeToast = useCallback(() => setToast(null), []);

  const { data, setData, isLoading, errorMessage, reload } = useApiData(
    () => adminApi.getEnquiries(filters),
    // Reload whenever any filter changes
    [
      filters.leadStatus,
      filters.contacted,
      filters.enquiryType,
      filters.propertyId,
      filters.search,
      filters.fromDate,
      filters.toDate,
      filters.page,
    ]
  );

  /** Changes several filters at once. Any filter change goes back to page 1. */
  function updateFilters(changes, { keepPage = false } = {}) {
    const updatedParameters = new URLSearchParams(searchParameters);
    Object.entries(changes).forEach(([filterName, filterValue]) => {
      if (filterValue) updatedParameters.set(filterName, filterValue);
      else updatedParameters.delete(filterName);
    });
    if (!keepPage) updatedParameters.delete("page");
    setSearchParameters(updatedParameters, { replace: true });
  }

  // Apply the search after the admin stops typing
  useEffect(() => {
    const timerId = window.setTimeout(() => {
      if (searchBoxText !== filters.search) updateFilters({ search: searchBoxText });
    }, SEARCH_TYPING_DELAY_IN_MILLISECONDS);
    return () => window.clearTimeout(timerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchBoxText]);

  /** Opens or closes the detail drawer (kept in the address as ?open=<id>). */
  function setOpenEnquiry(enquiryId) {
    updateFilters({ open: enquiryId }, { keepPage: true });
  }

  /**
   * Replaces one lead in the table after it was changed (in the drawer or the
   * inline status menu), so the table stays up to date without reloading.
   */
  function replaceEnquiryInTable(updatedEnquiry) {
    setData((previousData) => {
      if (!previousData) return previousData;
      return {
        ...previousData,
        enquiries: previousData.enquiries.map((enquiry) => (enquiry._id === updatedEnquiry._id ? { ...enquiry, ...updatedEnquiry } : enquiry)),
      };
    });
  }

  async function changeStatusInline(enquiry, newStatus) {
    try {
      const { enquiry: updatedEnquiry } = await adminApi.updateEnquiry(enquiry._id, { leadStatus: newStatus });
      replaceEnquiryInTable(updatedEnquiry);
      setToast({ type: "success", text: `${enquiry.fullName} → ${newStatus}` });
      reload(); // refresh the tab counts
    } catch (error) {
      setToast({ type: "error", text: error.message });
    }
  }

  async function downloadCsv() {
    setIsDownloading(true);
    try {
      const { page, ...filtersWithoutPage } = filters;
      await adminApi.downloadEnquiriesCsv(filtersWithoutPage);
    } catch (error) {
      setToast({ type: "error", text: error.message });
    } finally {
      setIsDownloading(false);
    }
  }

  const enquiries = data?.enquiries || [];
  const pagination = data?.pagination;
  const counts = data?.counts;

  // The tab bar: "All", "Not contacted", then one tab per status
  const statusTabs = [
    { label: "All", count: counts?.all, isActive: !filters.leadStatus && !filters.contacted, changes: { leadStatus: "", contacted: "" } },
    {
      label: "Not contacted",
      count: counts?.notContacted,
      isActive: filters.contacted === "no",
      changes: { leadStatus: "", contacted: "no" },
      isUrgent: true,
    },
    ...LEAD_STATUSES.filter((statusName) => statusName !== "New").map((statusName) => ({
      label: statusName,
      count: counts?.byStatus?.[statusName],
      isActive: filters.leadStatus === statusName,
      changes: { leadStatus: statusName, contacted: "" },
    })),
  ];

  const hasExtraFilters = Boolean(filters.enquiryType || filters.propertyId || filters.search || filters.fromDate || filters.toDate);

  return (
    <div className="admin-page">
      <AdminPageHeader title="Leads" subtitle="Every enquiry from the website, and where each one stands.">
        <button type="button" className="button button--ghost" onClick={downloadCsv} disabled={isDownloading}>
          <Icon name="download" size={16} /> {isDownloading ? "Preparing…" : "Export CSV"}
        </button>
      </AdminPageHeader>

      {/* ---------- Status tabs ---------- */}
      <div className="status-tabs" role="tablist">
        {statusTabs.map((statusTab) => (
          <button
            type="button"
            role="tab"
            aria-selected={statusTab.isActive}
            key={statusTab.label}
            className={`status-tabs__tab ${statusTab.isActive ? "status-tabs__tab--active" : ""} ${statusTab.isUrgent ? "status-tabs__tab--urgent" : ""}`}
            onClick={() => updateFilters(statusTab.changes)}
          >
            {statusTab.label}
            {statusTab.count !== undefined && <span className="status-tabs__count">{statusTab.count}</span>}
          </button>
        ))}
      </div>

      {/* ---------- Search and filters ---------- */}
      <div className="admin-toolbar">
        <label className="admin-search">
          <Icon name="search" size={18} />
          <input
            type="search"
            placeholder="Search name, phone, email or property"
            value={searchBoxText}
            onChange={(event) => setSearchBoxText(event.target.value)}
          />
        </label>
        <select value={filters.enquiryType} onChange={(event) => updateFilters({ enquiryType: event.target.value })} aria-label="Enquiry type">
          <option value="">All enquiry types</option>
          {ENQUIRY_TYPES.map((typeName) => (
            <option key={typeName}>{typeName}</option>
          ))}
        </select>
        <label className="admin-date-filter">
          <span>From</span>
          <input type="date" value={filters.fromDate} onChange={(event) => updateFilters({ fromDate: event.target.value })} />
        </label>
        <label className="admin-date-filter">
          <span>To</span>
          <input type="date" value={filters.toDate} onChange={(event) => updateFilters({ toDate: event.target.value })} />
        </label>
        {hasExtraFilters && (
          <button
            type="button"
            className="chip chip--clear"
            onClick={() => {
              setSearchBoxText("");
              updateFilters({ enquiryType: "", propertyId: "", search: "", fromDate: "", toDate: "" });
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      {filters.propertyId && (
        <p className="admin-filter-note">
          Showing leads for one property.{" "}
          <button type="button" className="text-link" onClick={() => updateFilters({ propertyId: "" })}>
            Show all
          </button>
        </p>
      )}

      {/* ---------- Table ---------- */}
      {isLoading && !data ? (
        <LoadingSpinner label="Loading leads…" />
      ) : errorMessage ? (
        <ErrorMessage message={errorMessage} onRetry={reload} />
      ) : enquiries.length === 0 ? (
        <EmptyState title="No leads here" description="When visitors submit a form on the website, they'll appear in this list." />
      ) : (
        <div className={`admin-card admin-card--flush ${isLoading ? "is-refreshing" : ""}`}>
          <div className="table-scroll">
            <table className="admin-table admin-table--leads">
              <thead>
                <tr>
                  <th aria-label="Contacted" />
                  <th>Lead</th>
                  <th>Type</th>
                  <th>Property</th>
                  <th>Visit date</th>
                  <th>Status</th>
                  <th>Follow-up</th>
                  <th>Received</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.map((enquiry) => (
                  <tr
                    key={enquiry._id}
                    className={`admin-table__clickable ${enquiry.isContacted ? "" : "admin-table__row--uncontacted"}`}
                    onClick={() => setOpenEnquiry(enquiry._id)}
                  >
                    <td>
                      <span
                        className={`contact-indicator ${enquiry.isContacted ? "contact-indicator--done" : ""}`}
                        title={enquiry.isContacted ? `Contacted ${formatDate(enquiry.contactedAt)}` : "Not contacted yet"}
                      />
                    </td>
                    <td>
                      <span className="admin-table__primary">{enquiry.fullName}</span>
                      <span className="lead-quick-links" onClick={(event) => event.stopPropagation()}>
                        <a href={`tel:${enquiry.phone}`} title="Call">
                          <Icon name="phone" size={13} /> {enquiry.phone}
                        </a>
                        <a href={buildWhatsappLink(enquiry.phone)} target="_blank" rel="noreferrer" title="WhatsApp">
                          <Icon name="chat" size={13} />
                        </a>
                        <a href={`mailto:${enquiry.email}`} title={enquiry.email}>
                          <Icon name="mail" size={13} />
                        </a>
                      </span>
                    </td>
                    <td>{enquiry.enquiryType}</td>
                    <td>{enquiry.propertyTitle || "—"}</td>
                    <td>{enquiry.preferredVisitDate ? formatDate(enquiry.preferredVisitDate) : "—"}</td>
                    <td onClick={(event) => event.stopPropagation()}>
                      <select
                        className={`status-select status-select--${toCssName(enquiry.leadStatus)}`}
                        value={enquiry.leadStatus}
                        onChange={(event) => changeStatusInline(enquiry, event.target.value)}
                        aria-label={`Status for ${enquiry.fullName}`}
                      >
                        {LEAD_STATUSES.map((statusName) => (
                          <option key={statusName}>{statusName}</option>
                        ))}
                      </select>
                    </td>
                    <td>{enquiry.nextFollowUpDate ? formatDate(enquiry.nextFollowUpDate) : "—"}</td>
                    <td title={formatDate(enquiry.createdAt)}>{formatTimeAgo(enquiry.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ---------- Pagination ---------- */}
          {pagination && pagination.totalPages > 1 && (
            <div className="pagination">
              <span>
                Page {pagination.currentPage} of {pagination.totalPages} · {pagination.totalItems} leads
              </span>
              <div className="button-row">
                <button
                  type="button"
                  className="button button--ghost button--small"
                  disabled={pagination.currentPage <= 1}
                  onClick={() => updateFilters({ page: String(pagination.currentPage - 1) }, { keepPage: true })}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="button button--ghost button--small"
                  disabled={pagination.currentPage >= pagination.totalPages}
                  onClick={() => updateFilters({ page: String(pagination.currentPage + 1) }, { keepPage: true })}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {openEnquiryId && (
        <EnquiryDetailDrawer
          key={openEnquiryId}
          enquiryId={openEnquiryId}
          onClose={() => setOpenEnquiry("")}
          onUpdated={(updatedEnquiry) => {
            replaceEnquiryInTable(updatedEnquiry);
            reload();
          }}
          onDeleted={(deletedName) => {
            setOpenEnquiry("");
            setToast({ type: "success", text: `Lead for ${deletedName} deleted.` });
            reload();
          }}
        />
      )}

      <Toast toast={toast} onClose={closeToast} />
    </div>
  );
}
