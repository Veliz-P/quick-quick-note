export function buildDate(date?: string, time?: string): Date {
  if (!date) {
    date = String(new Date().toISOString().split("T")[0]);
  }
  if (!time) {
    time = "00:00:00";
  }
  const iso = `${date}T${time}`;
  return new Date(iso);
}
