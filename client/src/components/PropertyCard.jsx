/**
 * PropertyCard.jsx
 * ----------------
 * A preview card for one property, used on the home page and the listing page.
 * Shows the photo, status, location, key facts, price and a shortlist heart.
 */

import { Link } from "react-router-dom";

import Icon from "./Icon.jsx";
import PropertyImage from "./PropertyImage.jsx";
import StatusTag from "./StatusTag.jsx";
import { useShortlist } from "../context/ShortlistContext.jsx";
import { formatIndianPrice, formatLocation } from "../utils/formatters.js";

export default function PropertyCard({ property }) {
  const { isShortlisted, toggleShortlist } = useShortlist();
  const isInShortlist = isShortlisted(property._id);
  const propertyPageAddress = `/properties/${property.slug}`;

  return (
    <article className="property-card">
      <div className="property-card__media">
        <Link to={propertyPageAddress} tabIndex={-1} aria-hidden="true">
          <PropertyImage imagePath={property.images?.[0]} altText={property.title} />
        </Link>
        <StatusTag status={property.status} />
        <button
          type="button"
          className={`property-card__heart ${isInShortlist ? "property-card__heart--active" : ""}`}
          onClick={() => toggleShortlist(property._id)}
          aria-pressed={isInShortlist}
          aria-label={isInShortlist ? `Remove ${property.title} from shortlist` : `Add ${property.title} to shortlist`}
        >
          <Icon name="heart" size={20} filled={isInShortlist} />
        </button>
      </div>

      <div className="property-card__body">
        <p className="property-card__location">
          <Icon name="mapPin" size={15} /> {formatLocation(property.location)}
        </p>
        <h3 className="property-card__title">
          <Link to={propertyPageAddress}>{property.title}</Link>
        </h3>
        {property.tagline && <p className="property-card__tagline">{property.tagline}</p>}

        <ul className="property-card__facts">
          <li>
            <Icon name="home" size={15} /> {property.configuration || property.propertyType}
          </li>
          {property.sizeRange && (
            <li>
              <Icon name="ruler" size={15} /> {property.sizeRange}
            </li>
          )}
        </ul>

        <div className="property-card__footer">
          <div>
            <span className="property-card__price-label">{property.startingPrice ? "Starting from" : "Pricing"}</span>
            <strong className="property-card__price">{formatIndianPrice(property.startingPrice)}</strong>
          </div>
          <Link to={propertyPageAddress} className="text-link">
            View <Icon name="arrowRight" size={16} />
          </Link>
        </div>
      </div>
    </article>
  );
}
