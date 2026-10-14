/**
 * AdminShared.jsx
 * ---------------
 * Small building blocks reused across admin pages:
 *   • AdminPageHeader – page title, subtitle and action buttons
 *   • LeadStatusBadge – coloured pill for a lead's status
 *   • ConfirmDialog   – "Are you sure?" pop-up for deleting things
 *   • Toast           – short success / error message in the corner
 */

import { useEffect } from "react";
import Icon from "../components/Icon.jsx";

/** The admin lead statuses, in pipeline order (must match the server). */
export const LEAD_STATUSES = ["New", "Contacted", "Site Visit Scheduled", "Converted", "Not Interested"];

export function AdminPageHeader({ title, subtitle, children }) {
  return (
    <header className="admin-page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children && <div className="admin-page-header__actions">{children}</div>}
    </header>
  );
}

/** Turns "Site Visit Scheduled" into "site-visit-scheduled" for CSS classes. */
function toCssName(text) {
  return text.toLowerCase().replace(/\s+/g, "-");
}

export function LeadStatusBadge({ status }) {
  return <span className={`lead-badge lead-badge--${toCssName(status)}`}>{status}</span>;
}

/**
 * A modal asking the admin to confirm a destructive action.
 *
 * @param {boolean} isOpen
 * @param {string} title
 * @param {string} message
 * @param {string} confirmLabel
 * @param {Function} onConfirm
 * @param {Function} onCancel
 * @param {boolean} isWorking - disables the buttons while the action runs
 */
export function ConfirmDialog({ isOpen, title, message, confirmLabel = "Delete", onConfirm, onCancel, isWorking = false }) {
  useEffect(() => {
    if (!isOpen) return undefined;
    function handleKeyDown(event) {
      if (event.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onMouseDown={onCancel}>
      <div className="modal modal--small" role="alertdialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
        <h2 className="modal__heading">{title}</h2>
        <p className="modal__subheading">{message}</p>
        <div className="button-row">
          <button type="button" className="button button--danger" onClick={onConfirm} disabled={isWorking}>
            <Icon name="trash" size={16} /> {isWorking ? "Working…" : confirmLabel}
          </button>
          <button type="button" className="button button--ghost" onClick={onCancel} disabled={isWorking}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * A message that appears in the corner and disappears after a few seconds.
 *
 * @param {{ type: "success"|"error", text: string } | null} toast
 * @param {Function} onClose
 */
export function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return undefined;
    const timerId = window.setTimeout(onClose, 3500);
    return () => window.clearTimeout(timerId);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div className={`toast toast--${toast.type}`} role="status">
      <Icon name={toast.type === "success" ? "check" : "close"} size={18} />
      {toast.text}
    </div>
  );
}
