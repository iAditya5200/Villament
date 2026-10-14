/**
 * PropertyImage.jsx
 * -----------------
 * Shows a property photo. If the photo is missing or fails to load, a soft
 * illustrated placeholder (hills + a house outline) is shown instead, so the
 * layout never looks broken.
 */

import { useState } from "react";
import { resolveImageUrl } from "../utils/formatters.js";

export default function PropertyImage({ imagePath, altText, className = "", loading = "lazy" }) {
  const [hasFailedToLoad, setHasFailedToLoad] = useState(false);
  const imageAddress = resolveImageUrl(imagePath);

  if (!imageAddress || hasFailedToLoad) {
    return (
      <div className={`property-image property-image--placeholder ${className}`} role="img" aria-label={altText}>
        <svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <rect width="400" height="260" fill="var(--color-stone)" />
          <path d="M0 190 Q90 120 170 170 T400 150 V260 H0z" fill="var(--color-sage)" opacity="0.55" />
          <path d="M0 215 Q120 170 230 205 T400 195 V260 H0z" fill="var(--color-forest)" opacity="0.55" />
          <path d="M175 168 L205 145 L235 168 V196 H175z" fill="none" stroke="var(--color-forest)" strokeWidth="4" strokeLinejoin="round" />
          <circle cx="320" cy="70" r="22" fill="var(--color-clay)" opacity="0.7" />
        </svg>
      </div>
    );
  }

  return (
    <img
      className={`property-image ${className}`}
      src={imageAddress}
      alt={altText}
      loading={loading}
      onError={() => setHasFailedToLoad(true)}
    />
  );
}
