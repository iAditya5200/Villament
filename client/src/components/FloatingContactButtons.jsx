/**
 * FloatingContactButtons.jsx
 * --------------------------
 * Quick ways to get in touch that stay on screen while scrolling:
 *  • a WhatsApp button (bottom-right, all screen sizes)
 *  • a "Call / Book a visit" bar along the bottom on mobile phones
 */

import Icon from "./Icon.jsx";
import { COMPANY_DETAILS } from "../data/siteContent.js";
import { useEnquiryModal } from "../context/EnquiryModalContext.jsx";

export default function FloatingContactButtons() {
  const { openEnquiryModal } = useEnquiryModal();

  const whatsappGreeting = encodeURIComponent("Hi Villament, I'd like to know more about your communities.");
  const whatsappLink = `https://wa.me/${COMPANY_DETAILS.whatsappNumber}?text=${whatsappGreeting}`;

  return (
    <>
      <a className="floating-whatsapp" href={whatsappLink} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp">
        <Icon name="chat" size={26} />
      </a>

      <div className="mobile-action-bar">
        <a href={`tel:${COMPANY_DETAILS.phoneLink}`} className="mobile-action-bar__button">
          <Icon name="phone" size={18} /> Call
        </a>
        <button
          type="button"
          className="mobile-action-bar__button mobile-action-bar__button--primary"
          onClick={() => openEnquiryModal({ enquiryType: "Site Visit" })}
        >
          <Icon name="calendar" size={18} /> Book a visit
        </button>
      </div>
    </>
  );
}
