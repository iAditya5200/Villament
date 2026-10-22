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
      {/* <svg className="brand-logo__mark" viewBox="0 0 64 64" width="34" height="34" aria-hidden="true">
        <path d="M10 30 L32 13 L54 30" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M19 33 L32 53 L45 33" fill="none" stroke="var(--color-clay)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg> */}
      <svg
  className="brand-logo__mark"
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 64 64"
  width="54"
  height="54"
  fill="none"
  aria-hidden="true"
>
  {/* Outer arc
  <path
    d="M52 10 A27 27 0 1 0 13 48"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
  /> */}

  {/* Mountain silhouette
  <path
    d="M5 43 L19 31 L25 35 L33 25 L46 40"
    stroke="currentColor"
    strokeWidth="1.3"
    strokeLinecap="round"
    strokeLinejoin="round"
  /> */}

  {/* Monogram V
  <path
    d="M14 15 H27 L35 40 L44 15 H55"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="square"
    strokeLinejoin="round"
  />

  {/* Monogram E */}
  {/* <path
    d="M32 16 H45 M32 16 V34 H43 M32 25 H41"
    stroke="var(--color-clay)"
    strokeWidth="1.8"
    strokeLinecap="square"
  />  */}
{/* Bold V monogram */}
<path
  d="M10 13 H24 L34 45 L45 13 H59"
  fill="none"
  stroke="currentColor"
  strokeWidth="4"
  strokeLinecap="round"
  strokeLinejoin="round"
/>

{/* Bold E monogram */}
<path
  d="M31 17 H46 M31 17 V39 H46 M31 28 H43"
  fill="none"
  stroke="var(--color-clay)"
  strokeWidth="3.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
  {/* Villa roof and structure
  <path
    d="M35 43 L45 37 L57 42 V49 H35 Z"
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinejoin="round"
  />

  <path
    d="M45 42 V49 M50 42 V49"
    stroke="currentColor"
    strokeWidth="0.9"
  /> */}
</svg>
     <span className="brand-logo__text">
  <span className="brand-logo__word">Villament</span>
  <span className="brand-logo__tagline">estate</span>
</span>
    </Link>
  );
}
