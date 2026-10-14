/**
 * StatusTag.jsx
 * -------------
 * The small coloured label that shows a property's sales status.
 *   Now Selling  -> green
 *   Coming Soon  -> clay / orange
 *   Sold Out     -> grey
 */

const STATUS_CLASS_NAMES = {
  "Now Selling": "status-tag--selling",
  "Coming Soon": "status-tag--soon",
  "Sold Out": "status-tag--sold",
};

export default function StatusTag({ status }) {
  return <span className={`status-tag ${STATUS_CLASS_NAMES[status] || ""}`}>{status}</span>;
}
