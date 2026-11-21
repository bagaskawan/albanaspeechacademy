// Public schedule dates and WIB times are formatted in one place so every
// surface reads the same. Academy location is Bandung (Asia/Jakarta).
const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

const timeFormatter = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Asia/Jakarta",
});

// Batch sessions are stored as WIB wall time without an offset, so add it
// explicitly instead of relying on the server timezone.
function parseWib(iso: string) {
  return new Date(/(?:Z|[+-]\d{2}:?\d{2})$/.test(iso) ? iso : `${iso}+07:00`);
}

const isoDateFormatter = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "Asia/Jakarta",
});

export function formatSessionDate(iso: string) {
  return dateFormatter.format(parseWib(iso));
}

export function formatSessionIsoDate(iso: string) {
  const date = parseWib(iso);
  if (Number.isNaN(date.getTime())) return "";
  return isoDateFormatter.format(date);
}

export function formatTimeRange(startsAt: string, endsAt: string) {
  return `${timeFormatter.format(parseWib(startsAt))}–${timeFormatter.format(parseWib(endsAt))} WIB`;
}

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 0,
});

export function formatRupiah(value: number) {
  return `Rp${rupiahFormatter.format(value)}`;
}
