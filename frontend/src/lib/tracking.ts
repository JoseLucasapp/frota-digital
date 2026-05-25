export const STOP_NOTE_MARKER = "[parada]";

export const isStopTrackingLog = (log: { is_stop?: boolean | null; notes?: string | null; source?: string | null }) => {
  const notes = String(log.notes || "").toLowerCase();
  const source = String(log.source || "").toLowerCase();

  return Boolean(log.is_stop) || notes.includes(STOP_NOTE_MARKER) || source.includes("stop") || source.includes("parada");
};

export const cleanTrackingNotes = (notes?: string | null) =>
  String(notes || "")
    .replace(STOP_NOTE_MARKER, "")
    .replace("Parada registrada via Google Maps.", "")
    .trim();

export const trackingSourceLabel = (source?: string | null) => {
  if (!source) return "Não informada";

  const normalized = String(source);

  if (normalized === "browser_geolocation") return "Navegador";
  if (normalized === "manual") return "Manual";

  return normalized;
};
