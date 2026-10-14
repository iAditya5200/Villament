/**
 * LocationMap.jsx
 * ---------------
 * Shows an OpenStreetMap map centred on a latitude / longitude.
 * OpenStreetMap is free and needs no API key.
 */

/** How far (in degrees) the map shows around the point. Smaller = closer zoom. */
const MAP_ZOOM_DISTANCE = 0.02;

export default function LocationMap({ latitude, longitude, title = "Location map" }) {
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return null;
  }

  // The "bbox" is the visible rectangle: left, bottom, right, top
  const visibleArea = [
    longitude - MAP_ZOOM_DISTANCE,
    latitude - MAP_ZOOM_DISTANCE,
    longitude + MAP_ZOOM_DISTANCE,
    latitude + MAP_ZOOM_DISTANCE,
  ].join(",");

  const mapAddress = `https://www.openstreetmap.org/export/embed.html?bbox=${visibleArea}&layer=mapnik&marker=${latitude},${longitude}`;
  const directionsAddress = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

  return (
    <div className="location-map">
      <iframe title={title} src={mapAddress} loading="lazy" />
      <a className="location-map__directions" href={directionsAddress} target="_blank" rel="noreferrer">
        Get directions ↗
      </a>
    </div>
  );
}
