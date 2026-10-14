/**
 * PropertyDetailPage.jsx
 * ----------------------
 * Everything about one community: photo gallery, key facts, description,
 * highlights, amenities, EMI calculator, map, a sticky enquiry form and
 * similar properties.
 *
 * The address looks like /properties/aranya-courtyard-villas – the last part
 * (the "slug") is used to load the property from the API.
 */

import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import Icon from "../components/Icon.jsx";
import PropertyImage from "../components/PropertyImage.jsx";
import PropertyCard from "../components/PropertyCard.jsx";
import StatusTag from "../components/StatusTag.jsx";
import EnquiryForm from "../components/EnquiryForm.jsx";
import EmiCalculator from "../components/EmiCalculator.jsx";
import LocationMap from "../components/LocationMap.jsx";
import SectionHeading from "../components/SectionHeading.jsx";
import { LoadingSpinner, ErrorMessage } from "../components/LoadingAndErrorStates.jsx";

import { publicApi } from "../api/apiClient.js";
import { useApiData } from "../hooks/useApiData.js";
import { useShortlist } from "../context/ShortlistContext.jsx";
import { useEnquiryModal } from "../context/EnquiryModalContext.jsx";
import { formatIndianPrice, formatLocation } from "../utils/formatters.js";

export default function PropertyDetailPage() {
  const { slug } = useParams();
  const { data, isLoading, errorMessage, reload } = useApiData(() => publicApi.getPropertyBySlug(slug), [slug]);

  if (isLoading) {
    return (
      <div className="container section">
        <LoadingSpinner label="Loading property…" />
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="container section">
        <ErrorMessage message={errorMessage} onRetry={reload} />
        <p className="center-text">
          <Link to="/properties" className="text-link">
            ← Back to all communities
          </Link>
        </p>
      </div>
    );
  }

  // "key" resets the gallery when moving between properties
  return <PropertyDetails key={data.property._id} property={data.property} similarProperties={data.similarProperties} />;
}

