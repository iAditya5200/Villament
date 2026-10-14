/**
 * NotFoundPage.jsx
 * ----------------
 * Shown for any address that does not match a page.
 */

import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <section className="section">
      <div className="container center-text not-found">
        <span className="eyebrow">Page not found</span>
        <h1>This path leads nowhere — yet.</h1>
        <p>The page you're looking for may have moved. Let's get you back on track.</p>
        <div className="button-row button-row--center">
          <Link to="/" className="button button--clay">
            Go to home
          </Link>
          <Link to="/properties" className="button button--ghost">
            Browse communities
          </Link>
        </div>
      </div>
    </section>
  );
}
