/**
 * EnquiryModal.jsx
 * ----------------
 * The pop-up version of the enquiry form. It is opened from anywhere using
 * openEnquiryModal() (see context/EnquiryModalContext.jsx).
 *
 * Accessibility: closes with the Escape key or by clicking the dark backdrop,
 * and prevents the page behind from scrolling while open.
 */

import { useEffect } from "react";
import { useEnquiryModal } from "../context/EnquiryModalContext.jsx";
import EnquiryForm from "./EnquiryForm.jsx";
import Icon from "./Icon.jsx";

const MODAL_HEADINGS = {
  "Site Visit": "Plan a site visit",
  "Register Interest": "Be first to know",
  "Brochure Request": "Get the brochure",
  General: "Talk to our team",
};

export default function EnquiryModal() {
  const { modalSettings, isModalOpen, closeEnquiryModal } = useEnquiryModal();

  // Close on Escape and lock background scrolling while the modal is open
  useEffect(() => {
    if (!isModalOpen) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") closeEnquiryModal();
    }
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isModalOpen, closeEnquiryModal]);

  if (!isModalOpen) {
    return null;
  }

  const { enquiryType, property, heading } = modalSettings;
  const modalHeading = heading || MODAL_HEADINGS[enquiryType] || "Talk to our team";

  return (
    <div className="modal-backdrop" onMouseDown={closeEnquiryModal}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="enquiry-modal-heading"
        // Stop clicks inside the white box from closing the modal
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button type="button" className="modal__close" onClick={closeEnquiryModal} aria-label="Close">
          <Icon name="close" size={22} />
        </button>
        <span className="eyebrow">Villament</span>
        <h2 id="enquiry-modal-heading" className="modal__heading">
          {modalHeading}
        </h2>
        <p className="modal__subheading">
          Leave your details and a relationship manager will call you within one working day.
        </p>
        <EnquiryForm
          // "key" makes React start a fresh form when a different property is chosen
          key={`${enquiryType}-${property?._id || "none"}`}
          enquiryType={enquiryType}
          property={property}
          allowTypeChoice={enquiryType !== "Register Interest"}
          compact
        />
      </div>
    </div>
  );
}
