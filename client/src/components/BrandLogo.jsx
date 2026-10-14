/**
 * BrandLogo.jsx
 * -------------
 * The Villament logo: a roof line above a "V", followed by the word mark.
 *
 * @param {"dark"|"light"} tone - "light" is used on dark backgrounds
 */

import { Link } from "react-router-dom";

export default function BrandLogo({ tone = "dark", linkTo = "/" }) {
  return (
    <Link to={linkTo} className={`brand-logo brand-logo--${tone}`} aria-label="Villament home">
      <svg className="brand-logo__mark" viewBox="0 0 64 64" width="34" height="34" aria-hidden="true">
        <path d="M10 30 L32 13 L54 30" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M19 33 L32 53 L45 33" fill="none" stroke="var(--color-clay)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="brand-logo__word">Villament</span>
    </Link>
  );
}
