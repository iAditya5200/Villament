/**
 * AdminPropertyFormPage.jsx
 * -------------------------
 * One form used for both ADDING a new property (/admin/properties/new) and
 * EDITING an existing one (/admin/properties/:propertyId/edit).
 *
 * Images can be added in two ways:
 *   1. Uploading photos from the computer (sent as files)
 *   2. Pasting a web address of an image (e.g. from a CDN)
 *
 * The text fields are sent as one JSON string called "propertyData", and the
 * photos as "images" files, inside a single multipart FormData request.
 */

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import Icon from "../components/Icon.jsx";
import PropertyImage from "../components/PropertyImage.jsx";
import { LoadingSpinner, ErrorMessage } from "../components/LoadingAndErrorStates.jsx";
import { AdminPageHeader } from "./AdminShared.jsx";
import { adminApi } from "../api/apiClient.js";

const PROPERTY_TYPES = ["Villa", "Villa Plot", "Townhouse", "Apartment", "Farmhouse"];
const PROPERTY_STATUSES = ["Now Selling", "Coming Soon", "Sold Out"];
const MAXIMUM_NEW_IMAGES = 10;

/** The starting values for a brand-new property. */
const EMPTY_PROPERTY_FORM = {
  title: "",
  tagline: "",
  description: "",
  locality: "",
  city: "",
  state: "Maharashtra",
  latitude: "",
  longitude: "",
  propertyType: "Villa",
  status: "Now Selling",
  startingPrice: "",
  configuration: "",
  sizeRange: "",
  totalUnits: "",
  landArea: "",
  possession: "",
  reraNumber: "",
  amenitiesText: "", // one amenity per line
  highlightsText: "", // one highlight per line
  isFeatured: false,
};

/** Converts a property from the API into the flat shape the form uses. */
function convertPropertyToFormValues(property) {
  return {
    title: property.title || "",
    tagline: property.tagline || "",
    description: property.description || "",
    locality: property.location?.locality || "",
    city: property.location?.city || "",
    state: property.location?.state || "Maharashtra",
    latitude: property.location?.latitude ?? "",
    longitude: property.location?.longitude ?? "",
    propertyType: property.propertyType || "Villa",
    status: property.status || "Now Selling",
    startingPrice: property.startingPrice || "",
    configuration: property.configuration || "",
    sizeRange: property.sizeRange || "",
    totalUnits: property.totalUnits || "",
    landArea: property.landArea || "",
    possession: property.possession || "",
    reraNumber: property.reraNumber || "",
    amenitiesText: (property.amenities || []).join("\n"),
    highlightsText: (property.highlights || []).join("\n"),
    isFeatured: Boolean(property.isFeatured),
  };
}

/** Converts the flat form values back into the shape the API expects. */
function convertFormValuesToPropertyData(formValues, keptImagePaths) {
  return {
    title: formValues.title.trim(),
    tagline: formValues.tagline.trim(),
    description: formValues.description.trim(),
    location: {
      locality: formValues.locality.trim(),
      city: formValues.city.trim(),
      state: formValues.state.trim(),
      latitude: formValues.latitude,
      longitude: formValues.longitude,
    },
    propertyType: formValues.propertyType,
    status: formValues.status,
    startingPrice: Number(formValues.startingPrice) || 0,
    configuration: formValues.configuration.trim(),
    sizeRange: formValues.sizeRange.trim(),
    totalUnits: Number(formValues.totalUnits) || 0,
    landArea: formValues.landArea.trim(),
    possession: formValues.possession.trim(),
    reraNumber: formValues.reraNumber.trim(),
    amenities: formValues.amenitiesText,
    highlights: formValues.highlightsText,
    isFeatured: formValues.isFeatured,
    images: keptImagePaths,
  };
}

