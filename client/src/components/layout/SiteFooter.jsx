/**
 * SiteFooter.jsx
 * --------------
 * Footer with a newsletter-style "stay in the loop" sign-up (saved as a
 * Register Interest enquiry), quick links and contact details.
 */

import { useState } from "react";
import { Link } from "react-router-dom";

import BrandLogo from "../BrandLogo.jsx";
import Icon from "../Icon.jsx";
import { publicApi } from "../../api/apiClient.js";
import { COMPANY_DETAILS } from "../../data/siteContent.js";

export default function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__top">
          <div className="site-footer__intro">
            <BrandLogo tone="light" />
            <p>
              Villa communities, plotted developments and managed farmhouses across Maharashtra — planned for the way
              you live today, and built to be handed down.
            </p>
            <FooterUpdatesSignup />
          </div>

          <div className="site-footer__columns">
            <div>
              <h4>Explore</h4>
              <Link to="/properties">All communities</Link>
              <Link to="/properties?status=Now%20Selling">Now selling</Link>
              <Link to="/properties?status=Coming%20Soon">Launching soon</Link>
              <Link to="/properties?shortlist=true">Your shortlist</Link>
            </div>
            <div>
              <h4>Company</h4>
              <Link to="/about">Our story</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/admin">Admin login</Link>
            </div>
            <div>
              <h4>Reach us</h4>
              <a href={`tel:${COMPANY_DETAILS.phoneLink}`}>
                <Icon name="phone" size={16} /> {COMPANY_DETAILS.phoneDisplay}
              </a>
              <a href={`mailto:${COMPANY_DETAILS.email}`}>
                <Icon name="mail" size={16} /> {COMPANY_DETAILS.email}
              </a>
              <span className="site-footer__address">
                <Icon name="mapPin" size={16} /> {COMPANY_DETAILS.address}
              </span>
            </div>
          </div>
        </div>

        <div className="site-footer__bottom">
          <span>© {currentYear} Villament Developers LLP. All rights reserved.</span>
          <span>
            All projects are registered under MahaRERA where applicable. Images are representative.
          </span>
        </div>
      </div>
    </footer>
  );
}

/**
 * A one-field form: visitors leave their email to hear about new launches.
 * Because our enquiry model requires a name and a phone number, this small
 * form asks for both in a compact way.
 */
function FooterUpdatesSignup() {
  const [formValues, setFormValues] = useState({ fullName: "", phone: "", email: "" });
  const [submissionState, setSubmissionState] = useState({ status: "idle", message: "" });

  function updateField(event) {
    setFormValues((previousValues) => ({ ...previousValues, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmissionState({ status: "sending", message: "" });
    try {
      await publicApi.submitEnquiry({
        ...formValues,
        enquiryType: "Register Interest",
        message: "Signed up for new launch updates from the website footer.",
        sourcePage: window.location.pathname,
      });
      setSubmissionState({ status: "success", message: "You're on the list. We'll write when something new launches." });
      setFormValues({ fullName: "", phone: "", email: "" });
    } catch (error) {
      setSubmissionState({ status: "error", message: error.message });
    }
  }

  if (submissionState.status === "success") {
    return <p className="site-footer__signup-success"><Icon name="check" size={18} /> {submissionState.message}</p>;
  }

  return (
    <form className="site-footer__signup" onSubmit={handleSubmit}>
      <span className="site-footer__signup-title">Hear about new launches first</span>
      <div className="site-footer__signup-fields">
        <input name="fullName" placeholder="Your name" required value={formValues.fullName} onChange={updateField} aria-label="Your name" />
        <input name="phone" placeholder="Phone" required value={formValues.phone} onChange={updateField} aria-label="Phone" />
        <input name="email" type="email" placeholder="Email" required value={formValues.email} onChange={updateField} aria-label="Email" />
        <button type="submit" className="button button--clay" disabled={submissionState.status === "sending"}>
          {submissionState.status === "sending" ? "Sending…" : "Notify me"}
        </button>
      </div>
      {submissionState.status === "error" && <p className="form-error">{submissionState.message}</p>}
    </form>
  );
}
