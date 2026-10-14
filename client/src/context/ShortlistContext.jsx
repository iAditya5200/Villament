/**
 * ShortlistContext.jsx
 * --------------------
 * Lets visitors "heart" properties they like. The shortlist is saved in the
 * visitor's own browser (localStorage), so it survives page reloads without
 * needing an account.
 *
 * Usage:
 *     const { shortlistedIds, isShortlisted, toggleShortlist } = useShortlist();
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const SHORTLIST_STORAGE_KEY = "villament_shortlist";
const ShortlistContext = createContext(null);

/** Reads the saved shortlist safely (returns an empty list on any problem). */
function readSavedShortlist() {
  try {
    const savedText = window.localStorage.getItem(SHORTLIST_STORAGE_KEY);
    const savedList = savedText ? JSON.parse(savedText) : [];
    return Array.isArray(savedList) ? savedList : [];
  } catch (error) {
    return [];
  }
}

export function ShortlistProvider({ children }) {
  const [shortlistedIds, setShortlistedIds] = useState(readSavedShortlist);

  // Save every change back to the browser
  useEffect(() => {
    try {
      window.localStorage.setItem(SHORTLIST_STORAGE_KEY, JSON.stringify(shortlistedIds));
    } catch (error) {
      /* storage not available – shortlist only lasts for this visit */
    }
  }, [shortlistedIds]);

  const isShortlisted = useCallback((propertyId) => shortlistedIds.includes(propertyId), [shortlistedIds]);

  /** Adds the property if it is not in the list, removes it if it is. */
  const toggleShortlist = useCallback((propertyId) => {
    setShortlistedIds((currentIds) =>
      currentIds.includes(propertyId) ? currentIds.filter((id) => id !== propertyId) : [...currentIds, propertyId]
    );
  }, []);

  const contextValue = useMemo(
    () => ({ shortlistedIds, isShortlisted, toggleShortlist }),
    [shortlistedIds, isShortlisted, toggleShortlist]
  );

  return <ShortlistContext.Provider value={contextValue}>{children}</ShortlistContext.Provider>;
}

export function useShortlist() {
  const contextValue = useContext(ShortlistContext);
  if (!contextValue) {
    throw new Error("useShortlist must be used inside <ShortlistProvider>.");
  }
  return contextValue;
}
