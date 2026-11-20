// /**
//  * PropertyImage.jsx
//  * -----------------
//  * Shows a property photo. If the photo is missing or fails to load, a soft
//  * illustrated placeholder (hills + a house outline) is shown instead, so the
//  * layout never looks broken.
//  */

// import { useState } from "react";
// import { resolveImageUrl } from "../utils/formatters.js";

// export default function PropertyImage({ imagePath, altText, className = "", loading = "lazy" }) {
//   const [hasFailedToLoad, setHasFailedToLoad] = useState(false);
//   const imageAddress = resolveImageUrl(imagePath);

//   if (!imageAddress || hasFailedToLoad) {
//     return (
//       <div className={`property-image property-image--placeholder ${className}`} role="img" aria-label={altText}>
//         <svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
//           <rect width="400" height="260" fill="var(--color-stone)" />
//           <path d="M0 190 Q90 120 170 170 T400 150 V260 H0z" fill="var(--color-sage)" opacity="0.55" />
//           <path d="M0 215 Q120 170 230 205 T400 195 V260 H0z" fill="var(--color-forest)" opacity="0.55" />
//           <path d="M175 168 L205 145 L235 168 V196 H175z" fill="none" stroke="var(--color-forest)" strokeWidth="4" strokeLinejoin="round" />
//           <circle cx="320" cy="70" r="22" fill="var(--color-clay)" opacity="0.7" />
//         </svg>
//       </div>
//     );
//   }

//   return (
//     <img
//       className={`property-image ${className}`}
//       src={imageAddress}
//       alt={altText}
//       loading={loading}
//       onError={() => setHasFailedToLoad(true)}
//     />
//   );
// }

/**
 * PropertyImage.jsx
 * -----------------
 * Shows a property photo.
 *
 * Features:
 *   1. NO CROPPING  - the whole photo is always visible. If the photo's shape
 *                     differs from its box, the spare space is filled with a
 *                     soft background colour instead of cutting the photo off.
 *   2. MAGNIFY      - a small magnifier button opens the photo in a full-screen
 *                     viewer where the visitor can zoom in, zoom out, scroll
 *                     around a zoomed photo, and close it (button, Esc key,
 *                     or a click on the dark background).
 *   3. PLACEHOLDER  - if the photo is missing or fails to load, a soft
 *                     illustrated placeholder (hills + a house outline) is
 *                     shown instead, so the layout never looks broken.
 *
 * Props:
 *   imagePath     - the stored image address (Cloudinary link or pasted link)
 *   altText       - short description of the photo, for screen readers
 *   className     - optional extra CSS class(es) for the outer box (set the
 *                   size / aspect ratio of the photo with this)
 *   loading       - "lazy" (default) or "eager" for the browser's loading hint
 *   allowMagnify  - true (default) shows the magnifier button; pass false
 *                   where the image sits inside a clickable card and a
 *                   magnifier would get in the way
 */

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { resolveImageUrl } from "../utils/formatters.js";


/* The zoom steps offered in the full-screen viewer (1 = fits the screen). */
const ZOOM_LEVELS = [1, 1.5, 2, 3, 4];

/* ------------------------------------------------------------------ */
/* Full-screen viewer (lightbox)                                       */
/* ------------------------------------------------------------------ */

/**
 * The dark full-screen viewer that opens when the magnifier button is pressed.
 *
 * Props:
 *   imageAddress   - the web address of the photo to show
 *   altText        - description of the photo
 *   onCloseViewer  - function that closes the viewer
 */
