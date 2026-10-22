/**
 * HomePage.jsx
 * ------------
 * The landing page. Sections from top to bottom:
 *   1. Hero with headline and property search
 *   2. Company numbers
 *   3. Short introduction
 *   4. Featured communities (loaded from the API)
 *   5. "The Villament way" – four promises
 *   6. Upcoming launch call-out (register interest)
 *   7. Buyer testimonials
 *   8. FAQs next to a contact form
 */

import { Link } from "react-router-dom";

import Icon from "../components/Icon.jsx";
import HeroSearch from "../components/HeroSearch.jsx";
import PropertyCard from "../components/PropertyCard.jsx";
import PropertyImage from "../components/PropertyImage.jsx";
import SectionHeading from "../components/SectionHeading.jsx";
import TestimonialsSlider from "../components/TestimonialsSlider.jsx";
import FaqAccordion from "../components/FaqAccordion.jsx";
import EnquiryForm from "../components/EnquiryForm.jsx";
import { PropertyCardSkeletons, ErrorMessage } from "../components/LoadingAndErrorStates.jsx";

import { publicApi } from "../api/apiClient.js";
import { useApiData } from "../hooks/useApiData.js";
import { useEnquiryModal } from "../context/EnquiryModalContext.jsx";
import { BRAND_PILLARS, COMPANY_STATS, FREQUENTLY_ASKED_QUESTIONS } from "../data/siteContent.js";
import { formatLocation } from "../utils/formatters.js";

const HERO_IMAGE_ADDRESS =
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=80";

export default function HomePage() {
  const { openEnquiryModal } = useEnquiryModal();

  const {
    data: featuredData,
    isLoading: isLoadingFeatured,
    errorMessage: featuredError,
    reload: reloadFeatured,
  } = useApiData(() => publicApi.getProperties({ featured: "true", limit: 6 }), []);

  const { data: upcomingData } = useApiData(() => publicApi.getProperties({ status: "Coming Soon", limit: 1 }), []);

  const featuredProperties = featuredData?.properties || [];
  const upcomingProperty = upcomingData?.properties?.[0];

  return (
    <>
      {/* ---------- 1. Hero ---------- */}
      <section className="hero" style={{ "--hero-image": `url(${HERO_IMAGE_ADDRESS})` }}>
        <div className="container hero__content">
          <span className="eyebrow eyebrow--light">Villa communities across Mumbai </span>
          <h1 className="hero__title">
            Homes that
            <br />
            put down <em>roots.</em>
          </h1>
          <p className="hero__subtitle">
            Courtyard villas, villa plots and managed farmhouses — planned around the land, built to be handed down.
          </p>
          <HeroSearch />
        </div>
      </section>

      {/* ---------- 2. Numbers ---------- */}
      <section className="stats-band">
        <div className="container stats-band__grid">
          {COMPANY_STATS.map((statistic) => (
            <div className="stats-band__item" key={statistic.label}>
              <strong>{statistic.value}</strong>
              <span>{statistic.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- 3. Introduction ---------- */}
      <section className="section">
        <div className="container intro-split">
          <h2 className="intro-split__statement">
            We don't sell square feet. We plan places where families gather, children roam, and trees outlive us all.
          </h2>
          <div className="intro-split__text">
            <p>
              Every Villament community begins with a long walk across the land. We keep the old trees, follow the
              natural slope and leave most of the site open — then design homes that let in the light, the breeze and
              the monsoon.
            </p>
            <Link to="/about" className="text-link">
              Read our story <Icon name="arrowRight" size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- 4. Featured communities ---------- */}
      <section className="section section--tinted">
        <div className="container">
          <div className="section-row">
            <SectionHeading
              eyebrow="Our communities"
              title="Places to begin your next chapter"
              description="Hand-picked projects that are selling now or launching soon."
            />
            <Link to="/properties" className="button button--ghost">
              View all communities <Icon name="arrowRight" size={16} />
            </Link>
          </div>

          {featuredError ? (
            <ErrorMessage message={featuredError} onRetry={reloadFeatured} />
          ) : (
            <div className="property-grid">
              {isLoadingFeatured ? (
                <PropertyCardSkeletons count={3} />
              ) : (
                featuredProperties.map((property) => <PropertyCard key={property._id} property={property} />)
              )}
            </div>
          )}
        </div>
      </section>

      {/* ---------- 5. The Villament way ---------- */}
      <section className="section section--forest">
        <div className="container">
          <SectionHeading
            eyebrow="The Villament way"
            title="Four promises we build into every home"
            tone="light"
          />
          <div className="pillars">
            {BRAND_PILLARS.map((pillar, index) => (
              <article className="pillar" key={pillar.title}>
                <span className="pillar__number">0{index + 1}</span>
                <Icon name={pillar.iconName} size={28} />
                <h3>{pillar.title}</h3>
                <p>{pillar.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- 6. Upcoming launch ---------- */}
      {upcomingProperty && (
        <section className="section">
          <div className="container launch-callout">
            <div className="launch-callout__media">
              <PropertyImage imagePath={upcomingProperty.images?.[0]} altText={upcomingProperty.title} />
            </div>
            <div className="launch-callout__text">
              <span className="eyebrow">Launching soon</span>
              <h2>{upcomingProperty.title}</h2>
              <p className="launch-callout__location">
                <Icon name="mapPin" size={16} /> {formatLocation(upcomingProperty.location)}
              </p>
              <p>{upcomingProperty.tagline}</p>
              <ul className="check-list">
                {upcomingProperty.highlights.slice(0, 3).map((highlight) => (
                  <li key={highlight}>
                    <Icon name="check" size={18} /> {highlight}
                  </li>
                ))}
              </ul>
              <div className="button-row">
                <button
                  type="button"
                  className="button button--clay"
                  onClick={() => openEnquiryModal({ enquiryType: "Register Interest", property: upcomingProperty })}
                >
                  Register interest
                </button>
                <Link to={`/properties/${upcomingProperty.slug}`} className="button button--ghost">
                  See details
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ---------- 7. Testimonials ---------- */}
      <section className="section section--tinted">
        <div className="container">
          <SectionHeading eyebrow="In their words" title="What homeowners tell us" align="center" />
          <TestimonialsSlider />
        </div>
      </section>

      {/* ---------- 8. FAQ + enquiry form ---------- */}
      <section className="section">
        <div className="container faq-contact">
          <div>
            <SectionHeading eyebrow="Good to know" title="Questions buyers often ask" />
            <FaqAccordion questions={FREQUENTLY_ASKED_QUESTIONS} />
          </div>
          <div className="card card--raised">
            <h3 className="card__title">Still deciding? Talk to us.</h3>
            <p className="card__subtitle">A relationship manager will call you back within one working day.</p>
            <EnquiryForm enquiryType="Site Visit" allowTypeChoice compact />
          </div>
        </div>
      </section>
    </>
  );
}
