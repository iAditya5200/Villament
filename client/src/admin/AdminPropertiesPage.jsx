/**
 * AdminPropertiesPage.jsx
 * -----------------------
 * A table of every property, with buttons to add, edit, view and delete.
 * Deleting asks for confirmation first. Enquiries about a deleted property
 * are kept, so no lead is ever lost.
 */

import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Icon from "../components/Icon.jsx";
import PropertyImage from "../components/PropertyImage.jsx";
import StatusTag from "../components/StatusTag.jsx";
import { LoadingSpinner, ErrorMessage, EmptyState } from "../components/LoadingAndErrorStates.jsx";
import { AdminPageHeader, ConfirmDialog, Toast } from "./AdminShared.jsx";
import { adminApi } from "../api/apiClient.js";
import { useApiData } from "../hooks/useApiData.js";
import { formatIndianPrice, formatLocation, formatDate } from "../utils/formatters.js";

export default function AdminPropertiesPage() {
  const { data, setData, isLoading, errorMessage, reload } = useApiData(() => adminApi.getProperties(), []);

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [propertyPendingDeletion, setPropertyPendingDeletion] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState(null);
  const closeToast = useCallback(() => setToast(null), []);

  const allProperties = data?.properties || [];

  // Filter the table in the browser – the list of properties is small
  const visibleProperties = useMemo(() => {
    const lowerCaseSearch = searchText.trim().toLowerCase();
    return allProperties.filter((property) => {
      const matchesStatus = !statusFilter || property.status === statusFilter;
      const matchesSearch =
        !lowerCaseSearch ||
        property.title.toLowerCase().includes(lowerCaseSearch) ||
        formatLocation(property.location).toLowerCase().includes(lowerCaseSearch);
      return matchesStatus && matchesSearch;
    });
  }, [allProperties, searchText, statusFilter]);

  async function confirmDeletion() {
    setIsDeleting(true);
    try {
      const { message } = await adminApi.deleteProperty(propertyPendingDeletion._id);
      // Remove it from the table straight away, without reloading everything
      setData((previousData) => ({
        ...previousData,
        properties: previousData.properties.filter((property) => property._id !== propertyPendingDeletion._id),
      }));
      setToast({ type: "success", text: message });
      setPropertyPendingDeletion(null);
    } catch (error) {
      setToast({ type: "error", text: error.message });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="admin-page">
      <AdminPageHeader title="Properties" subtitle={`${allProperties.length} listed on the website`}>
        <Link to="/admin/properties/new" className="button button--forest">
          <Icon name="plus" size={16} /> Add property
        </Link>
      </AdminPageHeader>

      <div className="admin-toolbar">
        <label className="admin-search">
          <Icon name="search" size={18} />
          <input
            type="search"
            placeholder="Search by name or city"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />
        </label>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by status">
          <option value="">All statuses</option>
          <option>Now Selling</option>
          <option>Coming Soon</option>
          <option>Sold Out</option>
        </select>
      </div>

      {isLoading ? (
        <LoadingSpinner label="Loading properties…" />
      ) : errorMessage ? (
        <ErrorMessage message={errorMessage} onRetry={reload} />
      ) : visibleProperties.length === 0 ? (
        <EmptyState
          title={allProperties.length === 0 ? "No properties yet" : "No properties match"}
          description={allProperties.length === 0 ? "Add your first property to show it on the website." : "Try another search."}
          action={
            <Link to="/admin/properties/new" className="button button--forest">
              <Icon name="plus" size={16} /> Add property
            </Link>
          }
        />
      ) : (
        <div className="admin-card admin-card--flush">
          <div className="table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Price from</th>
                  <th>Leads</th>
                  <th>Updated</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {visibleProperties.map((property) => (
                  <tr key={property._id}>
                    <td>
                      <div className="admin-table__property">
                        <span className="admin-table__thumbnail">
                          <PropertyImage imagePath={property.images?.[0]} altText="" />
                        </span>
                        <span>
                          <Link to={`/admin/properties/${property._id}/edit`} className="admin-table__primary">
                            {property.title}
                          </Link>
                          <small>
                            {formatLocation(property.location)}
                            {property.isFeatured && <span className="featured-dot"> · ★ Featured</span>}
                          </small>
                        </span>
                      </div>
                    </td>
                    <td>{property.propertyType}</td>
                    <td>
                      <StatusTag status={property.status} />
                    </td>
                    <td>{formatIndianPrice(property.startingPrice)}</td>
                    <td>
                      <Link to={`/admin/enquiries?propertyId=${property._id}`} className="text-link">
                        {property.enquiryCount}
                      </Link>
                    </td>
                    <td>{formatDate(property.updatedAt)}</td>
                    <td>
                      <div className="admin-table__actions">
                        <a
                          href={`/properties/${property.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="icon-button icon-button--small"
                          title="View on website"
                        >
                          <Icon name="external" size={16} />
                        </a>
                        <Link
                          to={`/admin/properties/${property._id}/edit`}
                          className="icon-button icon-button--small"
                          title="Edit"
                        >
                          <Icon name="edit" size={16} />
                        </Link>
                        <button
                          type="button"
                          className="icon-button icon-button--small icon-button--danger"
                          title="Delete"
                          onClick={() => setPropertyPendingDeletion(property)}
                        >
                          <Icon name="trash" size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(propertyPendingDeletion)}
        title="Delete this property?"
        message={`"${propertyPendingDeletion?.title}" will be removed from the website, along with its uploaded photos. Leads for this property will be kept.`}
        confirmLabel="Delete property"
        onConfirm={confirmDeletion}
        onCancel={() => setPropertyPendingDeletion(null)}
        isWorking={isDeleting}
      />
      <Toast toast={toast} onClose={closeToast} />
    </div>
  );
}