/** The actual page content, shown once the property has loaded. */
function PropertyDetails({ property, similarProperties }) {
  const { isShortlisted, toggleShortlist } = useShortlist();
  const { openEnquiryModal } = useEnquiryModal();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [shareMessage, setShareMessage] = useState("");

  const isInShortlist = isShortlisted(property._id);
  const isComingSoon = property.status === "Coming Soon";
  const isSoldOut = property.status === "Sold Out";
  const propertyImages = property.images.length > 0 ? property.images : [""];

  /** Uses the phone's share sheet if available, otherwise copies the link. */
  async function shareProperty() {
    const shareDetails = { title: property.title, text: property.tagline, url: window.location.href };
    try {
      if (navigator.share) {
        await navigator.share(shareDetails);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShareMessage("Link copied!");
        window.setTimeout(() => setShareMessage(""), 2500);
      }
    } catch (error) {
      /* the visitor closed the share sheet – nothing to do */
    }
  }

  // The list of key facts, skipping any the admin left empty
  const keyFacts = [
    { iconName: "home", label: "Configuration", value: property.configuration || property.propertyType },
    { iconName: "ruler", label: "Sizes", value: property.sizeRange },
    { iconName: "layers", label: "Land area", value: property.landArea },
    { iconName: "grid", label: "Total units", value: property.totalUnits ? String(property.totalUnits) : "" },
    { iconName: "calendar", label: "Possession", value: property.possession },
    { iconName: "shield", label: "MahaRERA", value: property.reraNumber },
  ].filter((fact) => fact.value);

  return (
    <>
      {/* ---------- Gallery ---------- */}
      <section className="gallery container">
        <div className="gallery__main">
          <PropertyImage
            imagePath={propertyImages[activeImageIndex]}
            altText={`${property.title} – photo ${activeImageIndex + 1}`}
            loading="eager"
          />
          <StatusTag status={property.status} />
        </div>
        {propertyImages.length > 1 && (
          <div className="gallery__thumbnails">
            {propertyImages.map((imagePath, index) => (
              <button
                type="button"
                key={imagePath + index}
                className={`gallery__thumbnail ${index === activeImageIndex ? "gallery__thumbnail--active" : ""}`}
                onClick={() => setActiveImageIndex(index)}
                aria-label={`Show photo ${index + 1}`}
              >
                <PropertyImage imagePath={imagePath} altText="" />
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="section section--compact">
        <div className="container detail-layout">
          {/* ---------- Main column ---------- */}
          <div className="detail-layout__main">
            <Link to="/properties" className="text-link text-link--muted">
              <Icon name="arrowLeft" size={16} /> All communities
            </Link>

            <div className="detail-header">
              <div>
                <p className="detail-header__location">
                  <Icon name="mapPin" size={16} /> {formatLocation(property.location)}, {property.location.state}
                </p>
                <h1 className="detail-header__title">{property.title}</h1>
                {property.tagline && <p className="detail-header__tagline">{property.tagline}</p>}
              </div>
              <div className="detail-header__actions">
                <button
                  type="button"
                  className={`icon-button ${isInShortlist ? "icon-button--active" : ""}`}
                  onClick={() => toggleShortlist(property._id)}
                  aria-pressed={isInShortlist}
                  aria-label={isInShortlist ? "Remove from shortlist" : "Add to shortlist"}
                >
                  <Icon name="heart" filled={isInShortlist} />
                </button>
                <button type="button" className="icon-button" onClick={shareProperty} aria-label="Share this property">
                  <Icon name="external" />
                </button>
                {shareMessage && <span className="detail-header__share-message">{shareMessage}</span>}
              </div>
            </div>

            <div className="detail-price">
              <span>{property.startingPrice ? "Starting from" : "Pricing"}</span>
              <strong>{formatIndianPrice(property.startingPrice)}</strong>
              {property.startingPrice > 0 && <small>+ government charges</small>}
            </div>

            <dl className="fact-grid">
              {keyFacts.map((fact) => (
                <div className="fact-grid__item" key={fact.label}>
                  <Icon name={fact.iconName} size={20} />
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>

            <div className="detail-block">
              <h2>About {property.title}</h2>
              {/* Each line break in the description becomes a new paragraph */}
              {property.description
                .split(/\n+/)
                .filter((paragraph) => paragraph.trim())
                .map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            {property.highlights.length > 0 && (
              <div className="detail-block">
                <h2>Why buyers choose it</h2>
                <ul className="check-list check-list--columns">
                  {property.highlights.map((highlight) => (
                    <li key={highlight}>
                      <Icon name="check" size={18} /> {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {property.amenities.length > 0 && (
              <div className="detail-block">
                <h2>Amenities</h2>
                <ul className="amenity-list">
                  {property.amenities.map((amenity) => (
                    <li key={amenity}>
                      <Icon name="sparkle" size={16} /> {amenity}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {!isSoldOut && (
              <div className="detail-block">
                <h2>Plan your finances</h2>
                <p className="muted-text">Move the sliders to estimate your monthly home-loan payment.</p>
                <EmiCalculator propertyPrice={property.startingPrice} />
              </div>
            )}

            {property.location.latitude && (
              <div className="detail-block">
                <h2>Location</h2>
                <LocationMap
                  latitude={property.location.latitude}
                  longitude={property.location.longitude}
                  title={`Map showing ${property.title}`}
                />
              </div>
            )}
          </div>

          {/* ---------- Sticky enquiry sidebar ---------- */}
          <aside className="detail-layout__sidebar">
            <div className="card card--raised sticky-card">
              {isSoldOut ? (
                <>
                  <h3 className="card__title">This community is sold out</h3>
                  <p className="card__subtitle">
                    Tell us what you liked about it and we'll let you know about similar homes, including resales.
                  </p>
                  <EnquiryForm enquiryType="General" property={property} compact submitLabel="Notify me" />
                </>
              ) : isComingSoon ? (
                <>
                  <h3 className="card__title">Launching soon</h3>
                  <p className="card__subtitle">Register now to get the layout plan and launch pricing first.</p>
                  <EnquiryForm enquiryType="Register Interest" property={property} compact />
                </>
              ) : (
                <>
                  <h3 className="card__title">Visit {property.title}</h3>
                  <p className="card__subtitle">Pick a date — we'll arrange everything else.</p>
                  <EnquiryForm enquiryType="Site Visit" property={property} compact />
                  <button
                    type="button"
                    className="button button--ghost button--full sticky-card__secondary"
                    onClick={() => openEnquiryModal({ enquiryType: "Brochure Request", property })}
                  >
                    <Icon name="download" size={16} /> Get the brochure
                  </button>
                </>
              )}
            </div>
          </aside>
        </div>
      </section>

      {/* ---------- Similar properties ---------- */}
      {similarProperties.length > 0 && (
        <section className="section section--tinted">
          <div className="container">
            <SectionHeading eyebrow="You may also like" title="Similar communities" />
            <div className="property-grid">
              {similarProperties.map((similarProperty) => (
                <PropertyCard key={similarProperty._id} property={similarProperty} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
