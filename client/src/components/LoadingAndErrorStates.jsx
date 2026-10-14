/**
 * LoadingAndErrorStates.jsx
 * -------------------------
 * Shared components for the moments when data is still loading,
 * failed to load, or there is simply nothing to show.
 */

import Icon from "./Icon.jsx";

/** Grey animated placeholders shaped like property cards. */
export function PropertyCardSkeletons({ count = 3 }) {
  return (
    <>
      {Array.from({ length: count }).map((unusedValue, index) => (
        <div className="property-card property-card--skeleton" key={index} aria-hidden="true">
          <div className="skeleton skeleton--media" />
          <div className="property-card__body">
            <div className="skeleton skeleton--line skeleton--short" />
            <div className="skeleton skeleton--line" />
            <div className="skeleton skeleton--line skeleton--medium" />
          </div>
        </div>
      ))}
    </>
  );
}

/** A centred spinner with optional text. */
export function LoadingSpinner({ label = "Loading…" }) {
  return (
    <div className="loading-spinner" role="status">
      <span className="loading-spinner__circle" />
      <span>{label}</span>
    </div>
  );
}

/** A friendly error box with a "Try again" button. */
export function ErrorMessage({ message, onRetry }) {
  return (
    <div className="state-message state-message--error" role="alert">
      <p>{message || "Something went wrong."}</p>
      {onRetry && (
        <button type="button" className="button button--ghost" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

/** Shown when a list has no items. */
export function EmptyState({ title, description, action }) {
  return (
    <div className="state-message">
      <Icon name="search" size={30} />
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}