function ImageViewer({ imageAddress, altText, onCloseViewer }) {
  // Which entry of ZOOM_LEVELS is currently used (0 means "fit to screen").
  const [zoomIndex, setZoomIndex] = useState(0);
  const closeButtonReference = useRef(null);

  const currentZoom = ZOOM_LEVELS[zoomIndex];
  const canZoomOut = zoomIndex > 0;
  const canZoomIn = zoomIndex < ZOOM_LEVELS.length - 1;

  /** Make the photo one step bigger. */
  function zoomIn() {
    if (canZoomIn) {
      setZoomIndex(zoomIndex + 1);
    }
  }

  /** Make the photo one step smaller. */
  function zoomOut() {
    if (canZoomOut) {
      setZoomIndex(zoomIndex - 1);
    }
  }

  /** Go back to "fit to screen". */
  function resetZoom() {
    setZoomIndex(0);
  }

  /**
   * Clicking the photo itself switches between "fit to screen" and 2x zoom,
   * which is a quick way to magnify without using the buttons.
   */
  function toggleQuickZoom(event) {
    event.stopPropagation(); // do not let this click reach the dark background
    if (zoomIndex === 0) {
      setZoomIndex(2); // 2x
    } else {
      setZoomIndex(0);
    }
  }

  /*
   * While the viewer is open:
   *   - listen for keyboard shortcuts (Esc closes, + zooms in, - zooms out),
   *   - stop the page behind the viewer from scrolling,
   *   - move keyboard focus to the Close button.
   * Everything is undone again when the viewer closes.
   */
  useEffect(
    function setUpViewer() {
      function handleKeyPress(event) {
        if (event.key === "Escape") {
          onCloseViewer();
        } else if (event.key === "+" || event.key === "=") {
          zoomIn();
        } else if (event.key === "-") {
          zoomOut();
        }
      }

      document.addEventListener("keydown", handleKeyPress);

      const originalBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      if (closeButtonReference.current) {
        closeButtonReference.current.focus();
      }

      return function cleanUpViewer() {
        document.removeEventListener("keydown", handleKeyPress);
        document.body.style.overflow = originalBodyOverflow;
      };
    },
    // The keyboard handler uses the latest zoom position, so re-attach when it changes.
    [zoomIndex, onCloseViewer]
  );

  /*
   * IMPORTANT: React passes clicks made inside a "portal" up to the parent
   * component, which may be a link (<Link>) around a property card. Stopping
   * the click here makes sure that using the viewer never opens that link.
   */
  function stopClickFromReachingParentLink(event) {
    event.stopPropagation();
  }

  // Build the CSS class for the photo: "fit" when not zoomed, "zoomed" otherwise.
  let viewerImageClassName = "image-viewer__photo";
  if (zoomIndex === 0) {
    viewerImageClassName = viewerImageClassName + " image-viewer__photo--fit";
  } else {
    viewerImageClassName = viewerImageClassName + " image-viewer__photo--zoomed";
  }

  // When zoomed, the photo's width is a multiple of the viewer's width.
  let viewerImageStyle = {};
  if (zoomIndex !== 0) {
    viewerImageStyle = { width: currentZoom * 100 + "%" };
  }

  const viewerContent = (
    <div
      className="image-viewer"
      role="dialog"
      aria-modal="true"
      aria-label={"Enlarged photo: " + altText}
      onClick={stopClickFromReachingParentLink}
    >
      {/* Top bar with the zoom controls and the Close button */}
      <div className="image-viewer__toolbar">
        <button
          type="button"
          className="image-viewer__button"
          onClick={zoomOut}
          disabled={!canZoomOut}
          aria-label="Zoom out"
        >
          &minus;
        </button>

        <button
          type="button"
          className="image-viewer__button image-viewer__button--wide"
          onClick={resetZoom}
          disabled={!canZoomOut}
          aria-label="Reset zoom"
        >
          {Math.round(currentZoom * 100)}%
        </button>

        <button
          type="button"
          className="image-viewer__button"
          onClick={zoomIn}
          disabled={!canZoomIn}
          aria-label="Zoom in"
        >
          +
        </button>

        <button
          type="button"
          className="image-viewer__button image-viewer__button--close"
          onClick={onCloseViewer}
          ref={closeButtonReference}
          aria-label="Close enlarged photo"
        >
          &times;
        </button>
      </div>

      {/* The dark area around the photo; clicking it closes the viewer */}
      <div className="image-viewer__stage" onClick={onCloseViewer}>
        <img
          className={viewerImageClassName}
          style={viewerImageStyle}
          src={imageAddress}
          alt={altText}
          onClick={toggleQuickZoom}
          draggable="false"
        />
      </div>
    </div>
  );

  // Draw the viewer directly inside <body> so it always covers the whole screen.
  return createPortal(viewerContent, document.body);
}

/* ------------------------------------------------------------------ */
/* The property image itself                                           */
/* ------------------------------------------------------------------ */

export default function PropertyImage({
  imagePath,
  altText,
  className = "",
  loading = "lazy",
  allowMagnify = true,
}) {
  // True once the browser reports that the photo could not be loaded.
  const [hasFailedToLoad, setHasFailedToLoad] = useState(false);

  // True while the full-screen viewer is open.
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const imageAddress = resolveImageUrl(imagePath);

  /* ---------- Placeholder: no photo, or the photo failed to load ---------- */
  if (!imageAddress || hasFailedToLoad) {
    return (
      <div
        className={"property-image property-image--placeholder " + className}
        role="img"
        aria-label={altText}
      >
        <svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <rect width="400" height="260" fill="var(--color-stone)" />
          <path d="M0 190 Q90 120 170 170 T400 150 V260 H0z" fill="var(--color-sage)" opacity="0.55" />
          <path d="M0 215 Q120 170 230 205 T400 195 V260 H0z" fill="var(--color-forest)" opacity="0.55" />
          <path
            d="M175 168 L205 145 L235 168 V196 H175z"
            fill="none"
            stroke="var(--color-forest)"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <circle cx="320" cy="70" r="22" fill="var(--color-clay)" opacity="0.7" />
        </svg>
      </div>
    );
  }

  /** Opens the full-screen viewer. */
  function openViewer(event) {
    // If this image sits inside a link or card, do not trigger that link.
    event.preventDefault();
    event.stopPropagation();
    setIsViewerOpen(true);
  }

  /** Closes the full-screen viewer. */
  function closeViewer() {
    setIsViewerOpen(false);
  }

  /* ---------- Normal view: the whole photo, uncropped ---------- */
  return (
    <div className={"property-image " + className}>
      <img
        className="property-image__photo"
        src={imageAddress}
        alt={altText}
        loading={loading}
        onError={function handleImageError() {
          setHasFailedToLoad(true);
        }}
      />

      {allowMagnify ? (
        <button
          type="button"
          className="property-image__magnify"
          onClick={openViewer}
          aria-label="View photo larger"
          title="View larger"
        >
          {/* Magnifying-glass icon with a plus sign */}
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <circle cx="10" cy="10" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
            <line x1="14.5" y1="14.5" x2="20" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="7.5" y1="10" x2="12.5" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="10" y1="7.5" x2="10" y2="12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      ) : null}

      {isViewerOpen ? (
        <ImageViewer imageAddress={imageAddress} altText={altText} onCloseViewer={closeViewer} />
      ) : null}
    </div>
  );
}