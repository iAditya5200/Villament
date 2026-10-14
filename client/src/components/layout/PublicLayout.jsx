/**
 * PublicLayout.jsx
 * ----------------
 * The frame shared by every public page: header on top, footer at the bottom,
 * the page itself in between (<Outlet />), plus the pop-up enquiry form and
 * the floating contact buttons.
 */

import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

import SiteHeader from "./SiteHeader.jsx";
import SiteFooter from "./SiteFooter.jsx";
import EnquiryModal from "../EnquiryModal.jsx";
import FloatingContactButtons from "../FloatingContactButtons.jsx";

export default function PublicLayout() {
  const { pathname } = useLocation();

  // When the visitor moves to a new page, start at the top of that page
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return (
    <div className={`site ${pathname === "/" ? "site--home" : ""}`}>
      <SiteHeader />
      <main className="site__main">
        <Outlet />
      </main>
      <SiteFooter />
      <EnquiryModal />
      <FloatingContactButtons />
    </div>
  );
}