export default function AdminPropertyFormPage() {
  const { propertyId } = useParams();
  const isEditing = Boolean(propertyId);
  const navigate = useNavigate();

  const [formValues, setFormValues] = useState(EMPTY_PROPERTY_FORM);
  const [existingImagePaths, setExistingImagePaths] = useState([]); // already saved or pasted URLs
  const [newImageFiles, setNewImageFiles] = useState([]); // [{ file, previewAddress }]
  const [imageAddressInput, setImageAddressInput] = useState("");

  const [isLoadingProperty, setIsLoadingProperty] = useState(isEditing);
  const [loadingError, setLoadingError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // When editing, load the property and fill in the form
  useEffect(() => {
    if (!isEditing) return;
    async function loadProperty() {
      try {
        const { property } = await adminApi.getProperty(propertyId);
        setFormValues(convertPropertyToFormValues(property));
        setExistingImagePaths(property.images || []);
      } catch (error) {
        setLoadingError(error.message);
      } finally {
        setIsLoadingProperty(false);
      }
    }
    loadProperty();
  }, [isEditing, propertyId]);

  // Free the temporary preview addresses when leaving the page
  useEffect(() => {
    return () => newImageFiles.forEach((newImage) => URL.revokeObjectURL(newImage.previewAddress));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Updates any normal input. Checkboxes use "checked" instead of "value". */
  function updateField(event) {
    const { name, type, value, checked } = event.target;
    setFormValues((previousValues) => ({ ...previousValues, [name]: type === "checkbox" ? checked : value }));
  }

  /* ---------- Image helpers ---------- */

  function handleFilesChosen(event) {
    const chosenFiles = Array.from(event.target.files || []);
    const spaceLeft = MAXIMUM_NEW_IMAGES - newImageFiles.length;
    const filesToAdd = chosenFiles.slice(0, spaceLeft).map((file) => ({
      file,
      previewAddress: URL.createObjectURL(file),
    }));
    setNewImageFiles((previousFiles) => [...previousFiles, ...filesToAdd]);
    event.target.value = ""; // allow choosing the same file again later
  }

  function removeNewImage(indexToRemove) {
    setNewImageFiles((previousFiles) => {
      URL.revokeObjectURL(previousFiles[indexToRemove].previewAddress);
      return previousFiles.filter((unusedFile, index) => index !== indexToRemove);
    });
  }

  function removeExistingImage(pathToRemove) {
    setExistingImagePaths((previousPaths) => previousPaths.filter((imagePath) => imagePath !== pathToRemove));
  }

  /** Moves an image to the front of the list, making it the cover photo. */
  function makeCoverImage(pathToPromote) {
    setExistingImagePaths((previousPaths) => [pathToPromote, ...previousPaths.filter((imagePath) => imagePath !== pathToPromote)]);
  }

  function addImageByAddress() {
    const trimmedAddress = imageAddressInput.trim();
    if (!/^https?:\/\//i.test(trimmedAddress)) {
      setSaveError("Image addresses must start with http:// or https://");
      return;
    }
    if (!existingImagePaths.includes(trimmedAddress)) {
      setExistingImagePaths((previousPaths) => [...previousPaths, trimmedAddress]);
    }
    setImageAddressInput("");
    setSaveError("");
  }

  /* ---------- Saving ---------- */

  async function handleSubmit(event) {
    event.preventDefault();
    setSaveError("");

    if (!formValues.title.trim() || !formValues.city.trim() || !formValues.description.trim()) {
      setSaveError("Please fill in the title, city and description.");
      return;
    }

    // Build the multipart request: JSON text + image files
    const requestData = new FormData();
    requestData.append("propertyData", JSON.stringify(convertFormValuesToPropertyData(formValues, existingImagePaths)));
    newImageFiles.forEach((newImage) => requestData.append("images", newImage.file));

    setIsSaving(true);
    try {
      if (isEditing) {
        await adminApi.updateProperty(propertyId, requestData);
      } else {
        await adminApi.createProperty(requestData);
      }
      navigate("/admin/properties");
    } catch (error) {
      setSaveError(error.message);
      setIsSaving(false);
    }
  }

  if (isLoadingProperty) return <LoadingSpinner label="Loading property…" />;
  if (loadingError) return <ErrorMessage message={loadingError} />;

  const totalImageCount = existingImagePaths.length + newImageFiles.length;

  return (
    <div className="admin-page">
      <AdminPageHeader
        title={isEditing ? `Edit ${formValues.title || "property"}` : "Add a property"}
        subtitle={isEditing ? "Changes appear on the website as soon as you save." : "Fill in the details below to publish a new community."}
      >
        <Link to="/admin/properties" className="button button--ghost">
          Cancel
        </Link>
      </AdminPageHeader>

      <form className="admin-form" onSubmit={handleSubmit}>
        {/* ---------- Basics ---------- */}
        <fieldset className="admin-card admin-form__section">
          <legend className="admin-card__title">Basics</legend>
          <div className="form-grid">
            <AdminField label="Property title *" fullWidth>
              <input name="title" value={formValues.title} onChange={updateField} required maxLength={120} />
            </AdminField>
            <AdminField label="Tagline (one short line)" fullWidth>
              <input name="tagline" value={formValues.tagline} onChange={updateField} placeholder="e.g. Courtyard homes wrapped in a private forest" />
            </AdminField>
            <AdminField label="Description *" fullWidth hint="Use a blank line to start a new paragraph.">
              <textarea name="description" rows={6} value={formValues.description} onChange={updateField} required />
            </AdminField>
            <AdminField label="Property type">
              <select name="propertyType" value={formValues.propertyType} onChange={updateField}>
                {PROPERTY_TYPES.map((typeName) => (
                  <option key={typeName}>{typeName}</option>
                ))}
              </select>
            </AdminField>
            <AdminField label="Sales status">
              <select name="status" value={formValues.status} onChange={updateField}>
                {PROPERTY_STATUSES.map((statusName) => (
                  <option key={statusName}>{statusName}</option>
                ))}
              </select>
            </AdminField>
            <label className="toggle-field form-field--full">
              <input type="checkbox" name="isFeatured" checked={formValues.isFeatured} onChange={updateField} />
              <span>
                <strong>Feature on the home page</strong>
                <small>Featured properties appear in the "Our communities" section.</small>
              </span>
            </label>
          </div>
        </fieldset>

        {/* ---------- Location ---------- */}
        <fieldset className="admin-card admin-form__section">
          <legend className="admin-card__title">Location</legend>
          <div className="form-grid form-grid--three">
            <AdminField label="Locality / village">
              <input name="locality" value={formValues.locality} onChange={updateField} />
            </AdminField>
            <AdminField label="City *">
              <input name="city" value={formValues.city} onChange={updateField} required />
            </AdminField>
            <AdminField label="State">
              <input name="state" value={formValues.state} onChange={updateField} />
            </AdminField>
            <AdminField label="Latitude" hint="Optional – shows a map. Right-click a spot on Google Maps to copy it.">
              <input name="latitude" type="number" step="any" value={formValues.latitude} onChange={updateField} />
            </AdminField>
            <AdminField label="Longitude">
              <input name="longitude" type="number" step="any" value={formValues.longitude} onChange={updateField} />
            </AdminField>
          </div>
        </fieldset>

        {/* ---------- Pricing & specifications ---------- */}
        <fieldset className="admin-card admin-form__section">
          <legend className="admin-card__title">Pricing & specifications</legend>
          <div className="form-grid form-grid--three">
            <AdminField label="Starting price (₹)" hint="Full amount, e.g. 28500000. Leave empty for 'Price on request'.">
              <input name="startingPrice" type="number" min="0" value={formValues.startingPrice} onChange={updateField} />
            </AdminField>
            <AdminField label="Configuration">
              <input name="configuration" value={formValues.configuration} onChange={updateField} placeholder="3 & 4 BHK Villas" />
            </AdminField>
            <AdminField label="Size range">
              <input name="sizeRange" value={formValues.sizeRange} onChange={updateField} placeholder="2,400 – 4,100 sq.ft" />
            </AdminField>
            <AdminField label="Total units">
              <input name="totalUnits" type="number" min="0" value={formValues.totalUnits} onChange={updateField} />
            </AdminField>
            <AdminField label="Land area">
              <input name="landArea" value={formValues.landArea} onChange={updateField} placeholder="12 Acres" />
            </AdminField>
            <AdminField label="Possession">
              <input name="possession" value={formValues.possession} onChange={updateField} placeholder="March 2028" />
            </AdminField>
            <AdminField label="MahaRERA number">
              <input name="reraNumber" value={formValues.reraNumber} onChange={updateField} />
            </AdminField>
          </div>
        </fieldset>

        {/* ---------- Amenities & highlights ---------- */}
        <fieldset className="admin-card admin-form__section">
          <legend className="admin-card__title">Amenities & highlights</legend>
          <div className="form-grid">
            <AdminField label="Amenities" hint="One per line.">
              <textarea name="amenitiesText" rows={6} value={formValues.amenitiesText} onChange={updateField} placeholder={"Clubhouse\nInfinity pool\nOrganic farm"} />
            </AdminField>
            <AdminField label="Highlights" hint="Short selling points, one per line.">
              <textarea name="highlightsText" rows={6} value={formValues.highlightsText} onChange={updateField} placeholder={"90 minutes from Mumbai\n70% open green area"} />
            </AdminField>
          </div>
        </fieldset>

        {/* ---------- Photos ---------- */}
        <fieldset className="admin-card admin-form__section">
          <legend className="admin-card__title">Photos ({totalImageCount})</legend>
          <p className="muted-text">The first photo is used as the cover on cards and at the top of the page.</p>

          <div className="image-manager">
            {existingImagePaths.map((imagePath, index) => (
              <div className="image-manager__item" key={imagePath}>
                <PropertyImage imagePath={imagePath} altText={`Photo ${index + 1}`} />
                {index === 0 && <span className="image-manager__cover">Cover</span>}
                <div className="image-manager__actions">
                  {index !== 0 && (
                    <button type="button" onClick={() => makeCoverImage(imagePath)}>
                      Make cover
                    </button>
                  )}
                  <button type="button" onClick={() => removeExistingImage(imagePath)} aria-label="Remove photo">
                    <Icon name="trash" size={14} />
                  </button>
                </div>
              </div>
            ))}

            {newImageFiles.map((newImage, index) => (
              <div className="image-manager__item image-manager__item--new" key={newImage.previewAddress}>
                <img src={newImage.previewAddress} alt={`New upload ${index + 1}`} />
                {existingImagePaths.length === 0 && index === 0 && <span className="image-manager__cover">Cover</span>}
                <span className="image-manager__new-label">New</span>
                <div className="image-manager__actions">
                  <button type="button" onClick={() => removeNewImage(index)} aria-label="Remove photo">
                    <Icon name="trash" size={14} />
                  </button>
                </div>
              </div>
            ))}

            <label className="image-manager__upload">
              <Icon name="image" size={26} />
              <span>Upload photos</span>
              <small>JPG, PNG or WEBP · up to 5 MB each</small>
              <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple onChange={handleFilesChosen} hidden />
            </label>
          </div>

          <div className="image-manager__url">
            <input
              type="url"
              placeholder="…or paste an image address (https://…)"
              value={imageAddressInput}
              onChange={(event) => setImageAddressInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addImageByAddress();
                }
              }}
            />
            <button type="button" className="button button--ghost button--small" onClick={addImageByAddress}>
              Add image
            </button>
          </div>
        </fieldset>

        {/* ---------- Save bar ---------- */}
        <div className="admin-form__save-bar">
          {saveError && <p className="form-error">{saveError}</p>}
          <div className="button-row">
            <button type="submit" className="button button--forest" disabled={isSaving}>
              <Icon name="check" size={16} /> {isSaving ? "Saving…" : isEditing ? "Save changes" : "Publish property"}
            </button>
            <Link to="/admin/properties" className="button button--ghost">
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}

/** Label + input + optional hint, used throughout the admin form. */
function AdminField({ label, hint, fullWidth = false, children }) {
  return (
    <label className={`form-field ${fullWidth ? "form-field--full" : ""}`}>
      <span className="form-field__label">{label}</span>
      {children}
      {hint && <span className="form-field__hint">{hint}</span>}
    </label>
  );
}
