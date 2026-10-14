/**
 * PropertiesPage.jsx
 * ------------------
 * Lists every Villament community with filters for location, home type,
 * status, a text search, sorting, and a "shortlist only" toggle.
 *
 * The filters are stored in the page address (for example
 * /properties?city=Karjat&status=Now%20Selling) so a filtered view can be
 * bookmarked or shared, and the browser back button works as expected.
 */

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import Icon from "../components/Icon.jsx";
import PropertyCard from "../components/PropertyCard.jsx";
import { PropertyCardSkeletons, ErrorMessage, EmptyState } from "../components/LoadingAndErrorStates.jsx";
import { publicApi } from "../api/apiClient.js";
import { useApiData } from "../hooks/useApiData.js";
import { useShortlist } from "../context/ShortlistContext.jsx";

const SEARCH_TYPING_DELAY_IN_MILLISECONDS = 350;

export default function PropertiesPage() {
  const [searchParameters, setSearchParameters] = useSearchParams();
  const { shortlistedIds } = useShortlist();

  // Read the current filters from the address bar
  const selectedCity = searchParameters.get("city") || "";
  const selectedType = searchParameters.get("type") || "";
  const selectedStatus = searchParameters.get("status") || "";
  const selectedSort = searchParameters.get("sort") || "newest";
  const appliedSearchText = searchParameters.get("search") || "";
  const isShortlistOnly = searchParameters.get("shortlist") === "true";

  // The search box updates the address only after the visitor stops typing
  const [searchBoxText, setSearchBoxText] = useState(appliedSearchText);
  useEffect(() => {
    const timerId = window.setTimeout(() => {
      if (searchBoxText !== appliedSearchText) updateFilter("search", searchBoxText);
    }, SEARCH_TYPING_DELAY_IN_MILLISECONDS);
    return () => window.clearTimeout(timerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchBoxText]);

  const { data: filterOptions } = useApiData(() => publicApi.getPropertyFilterOptions(), []);

  const { data, isLoading, errorMessage, reload } = useApiData(
    () =>
      publicApi.getProperties({
        city: selectedCity,
        type: selectedType,
        status: selectedStatus,
        search: appliedSearchText,
        sort: selectedSort,
      }),
    [selectedCity, selectedType, selectedStatus, appliedSearchText, selectedSort]
  );

  /** Sets (or removes, when empty) one filter in the address bar. */
  function updateFilter(filterName, filterValue) {
    const updatedParameters = new URLSearchParams(searchParameters);
    if (filterValue) {
      updatedParameters.set(filterName, filterValue);
    } else {
      updatedParameters.delete(filterName);
    }
    setSearchParameters(updatedParameters, { replace: true });
  }

  function clearAllFilters() {
    setSearchBoxText("");
    setSearchParameters({}, { replace: true });
  }

  // The shortlist filter is applied here in the browser, because the shortlist
  // lives in the visitor's browser and not on the server.
  const allProperties = data?.properties || [];
  const visibleProperties = isShortlistOnly
    ? allProperties.filter((property) => shortlistedIds.includes(property._id))
    : allProperties;

  const hasActiveFilters = Boolean(selectedCity || selectedType || selectedStatus || appliedSearchText || isShortlistOnly);

  return (
    <>
      <section className="page-banner">
        <div className="container">
          <span className="eyebrow">Communities</span>
          <h1>Find the place that feels like yours</h1>
          <p>Villas, plots, townhouses and farmhouses — each one planned around its landscape.</p>
        </div>
      </section>

      <section className="section section--compact">
        <div className="container">
          {/* ---------- Filter bar ---------- */}
          <div className="filter-bar">
            <label className="filter-bar__search">
              <Icon name="search" size={18} />
              <input
                type="search"
                placeholder="Search by name or locality"
                value={searchBoxText}
                onChange={(event) => setSearchBoxText(event.target.value)}
                aria-label="Search properties"
              />
            </label>

            <select value={selectedCity} onChange={(event) => updateFilter("city", event.target.value)} aria-label="Location">
              <option value="">All locations</option>
              {filterOptions?.cities.map((cityName) => (
                <option key={cityName}>{cityName}</option>
              ))}
            </select>

            <select value={selectedType} onChange={(event) => updateFilter("type", event.target.value)} aria-label="Home type">
              <option value="">All home types</option>
              {filterOptions?.types.map((typeName) => (
                <option key={typeName}>{typeName}</option>
              ))}
            </select>

            <select value={selectedSort} onChange={(event) => updateFilter("sort", event.target.value)} aria-label="Sort by">
              <option value="newest">Newest first</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
            </select>
          </div>

          {/* ---------- Status chips ---------- */}
          <div className="chip-row">
            {["", ...(filterOptions?.statuses || [])].map((statusName) => (
              <button
                type="button"
                key={statusName || "all"}
                className={`chip ${selectedStatus === statusName ? "chip--active" : ""}`}
                onClick={() => updateFilter("status", statusName)}
              >
                {statusName || "All"}
              </button>
            ))}
            <button
              type="button"
              className={`chip chip--heart ${isShortlistOnly ? "chip--active" : ""}`}
              onClick={() => updateFilter("shortlist", isShortlistOnly ? "" : "true")}
            >
              <Icon name="heart" size={15} filled={isShortlistOnly} /> My shortlist ({shortlistedIds.length})
            </button>
            {hasActiveFilters && (
              <button type="button" className="chip chip--clear" onClick={clearAllFilters}>
                Clear filters
              </button>
            )}
          </div>

          {/* ---------- Results ---------- */}
          {!isLoading && !errorMessage && (
            <p className="result-count">
              {visibleProperties.length} {visibleProperties.length === 1 ? "community" : "communities"}
            </p>
          )}

          {errorMessage ? (
            <ErrorMessage message={errorMessage} onRetry={reload} />
          ) : isLoading ? (
            <div className="property-grid">
              <PropertyCardSkeletons count={6} />
            </div>
          ) : visibleProperties.length === 0 ? (
            <EmptyState
              title={isShortlistOnly ? "Your shortlist is empty" : "No communities match these filters"}
              description={
                isShortlistOnly
                  ? "Tap the heart on any property to save it here."
                  : "Try a different location or home type."
              }
              action={
                <button type="button" className="button button--ghost" onClick={clearAllFilters}>
                  Show all communities
                </button>
              }
            />
          ) : (
            <div className="property-grid">
              {visibleProperties.map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
