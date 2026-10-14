/**
 * HeroSearch.jsx
 * --------------
 * The search bar on the home page hero. Visitors pick a location, a type of
 * home and a status, then go to the listing page with those filters applied.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Icon from "./Icon.jsx";
import { publicApi } from "../api/apiClient.js";
import { useApiData } from "../hooks/useApiData.js";

export default function HeroSearch() {
  const navigate = useNavigate();
  const { data: filterOptions } = useApiData(() => publicApi.getPropertyFilterOptions(), []);

  const [selectedCity, setSelectedCity] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  function handleSearch(event) {
    event.preventDefault();

    // Only include the filters the visitor actually chose
    const searchParameters = new URLSearchParams();
    if (selectedCity) searchParameters.set("city", selectedCity);
    if (selectedType) searchParameters.set("type", selectedType);
    if (selectedStatus) searchParameters.set("status", selectedStatus);

    const queryText = searchParameters.toString();
    navigate(`/properties${queryText ? `?${queryText}` : ""}`);
  }

  return (
    <form className="hero-search" onSubmit={handleSearch} aria-label="Find a home">
      <label className="hero-search__field">
        <span>Location</span>
        <select value={selectedCity} onChange={(event) => setSelectedCity(event.target.value)}>
          <option value="">Anywhere</option>
          {filterOptions?.cities.map((cityName) => (
            <option key={cityName} value={cityName}>
              {cityName}
            </option>
          ))}
        </select>
      </label>

      <label className="hero-search__field">
        <span>Home type</span>
        <select value={selectedType} onChange={(event) => setSelectedType(event.target.value)}>
          <option value="">Any type</option>
          {filterOptions?.types.map((typeName) => (
            <option key={typeName} value={typeName}>
              {typeName}
            </option>
          ))}
        </select>
      </label>

      <label className="hero-search__field">
        <span>Status</span>
        <select value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)}>
          <option value="">Any status</option>
          {filterOptions?.statuses.map((statusName) => (
            <option key={statusName} value={statusName}>
              {statusName}
            </option>
          ))}
        </select>
      </label>

      <button type="submit" className="button button--clay hero-search__button">
        <Icon name="search" size={18} /> Explore
      </button>
    </form>
  );
}
