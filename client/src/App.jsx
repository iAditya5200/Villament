/**
 * App.jsx
 * -------
 * Lists every page of the website and the admin panel, and wraps them in the
 * shared "providers" (admin login, shortlist, enquiry pop-up).
 *
 * Public website                    Admin panel
 * ---------------------------       ------------------------------------
 * /                  Home           /admin/login           Login
 * /properties        All projects   /admin                 Dashboard
 * /properties/:slug  One project    /admin/properties      Manage properties
 * /about             About us       /admin/properties/new  Add property
 * /contact           Contact        /admin/properties/:id  Edit property
 *                                   /admin/enquiries       Leads & tracking
 */

import { Route, Routes } from "react-router-dom";

import { AdminAuthProvider } from "./context/AdminAuthContext.jsx";
import { ShortlistProvider } from "./context/ShortlistContext.jsx";
import { EnquiryModalProvider } from "./context/EnquiryModalContext.jsx";

import PublicLayout from "./components/layout/PublicLayout.jsx";
import HomePage from "./pages/HomePage.jsx";
import PropertiesPage from "./pages/PropertiesPage.jsx";
import PropertyDetailPage from "./pages/PropertyDetailPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

import ProtectedAdminRoute from "./admin/ProtectedAdminRoute.jsx";
import AdminLayout from "./admin/AdminLayout.jsx";
import AdminLoginPage from "./admin/AdminLoginPage.jsx";
import AdminDashboardPage from "./admin/AdminDashboardPage.jsx";
import AdminPropertiesPage from "./admin/AdminPropertiesPage.jsx";
import AdminPropertyFormPage from "./admin/AdminPropertyFormPage.jsx";
import AdminEnquiriesPage from "./admin/AdminEnquiriesPage.jsx";

export default function App() {
  return (
    <AdminAuthProvider>
      <ShortlistProvider>
        <EnquiryModalProvider>
          <Routes>
            {/* ---------- Public website (shares header + footer) ---------- */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/properties" element={<PropertiesPage />} />
              <Route path="/properties/:slug" element={<PropertyDetailPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* ---------- Admin panel ---------- */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedAdminRoute>
                  <AdminLayout />
                </ProtectedAdminRoute>
              }
            >
              <Route index element={<AdminDashboardPage />} />
              <Route path="properties" element={<AdminPropertiesPage />} />
              <Route path="properties/new" element={<AdminPropertyFormPage />} />
              <Route path="properties/:propertyId/edit" element={<AdminPropertyFormPage />} />
              <Route path="enquiries" element={<AdminEnquiriesPage />} />
            </Route>
          </Routes>
        </EnquiryModalProvider>
      </ShortlistProvider>
    </AdminAuthProvider>
  );
}
