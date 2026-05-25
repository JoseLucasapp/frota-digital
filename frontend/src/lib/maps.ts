type LocationLike = {
  latitude?: number | null;
  longitude?: number | null;
  last_latitude?: number | null;
  last_longitude?: number | null;
  address?: string | null;
  last_address?: string | null;
};

const getMapQuery = (location: LocationLike) => {
  const latitude = location.latitude ?? location.last_latitude;
  const longitude = location.longitude ?? location.last_longitude;

  if (latitude != null && longitude != null) {
    return `${latitude},${longitude}`;
  }

  return (location.address || location.last_address || "").trim();
};

export const buildGoogleMapsUrl = (location: LocationLike) => {
  const query = getMapQuery(location);
  if (!query) return null;

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
};

export const buildGoogleMapsEmbedUrl = (location: LocationLike) => {
  const query = getMapQuery(location);
  if (!query) return null;

  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=16&output=embed`;
};
