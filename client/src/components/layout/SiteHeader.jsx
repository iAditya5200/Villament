/**
 * SiteHeader.jsx
 * --------------
 * The top navigation bar.
 *  • On the home page it starts transparent over the hero image and turns
 *    solid once the visitor scrolls down.
 *  • On small screens the links collapse into a "menu" button.
 *  • Shows how many properties the visitor has shortlisted.
 */

import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

import BrandLogo from "../BrandLogo.jsx";
import Icon from "../Icon.jsx";
import { useShortlist } from "../../context/ShortlistContext.jsx";
import { useEnquiryModal } from "../../context/EnquiryModalContext.jsx";

const NAVIGATION_LINKS = [
  { label: "Communities", path: "/properties" },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
];

const SCROLL_DISTANCE_BEFORE_SOLID_HEADER = 40; // pixels

export default function SiteHeader() {
  const { pathname } = useLocation();
  const { shortlistedIds } = useShortlist();
  const { openEnquiryModal } = useEnquiryModal();

  const [hasScrolled, setHasScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isHomePage = pathname === "/";
  const isTransparent = isHomePage && !hasScrolled && !isMobileMenuOpen;

  // Watch the scroll position to switch between transparent and solid header
  useEffect(() => {
    function handleScroll() {
      setHasScrolled(window.scrollY > SCROLL_DISTANCE_BEFORE_SOLID_HEADER);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close the mobile menu after navigating to another page
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className={`site-header ${isTransparent ? "site-header--transparent" : "site-header--solid"}`}>
      <div className="container site-header__inner">
        <BrandLogo tone={isTransparent ? "light" : "dark"} />

        <nav
          className={`site-header__nav ${isMobileMenuOpen ? "site-header__nav--open" : ""}`}
          aria-label="Main navigation"
        >
          {NAVIGATION_LINKS.map((navigationLink) => (
            <NavLink
              key={navigationLink.path}
              to={navigationLink.path}
              className={({ isActive }) => `site-header__link ${isActive ? "site-header__link--active" : ""}`}
            >
              {navigationLink.label}
            </NavLink>
          ))}

          <Link to="/properties?shortlist=true" className="site-header__link site-header__shortlist">
            <Icon name="heart" size={18} />
            Shortlist
            {shortlistedIds.length > 0 && <span className="site-header__badge">{shortlistedIds.length}</span>}
          </Link>

          <button
            type="button"
            className="button button--clay site-header__cta"
            onClick={() => openEnquiryModal({ enquiryType: "Site Visit", heading: "Plan a site visit" })}
          >
            Book a Visit
          </button>
        </nav>

        <button
          type="button"
          className="site-header__menu-button"
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
          onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
        >
          <Icon name={isMobileMenuOpen ? "close" : "menu"} size={26} />
        </button>
      </div>
    </header>
  );
}
