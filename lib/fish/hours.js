function localParts(date) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
  );
  return {
    date: `${p.year}-${p.month}-${p.day}`,
    minutes: Number(p.hour) * 60 + Number(p.minute),
  };
}
const minute = (s) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3));
export function periods(settings, date) {
  return (
    settings.exceptions[date] ??
    settings.hours[new Date(date + "T12:00:00-03:00").getUTCDay()] ??
    []
  );
}
export function isOpen(settings, now = new Date()) {
  if (settings.paused) return false;
  const p = localParts(now);
  return periods(settings, p.date).some(
    ([a, b]) =>
      p.minutes >= minute(a) && p.minutes < minute(b) - settings.cutoffMinutes,
  );
}
export function opening(settings, now = new Date()) {
  const p = localParts(now);
  let next = null;
  for (let i = 0; i < 15 && !next; i++) {
    const date = new Date(p.date + "T12:00:00-03:00");
    date.setUTCDate(date.getUTCDate() + i);
    const key = localParts(date).date;
    const found = periods(settings, key).find(
      ([a, b]) =>
        (i > 0 || minute(a) > p.minutes) &&
        minute(a) < minute(b) - settings.cutoffMinutes,
    );
    if (found) next = `${key.split("-").reverse().join("/")} às ${found[0]}`;
  }
  return {
    open: isOpen(settings, now),
    paused: settings.paused,
    next,
    scheduling: settings.scheduling,
    timezone: "America/Sao_Paulo",
  };
}
export function validSchedule(settings, value, now = new Date()) {
  if (
    !settings.scheduling ||
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)
  )
    return false;
  const date = new Date(value + ":00-03:00");
  return (
    !isNaN(date) &&
    localParts(date).date === value.slice(0, 10) &&
    date > now &&
    date - now <= 14 * 86400000 &&
    isOpen({ ...settings, paused: false }, date)
  );
}
