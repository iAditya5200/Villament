/**
 * EnquiryModalContext.jsx
 * -----------------------
 * Any button on the website ("Book a Site Visit", "Register Interest",
 * "Get Brochure"...) can open the same pop-up enquiry form by calling
 * openEnquiryModal(). The modal itself is rendered once, in PublicLayout.
 *
 * Usage:
 *     const { openEnquiryModal } = useEnquiryModal();
 *     openEnquiryModal({ enquiryType: "Site Visit", property });
 */

import { createContext, useCallback, useContext, useMemo, useState } from "react";

const EnquiryModalContext = createContext(null);

export function EnquiryModalProvider({ children }) {
  // null when closed; otherwise the settings for the form inside the modal
  const [modalSettings, setModalSettings] = useState(null);

  /**
   * @param {object} settings
   * @param {string} [settings.enquiryType="Site Visit"]
   * @param {object} [settings.property] - the property the visitor is asking about
   * @param {string} [settings.heading]   - custom title for the modal
   */
  const openEnquiryModal = useCallback((settings = {}) => {
    setModalSettings({ enquiryType: "Site Visit", ...settings });
  }, []);

  const closeEnquiryModal = useCallback(() => setModalSettings(null), []);

  const contextValue = useMemo(
    () => ({ modalSettings, isModalOpen: modalSettings !== null, openEnquiryModal, closeEnquiryModal }),
    [modalSettings, openEnquiryModal, closeEnquiryModal]
  );

  return <EnquiryModalContext.Provider value={contextValue}>{children}</EnquiryModalContext.Provider>;
}

export function useEnquiryModal() {
  const contextValue = useContext(EnquiryModalContext);
  if (!contextValue) {
    throw new Error("useEnquiryModal must be used inside <EnquiryModalProvider>.");
  }
  return contextValue;
}
