/**
 * Universal Calendar Utilities for Langratia Leads.
 * Generates RFC 5545 iCalendar (.ics) files and Google Calendar quick-add URLs.
 * Supports Apple Calendar, Microsoft Outlook, and Google Calendar.
 */

export interface CalendarEventOptions {
  title: string;
  description?: string;
  location?: string;
  date: string; // YYYY-MM-DD
  time?: string | null; // HH:mm or HH:mm:ss
  durationMinutes?: number;
  attendeeEmail?: string;
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function formatDateToICS(d: Date): string {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(
    d.getUTCHours()
  )}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

function escapeICS(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

export function parseEventDates(dateStr: string, timeStr?: string | null, durationMinutes = 30) {
  // If dateStr is just YYYY-MM-DD
  const dateParts = dateStr.split("-").map((v) => parseInt(v, 10));
  const year = dateParts[0] || new Date().getFullYear();
  const month = (dateParts[1] || 1) - 1;
  const day = dateParts[2] || 1;

  let hour = 10;
  let minute = 0;
  if (timeStr) {
    const timeParts = timeStr.split(":").map((v) => parseInt(v, 10));
    if (!isNaN(timeParts[0])) hour = timeParts[0];
    if (!isNaN(timeParts[1])) minute = timeParts[1];
  }

  const start = new Date(Date.UTC(year, month, day, hour, minute, 0));
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

  return { start, end };
}

/**
 * Generate standard RFC 5545 .ics calendar file content
 */
export function generateICS(opts: CalendarEventOptions): string {
  const { start, end } = parseEventDates(opts.date, opts.time, opts.durationMinutes || 30);
  const uid = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}@langratia.com`;
  const now = formatDateToICS(new Date());
  const dtStart = formatDateToICS(start);
  const dtEnd = formatDateToICS(end);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Langratia//Langratia Leads CRM//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeICS(opts.title)}`,
  ];

  if (opts.description) {
    lines.push(`DESCRIPTION:${escapeICS(opts.description)}`);
  }
  if (opts.location) {
    lines.push(`LOCATION:${escapeICS(opts.location)}`);
  }
  if (opts.attendeeEmail) {
    lines.push(`ATTENDEE;CN=${escapeICS(opts.attendeeEmail)}:mailto:${opts.attendeeEmail}`);
  }

  lines.push("STATUS:CONFIRMED", "END:VEVENT", "END:VCALENDAR");

  return lines.join("\r\n");
}

/**
 * Trigger immediate browser download of an .ics file
 */
export function downloadICS(opts: CalendarEventOptions, filename?: string): void {
  const icsContent = generateICS(opts);
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const cleanName = (filename || opts.title.replace(/[^a-zA-Z0-9_-]/g, "_") || "meeting") + ".ics";

  link.href = url;
  link.setAttribute("download", cleanName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate 1-click Google Calendar web creation URL
 */
export function getGoogleCalendarUrl(opts: CalendarEventOptions): string {
  const { start, end } = parseEventDates(opts.date, opts.time, opts.durationMinutes || 30);
  const dtStart = formatDateToICS(start);
  const dtEnd = formatDateToICS(end);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: opts.title,
    dates: `${dtStart}/${dtEnd}`,
  });

  if (opts.description) {
    params.set("details", opts.description);
  }
  if (opts.location) {
    params.set("location", opts.location);
  }
  if (opts.attendeeEmail) {
    params.set("add", opts.attendeeEmail);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
