/**
 * EnquiryForm.jsx
 * ---------------
 * The one form used everywhere on the website to capture a lead:
 * the contact page, property pages, and the pop-up "Book a Visit" modal.
 *
 * Every submission is saved by the API as an Enquiry, which then appears
 * in the admin panel's lead tracker with the status "New".
 *
 * Props:
 *   enquiryType   – "General" | "Site Visit" | "Register Interest" | "Brochure Request"
 *   property      – the property being asked about (optional)
 *   allowTypeChoice – show a selector so the visitor can choose the type
 *   onSubmitted   – called after a successful submission
 *   submitLabel   – text on the button
 */

import { useState } from "react";
import { publicApi } from "../api/apiClient.js";
import Icon from "./Icon.jsx";

const ENQUIRY_TYPE_CHOICES = [
  { value: "Site Virtual Visit", label: "Book a virtual site visit" },
  // { value: "Brochure Request", label: "Get the brochure" },
  { value: "General", label: "Ask a question" },
];

const EMPTY_FORM = {
  fullName: "",
  email: "",
  phone: "",
  message: "",
  preferredVisitDate: "",
  website: "", // hidden "honeypot" field that only spam bots fill in
};

/** Returns tomorrow's date as YYYY-MM-DD, the earliest allowed visit date. */
function getTomorrowAsInputValue() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().slice(0, 10);
}

/**
 * Checks the form in the browser before sending it, so visitors get
 * instant feedback. The server checks again, because browsers can be bypassed.
 *
 * @returns {object} field name -> error message (empty object when valid)
 */
function validateEnquiryForm(formValues) {
  const fieldErrors = {};

  if (formValues.fullName.trim().length < 2) {
    fieldErrors.fullName = "Please tell us your name.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email.trim())) {
    fieldErrors.email = "Please enter a valid email address.";
  }
  const phoneDigitsOnly = formValues.phone.replace(/\D/g, "");
  if (phoneDigitsOnly.length < 10) {
    fieldErrors.phone = "Please enter a phone number with at least 10 digits.";
  }
  return fieldErrors;
}

export default function EnquiryForm({
  enquiryType: initialEnquiryType = "General",
  property = null,
  allowTypeChoice = false,
  onSubmitted,
  submitLabel,
  compact = false,
}) {
  const [formValues, setFormValues] = useState(EMPTY_FORM);
  const [chosenEnquiryType, setChosenEnquiryType] = useState(initialEnquiryType);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submissionState, setSubmissionState] = useState({ status: "idle", message: "" });

  const isSiteVisit = chosenEnquiryType === "Site Visit";

  /** Updates one field and clears its error message as the visitor types. */
  function updateField(event) {
    const { name, value } = event.target;
    setFormValues((previousValues) => ({ ...previousValues, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((previousErrors) => ({ ...previousErrors, [name]: "" }));
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationErrors = validateEnquiryForm(formValues);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setSubmissionState({ status: "sending", message: "" });

    try {
      const serverReply = await publicApi.submitEnquiry({
        ...formValues,
        enquiryType: chosenEnquiryType,
        propertyId: property?._id,
        preferredVisitDate: isSiteVisit ? formValues.preferredVisitDate : "",
        sourcePage: window.location.pathname,
      });

      setSubmissionState({ status: "success", message: serverReply.message });
      setFormValues(EMPTY_FORM);
      if (onSubmitted) onSubmitted();
    } catch (error) {
      setSubmissionState({ status: "error", message: error.message });
    }
  }

  // ---------- Thank-you message after a successful submission ----------
  if (submissionState.status === "success") {
    return (
      <div className="enquiry-form__success" role="status">
        <span className="enquiry-form__success-icon">
          <Icon name="check" size={28} />
        </span>
        <h3>Thank you — we've got your details.</h3>
        <p>{submissionState.message}</p>
        <button type="button" className="button button--ghost" onClick={() => setSubmissionState({ status: "idle", message: "" })}>
          Send another enquiry
        </button>
      </div>
    );
  }

  const defaultSubmitLabel = {
    "Site Visit": "Request a visit",
    "Brochure Request": "Send me the brochure",
    "Register Interest": "Register my interest",
    General: "Send message",
  }[chosenEnquiryType];

  // ---------- The form ----------
  return (
    <form className={`enquiry-form ${compact ? "enquiry-form--compact" : ""}`} onSubmit={handleSubmit} noValidate>
      {allowTypeChoice && (
        <div className="enquiry-form__types" role="radiogroup" aria-label="What would you like to do?">
          {ENQUIRY_TYPE_CHOICES.map((typeChoice) => (
            <button
              key={typeChoice.value}
              type="button"
              role="radio"
              aria-checked={chosenEnquiryType === typeChoice.value}
              className={`chip ${chosenEnquiryType === typeChoice.value ? "chip--active" : ""}`}
              onClick={() => setChosenEnquiryType(typeChoice.value)}
            >
              {typeChoice.label}
            </button>
          ))}
        </div>
      )}

      {property && (
        <p className="enquiry-form__property">
          <Icon name="home" size={16} />
          <span>
            Enquiring about <strong>{property.title}</strong>
          </span>
        </p>
      )}

      <div className="form-grid">
        <FormField label="Full name" error={fieldErrors.fullName}>
          <input name="fullName" value={formValues.fullName} onChange={updateField} autoComplete="name" />
        </FormField>

        <FormField label="Phone" error={fieldErrors.phone}>
          <input name="phone" type="tel" value={formValues.phone} onChange={updateField} autoComplete="tel" placeholder="+91" />
        </FormField>

        <FormField label="Email" error={fieldErrors.email} fullWidth={!isSiteVisit}>
          <input name="email" type="email" value={formValues.email} onChange={updateField} autoComplete="email" />
        </FormField>

        {isSiteVisit && (
          <FormField label="Preferred visit date">
            <input
              name="preferredVisitDate"
              type="date"
              min={getTomorrowAsInputValue()}
              value={formValues.preferredVisitDate}
              onChange={updateField}
            />
          </FormField>
        )}

        <FormField label="Message (optional)" fullWidth>
          <textarea
            name="message"
            rows={compact ? 2 : 4}
            value={formValues.message}
            onChange={updateField}
            placeholder="Tell us what you're looking for — size, budget, timeline…"
          />
        </FormField>
      </div>

      {/* Honeypot: hidden from people, visible to bots. See enquiryController.js */}
      <input
        className="visually-hidden"
        tabIndex={-1}
        autoComplete="off"
        name="website"
        value={formValues.website}
        onChange={updateField}
        aria-hidden="true"
      />

      {submissionState.status === "error" && <p className="form-error">{submissionState.message}</p>}

      <button type="submit" className="button button--clay button--full" disabled={submissionState.status === "sending"}>
        {submissionState.status === "sending" ? "Sending…" : submitLabel || defaultSubmitLabel}
      </button>
      <p className="enquiry-form__privacy">We'll only use your details to respond to this enquiry. No spam, ever.</p>
    </form>
  );
}

/** A label + input + error message, styled consistently. */
function FormField({ label, error, fullWidth = false, children }) {
  return (
    <label className={`form-field ${fullWidth ? "form-field--full" : ""} ${error ? "form-field--invalid" : ""}`}>
      <span className="form-field__label">{label}</span>
      {children}
      {error && <span className="form-field__error">{error}</span>}
    </label>
  );
}
