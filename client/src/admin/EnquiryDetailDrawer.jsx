/**
 * EnquiryDetailDrawer.jsx
 * -----------------------
 * A panel that slides in from the right with everything about one lead:
 *   • contact details with one-tap call / WhatsApp / email
 *   • the visitor's message and the property they asked about
 *   • lead tracking: status, "mark as contacted", next follow-up date
 *   • follow-up notes and the full activity history
 *   • delete the lead
 */

import { useEffect, useState } from "react";

import Icon from "../components/Icon.jsx";
import { LoadingSpinner, ErrorMessage } from "../components/LoadingAndErrorStates.jsx";
import { ConfirmDialog, LeadStatusBadge, LEAD_STATUSES } from "./AdminShared.jsx";
import { adminApi } from "../api/apiClient.js";
import { formatDate, formatDateTime } from "../utils/formatters.js";

/** Converts a date into the "YYYY-MM-DD" text a date input needs. */
function toDateInputValue(dateValue) {
  return dateValue ? new Date(dateValue).toISOString().slice(0, 10) : "";
}

export default function EnquiryDetailDrawer({ enquiryId, onClose, onUpdated, onDeleted }) {
  const [enquiry, setEnquiry] = useState(null);
  const [loadingError, setLoadingError] = useState("");
  const [actionError, setActionError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // Load the full lead (including history) when the drawer opens
  useEffect(() => {
    async function loadEnquiry() {
      try {
        const { enquiry: loadedEnquiry } = await adminApi.getEnquiry(enquiryId);
        setEnquiry(loadedEnquiry);
      } catch (error) {
        setLoadingError(error.message);
      }
    }
    loadEnquiry();
  }, [enquiryId]);

  // Close with the Escape key
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape" && !isConfirmingDelete) onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, isConfirmingDelete]);

  /**
   * Sends a change to the server and refreshes the drawer and the table.
   * @param {Function} apiCall - returns a Promise resolving to { enquiry }
   */
  async function saveChange(apiCall) {
    setIsSaving(true);
    setActionError("");
    try {
      const { enquiry: updatedEnquiry } = await apiCall();
      setEnquiry(updatedEnquiry);
      onUpdated(updatedEnquiry);
      return true;
    } catch (error) {
      setActionError(error.message);
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  const changeStatus = (newStatus) => saveChange(() => adminApi.updateEnquiry(enquiryId, { leadStatus: newStatus }));
  const changeFollowUpDate = (newDate) => saveChange(() => adminApi.updateEnquiry(enquiryId, { nextFollowUpDate: newDate || null }));

  async function addNote(event) {
    event.preventDefault();
    if (!noteText.trim()) return;
    const wasSaved = await saveChange(() => adminApi.addEnquiryNote(enquiryId, noteText.trim()));
    if (wasSaved) setNoteText("");
  }

  async function deleteThisEnquiry() {
    setIsSaving(true);
    try {
      await adminApi.deleteEnquiry(enquiryId);
      onDeleted(enquiry.fullName);
    } catch (error) {
      setActionError(error.message);
      setIsSaving(false);
      setIsConfirmingDelete(false);
    }
  }

  // Newest activity first
  const activityNewestFirst = enquiry ? [...enquiry.activityLog].reverse() : [];

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label="Lead details">
        <div className="drawer__header">
          <span className="eyebrow">Lead details</span>
          <button type="button" className="modal__close" onClick={onClose} aria-label="Close">
            <Icon name="close" size={20} />
          </button>
        </div>

        {loadingError ? (
          <ErrorMessage message={loadingError} />
        ) : !enquiry ? (
          <LoadingSpinner label="Loading lead…" />
        ) : (
          <div className="drawer__body">
            {/* ---------- Who ---------- */}
            <div className="drawer__identity">
              <h2>{enquiry.fullName}</h2>
              <LeadStatusBadge status={enquiry.leadStatus} />
            </div>
            <p className="muted-text">
              {enquiry.enquiryType} · received {formatDateTime(enquiry.createdAt)}
            </p>

            <div className="drawer__contact-buttons">
              <a className="button button--forest button--small" href={`tel:${enquiry.phone}`}>
                <Icon name="phone" size={15} /> {enquiry.phone}
              </a>
              <a className="button button--ghost button--small" href={`mailto:${enquiry.email}`}>
                <Icon name="mail" size={15} /> Email
              </a>
            </div>

            <dl className="drawer__details">
              <div>
                <dt>Email</dt>
                <dd>{enquiry.email}</dd>
              </div>
              <div>
                <dt>Property</dt>
                <dd>
                  {enquiry.property ? (
                    <a href={`/properties/${enquiry.property.slug}`} target="_blank" rel="noreferrer" className="text-link">
                      {enquiry.propertyTitle} <Icon name="external" size={13} />
                    </a>
                  ) : (
                    enquiry.propertyTitle || "General enquiry"
                  )}
                </dd>
              </div>
              {enquiry.preferredVisitDate && (
                <div>
                  <dt>Preferred visit</dt>
                  <dd>{formatDate(enquiry.preferredVisitDate)}</dd>
                </div>
              )}
              <div>
                <dt>Submitted from</dt>
                <dd>{enquiry.sourcePage || "—"}</dd>
              </div>
            </dl>

            {enquiry.message && (
              <blockquote className="drawer__message">
                <Icon name="chat" size={16} />
                <p>{enquiry.message}</p>
              </blockquote>
            )}

            {/* ---------- Tracking ---------- */}
            <section className="drawer__section">
              <h3>Tracking</h3>

              {!enquiry.isContacted ? (
                <button type="button" className="button button--clay button--full" onClick={() => changeStatus("Contacted")} disabled={isSaving}>
                  <Icon name="check" size={16} /> Mark as contacted
                </button>
              ) : (
                <p className="drawer__contacted-note">
                  <Icon name="check" size={16} /> Contacted on {formatDateTime(enquiry.contactedAt)}
                </p>
              )}

              <div className="form-grid">
                <label className="form-field">
                  <span className="form-field__label">Lead status</span>
                  <select value={enquiry.leadStatus} onChange={(event) => changeStatus(event.target.value)} disabled={isSaving}>
                    {LEAD_STATUSES.map((statusName) => (
                      <option key={statusName}>{statusName}</option>
                    ))}
                  </select>
                </label>
                <label className="form-field">
                  <span className="form-field__label">Next follow-up</span>
                  <input
                    type="date"
                    value={toDateInputValue(enquiry.nextFollowUpDate)}
                    onChange={(event) => changeFollowUpDate(event.target.value)}
                    disabled={isSaving}
                  />
                </label>
              </div>
            </section>

            {/* ---------- Notes ---------- */}
            <section className="drawer__section">
              <h3>Add a note</h3>
              <form onSubmit={addNote} className="drawer__note-form">
                <textarea
                  rows={3}
                  placeholder="e.g. Called, interested in 4 BHK. Wants to visit with parents next Sunday."
                  value={noteText}
                  onChange={(event) => setNoteText(event.target.value)}
                />
                <button type="submit" className="button button--forest button--small" disabled={isSaving || !noteText.trim()}>
                  Save note
                </button>
              </form>
            </section>

            {actionError && <p className="form-error">{actionError}</p>}

            {/* ---------- History ---------- */}
            <section className="drawer__section">
              <h3>History</h3>
              <ol className="timeline">
                {activityNewestFirst.map((activity) => (
                  <li key={activity._id} className={`timeline__item timeline__item--${activity.activityType}`}>
                    <span className="timeline__dot" />
                    <div>
                      <p>{activity.message}</p>
                      <small>
                        {activity.performedBy} · {formatDateTime(activity.createdAt)}
                      </small>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <button type="button" className="button button--danger button--small" onClick={() => setIsConfirmingDelete(true)}>
              <Icon name="trash" size={15} /> Delete lead
            </button>
          </div>
        )}
      </aside>

      <ConfirmDialog
        isOpen={isConfirmingDelete}
        title="Delete this lead?"
        message={`The enquiry from ${enquiry?.fullName} and all its notes will be permanently removed.`}
        confirmLabel="Delete lead"
        onConfirm={deleteThisEnquiry}
        onCancel={() => setIsConfirmingDelete(false)}
        isWorking={isSaving}
      />
    </>
  );
}
