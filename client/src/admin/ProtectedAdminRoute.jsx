/**
 * ProtectedAdminRoute.jsx
 * -----------------------
 * Wraps admin pages. If nobody is logged in, the visitor is sent to the login
 * page (and brought back to the page they wanted after logging in).
 */

import { Navigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext.jsx";
import { LoadingSpinner } from "../components/LoadingAndErrorStates.jsx";

export default function ProtectedAdminRoute({ children }) {
  const { isLoggedIn, isCheckingSession } = useAdminAuth();
  const location = useLocation();

  // Wait until we know whether the saved login is still valid
  if (isCheckingSession) {
    return (
      <div className="admin-fullscreen-center">
        <LoadingSpinner label="Checking your session…" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/admin/login" replace state={{ returnTo: location.pathname + location.search }} />;
  }

  return children;
}
