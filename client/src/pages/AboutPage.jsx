/**
 * AboutPage.jsx
 * -------------
 * The company story, values and the four-step buying journey.
 */

import Icon from "../components/Icon.jsx";
import SectionHeading from "../components/SectionHeading.jsx";
import { useEnquiryModal } from "../context/EnquiryModalContext.jsx";
import { BRAND_PILLARS, BUYING_JOURNEY, COMPANY_STATS } from "../data/siteContent.js";

export default function AboutPage() {
  const { openEnquiryModal } = useEnquiryModal();

  return (
    <>
      <section className="page-banner page-banner--large">
        <div className="container">
          <span className="eyebrow">Our story</span>
          <h1>Building slowly, for the people who come after us.</h1>
          <p>
            Villament began with one question from our founders' grandparents: "Will this house still feel right in
            fifty years?" Everything we design is an attempt to answer yes.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container intro-split">
          <div>
            <SectionHeading eyebrow="What we believe" title="A home is a place, not a product" />
          </div>
          <div className="intro-split__text">
            <p>
              Most developments start with how many units can fit on a plot. We start with what the land already does
              well — the shade of an old mango tree, the way water runs off a slope, the view from the highest point —
              and plan around it.
            </p>
            <p>
              We work with local stone, lime and timber, with architects who live in the regions we build in, and with
              craftspeople whose families have built there for generations. The result is slower to build, but it ages
              beautifully.
            </p>
          </div>
        </div>
      </section>

      <section className="stats-band stats-band--light">
        <div className="container stats-band__grid">
          {COMPANY_STATS.map((statistic) => (
            <div className="stats-band__item" key={statistic.label}>
              <strong>{statistic.value}</strong>
              <span>{statistic.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading eyebrow="Our promises" title="What you can hold us to" />
          <div className="pillars pillars--light">
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

      <section className="section section--tinted">
        <div className="container">
          <SectionHeading
            eyebrow="Buying with Villament"
            title="Four unhurried steps"
            description="No pressure, no countdown timers. Take the time a decision like this deserves."
          />
          <ol className="journey">
            {BUYING_JOURNEY.map((journeyStep, index) => (
              <li className="journey__step" key={journeyStep.title}>
                <span className="journey__number">{index + 1}</span>
                <h3>{journeyStep.title}</h3>
                <p>{journeyStep.description}</p>
              </li>
            ))}
          </ol>
          <div className="center-text">
            <button type="button" className="button button--clay" onClick={() => openEnquiryModal({ enquiryType: "Site Visit" })}>
              Start with a conversation
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
