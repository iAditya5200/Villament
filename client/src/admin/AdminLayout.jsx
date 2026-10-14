/**
 * AdminLayout.jsx
 * ---------------
 * The frame around every admin page: a sidebar with navigation on the left,
 * and the current page (<Outlet />) on the right.
 */

import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import BrandLogo from "../components/BrandLogo.jsx";
import Icon from "../components/Icon.jsx";
import { useAdminAuth } from "../context/AdminAuthContext.jsx";

const ADMIN_NAVIGATION = [
  { label: "Dashboard", path: "/admin", iconName: "grid", isExactMatch: true },
  { label: "Properties", path: "/admin/properties", iconName: "home" },
  { label: "Leads", path: "/admin/enquiries", iconName: "users" },
];

export default function AdminLayout() {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/admin/login");
  }

  return (
    <div className="admin">
      <aside className={`admin-sidebar ${isSidebarOpen ? "admin-sidebar--open" : ""}`}>
        <div className="admin-sidebar__brand">
          <BrandLogo tone="light" linkTo="/admin" />
          <span className="admin-sidebar__tag">Admin</span>
        </div>

        <nav className="admin-sidebar__nav" aria-label="Admin navigation">
          {ADMIN_NAVIGATION.map((navigationItem) => (
            <NavLink
              key={navigationItem.path}
              to={navigationItem.path}
              end={navigationItem.isExactMatch}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) => `admin-sidebar__link ${isActive ? "admin-sidebar__link--active" : ""}`}
            >
              <Icon name={navigationItem.iconName} size={19} />
              {navigationItem.label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <a href="/" target="_blank" rel="noreferrer" className="admin-sidebar__link">
            <Icon name="external" size={19} /> View website
          </a>
          <div className="admin-sidebar__user">
            <span className="admin-sidebar__avatar">{admin?.name?.charAt(0) || "A"}</span>
            <span>
              <strong>{admin?.name}</strong>
              <small>{admin?.email}</small>
            </span>
          </div>
          <button type="button" className="admin-sidebar__link admin-sidebar__logout" onClick={handleLogout}>
            <Icon name="logout" size={19} /> Log out
          </button>
        </div>
      </aside>

      {/* Dark overlay behind the sidebar on small screens */}
      {isSidebarOpen && <div className="admin-sidebar__overlay" onClick={() => setIsSidebarOpen(false)} />}

      <div className="admin-main">
        <div className="admin-mobile-bar">
          <button type="button" className="icon-button" onClick={() => setIsSidebarOpen(true)} aria-label="Open menu">
            <Icon name="menu" />
          </button>
          <BrandLogo linkTo="/admin" />
        </div>
        <Outlet />
      </div>
    </div>
  );
}
