export function buildDate(date?: string, time?: string): Date {
  if (!date) {
    date = getOnlyDate(new Date());
  }
  if (!time) {
    time = getOnlyTime(new Date());
  }
  let [year, month, day] = date?.split("-") || [];
  let [hour, minute, second] = time?.split(":") || [];
  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour || 0),
    Number(minute || 0),
    Number(second || 0),
  );
}

export function getOnlyDate(date: Date) {
  return date.toLocaleDateString("sv-SE");
}

export function getOnlyTime(date: Date) {
  return date.toLocaleTimeString();
}

export function formatDate(dateString: string): string {
  if (!dateString || new Date(dateString).toString() === "Invalid Date")
    return "-";
  const date = new Date(dateString);
  const { timeZone, locale } = Intl.DateTimeFormat().resolvedOptions();
  const dateFormater = new Intl.DateTimeFormat(locale, {
    timeZone,
    month: "long",
  });
  const month = dateFormater.format(date);
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
}

export function formatHour(dateString: string): string {
  const date = new Date(dateString);
  const hour = date.getHours().toString().padStart(2, "0");
  const minute = date.getMinutes().toString().padStart(2, "0");
  return `${hour}:${minute}`;
}

export function formatTimeLeft(ms: number): string {
  if (ms <= 0) return "expirado";
  const seconds = Math.floor(ms / 1000) % 60;
  const minutes = Math.floor(ms / (1000 * 60)) % 60;
  const hours = Math.floor(ms / (1000 * 60 * 60)) % 24;
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  let timeLeftString = "";
  if (days > 0) {
    timeLeftString += `${days} d `;
  }
  if (hours > 0 && days === 0) {
    timeLeftString += `${hours} h `;
  }
  if (minutes > 0 && hours === 0 && days === 0 && seconds === 0) {
    timeLeftString += `${minutes} min `;
  }
  if (seconds > 0) {
    if (minutes === 0 && hours === 0 && days === 0) {
      timeLeftString += `${seconds} s `;
    } else if (minutes > 0 && hours === 0 && days === 0) {
      timeLeftString += `${minutes} min, ${seconds} sec(s) `;
    }
  }
  return timeLeftString;
}
