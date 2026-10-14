/**
 * ContactPage.jsx
 * ---------------
 * Office details, a map and the full enquiry form.
 */

import Icon from "../components/Icon.jsx";
import EnquiryForm from "../components/EnquiryForm.jsx";
import LocationMap from "../components/LocationMap.jsx";
import { COMPANY_DETAILS } from "../data/siteContent.js";

export default function ContactPage() {
  return (
    <>
      <section className="page-banner">
        <div className="container">
          <span className="eyebrow">Contact</span>
          <h1>Let's talk about your next home</h1>
          <p>Call, write, or drop by our office. We usually reply within a few hours.</p>
        </div>
      </section>

      <section className="section section--compact">
        <div className="container contact-layout">
          <div className="contact-layout__details">
            <ContactDetail iconName="phone" title="Call us" link={`tel:${COMPANY_DETAILS.phoneLink}`}>
              {COMPANY_DETAILS.phoneDisplay}
            </ContactDetail>
            <ContactDetail iconName="mail" title="Email" link={`mailto:${COMPANY_DETAILS.email}`}>
              {COMPANY_DETAILS.email}
            </ContactDetail>
            <ContactDetail iconName="chat" title="WhatsApp" link={`https://wa.me/${COMPANY_DETAILS.whatsappNumber}`}>
              Chat with a relationship manager
            </ContactDetail>
            <ContactDetail iconName="mapPin" title="Visit our office">
              {COMPANY_DETAILS.address}
            </ContactDetail>
            <ContactDetail iconName="clock" title="Office hours">
              {COMPANY_DETAILS.officeHours}
            </ContactDetail>

            <LocationMap
              latitude={COMPANY_DETAILS.officeLatitude}
              longitude={COMPANY_DETAILS.officeLongitude}
              title="Map showing the Villament office"
            />
          </div>

          <div className="card card--raised">
            <h2 className="card__title">Send us a message</h2>
            <p className="card__subtitle">Choose what you'd like help with.</p>
            <EnquiryForm enquiryType="General" allowTypeChoice />
          </div>
        </div>
      </section>
    </>
  );
}

/** One row of contact information with an icon. */
function ContactDetail({ iconName, title, link, children }) {
  const content = (
    <>
      <span className="contact-detail__icon">
        <Icon name={iconName} size={20} />
      </span>
      <span>
        <strong>{title}</strong>
        <span>{children}</span>
      </span>
    </>
  );

  return link ? (
    <a className="contact-detail" href={link} target={link.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
      {content}
    </a>
  ) : (
    <div className="contact-detail">{content}</div>
  );
}
