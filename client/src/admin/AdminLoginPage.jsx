/**
 * AdminLoginPage.jsx
 * ------------------
 * Email + password login for the admin panel.
 * The first admin account is created by running "npm run seed" in /server.
 */

import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import BrandLogo from "../components/BrandLogo.jsx";
import { useAdminAuth } from "../context/AdminAuthContext.jsx";

export default function AdminLoginPage() {
  const { login, isLoggedIn } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Where to go after logging in (the page they originally asked for)
  const returnToAddress = location.state?.returnTo || "/admin";

  if (isLoggedIn) {
    return <Navigate to={returnToAddress} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate(returnToAddress, { replace: true });
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="admin-login">
      <div className="admin-login__panel">
        <BrandLogo linkTo="/" />
        <h1>Admin sign in</h1>
        <p className="muted-text">Manage properties and follow up on leads.</p>

        <form onSubmit={handleSubmit} className="admin-login__form">
          <label className="form-field">
            <span className="form-field__label">Email</span>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" required />
          </label>
          <label className="form-field">
            <span className="form-field__label">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          {errorMessage && <p className="form-error">{errorMessage}</p>}

          <button type="submit" className="button button--forest button--full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <Link to="/" className="text-link text-link--muted">
          ← Back to website
        </Link>
      </div>
    </div>
  );
}
