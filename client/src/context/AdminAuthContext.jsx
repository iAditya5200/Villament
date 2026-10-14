/**
 * AdminAuthContext.jsx
 * --------------------
 * Keeps track of whether an admin is logged in, and shares that information
 * with every admin page through React Context.
 *
 * Usage inside any component:
 *     const { admin, login, logout, isCheckingSession } = useAdminAuth();
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { adminApi, ADMIN_TOKEN_STORAGE_KEY, getSavedAdminToken } from "../api/apiClient.js";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  // While true, we are still checking whether a saved token is valid
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  /** Removes the token and forgets the admin. */
  const logout = useCallback(() => {
    try {
      window.localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
    } catch (error) {
      /* storage not available – nothing to remove */
    }
    setAdmin(null);
  }, []);

  /**
   * Logs in with email and password. Throws an Error with a readable message
   * if the details are wrong, so the login form can show it.
   */
  const login = useCallback(async (email, password) => {
    const { token, admin: loggedInAdmin } = await adminApi.login(email, password);
    try {
      window.localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token);
    } catch (error) {
      /* storage not available – the admin stays logged in until refresh */
    }
    setAdmin(loggedInAdmin);
    return loggedInAdmin;
  }, []);

  // On first load: if a token was saved earlier, ask the server who it belongs to
  useEffect(() => {
    async function restoreSavedSession() {
      if (!getSavedAdminToken()) {
        setIsCheckingSession(false);
        return;
      }
      try {
        const { admin: savedAdmin } = await adminApi.getCurrentAdmin();
        setAdmin(savedAdmin);
      } catch (error) {
        logout();
      } finally {
        setIsCheckingSession(false);
      }
    }
    restoreSavedSession();
  }, [logout]);

  // apiClient.js fires this event whenever the server says the token expired
  useEffect(() => {
    window.addEventListener("villament:admin-session-expired", logout);
    return () => window.removeEventListener("villament:admin-session-expired", logout);
  }, [logout]);

  const contextValue = useMemo(
    () => ({ admin, isLoggedIn: Boolean(admin), isCheckingSession, login, logout }),
    [admin, isCheckingSession, login, logout]
  );

  return <AdminAuthContext.Provider value={contextValue}>{children}</AdminAuthContext.Provider>;
}

/** Hook to read the admin login state from any component. */
export function useAdminAuth() {
  const contextValue = useContext(AdminAuthContext);
  if (!contextValue) {
    throw new Error("useAdminAuth must be used inside <AdminAuthProvider>.");
  }
  return contextValue;
}
