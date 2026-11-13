function t(v) { return (v === undefined || v === null) ? "" : String(v).trim(); }
var APPT_TYPES = {
  checkin: "Parole check-in", drug: "Drug test", program: "Class or treatment", court: "Court date",
  interview: "Job interview", office: "Office visit (ID, Social Security, benefits)", work: "Work shift", other: "Something else"
};
var REPEATS = {
  none: "Does not repeat", weekly: "Every week", biweekly: "Every two weeks",
  monthlyDay: "Every month, same weekday (like the first Monday)", monthlyDate: "Every month, same date (like the 15th)"
};
var DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var DAY_CODES = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
var ORDINALS = { 1: "first", 2: "second", 3: "third", 4: "fourth", "-1": "last" };

var idSeq = 0;
function newId() { idSeq += 1; return "a" + Date.now().toString(36) + idSeq; }
function newAppt() { return { id: newId(), type: "checkin", title: "", date: "", time: "", duration: "60", place: "", bring: "", repeat: "none", until: "" }; }
function newState() { return { version: 1, keep: false, plain: true, google: false, appts: [] }; }
function mergeState(x) {
  var s = newState();
  if (!x || typeof x !== "object") return s;
  ["keep", "plain", "google"].forEach(function (k) { if (typeof x[k] === "boolean") s[k] = x[k]; });
  if (Array.isArray(x.appts)) s.appts = x.appts.map(function (a) { return Object.assign(newAppt(), a || {}); });
  return s;
}

/* ---------- Dates ---------- */
function pad(n) { return (n < 10 ? "0" : "") + n; }
function isoDate(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
function parseDate(s) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t(s)); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; }
function addDays(d, n) { var x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() + n); return x; }
function niceDate(d) { return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }); }
function niceTime(s) {
  var m = /^(\d{1,2}):(\d{2})/.exec(t(s)); if (!m) return "";
  var hr = +m[1], ap = hr >= 12 ? "PM" : "AM"; hr = hr % 12 || 12;
  return hr + ":" + m[2] + " " + ap;
}
function nthOfMonth(d) { var n = Math.ceil(d.getDate() / 7); return n >= 5 ? -1 : n; }
function nthWeekday(year, month, weekday, n) {
  if (n === -1) { var last = new Date(year, month + 1, 0); return addDays(last, -((last.getDay() - weekday + 7) % 7)); }
  var first = new Date(year, month, 1);
  var d = 1 + ((weekday - first.getDay() + 7) % 7) + (n - 1) * 7;
  var x = new Date(year, month, d);
  return x.getMonth() === month ? x : null;
}
function describeRepeat(a) {
  var d = parseDate(a.date); if (!d || a.repeat === "none") return "";
  var until = parseDate(a.until), tail = until ? ", until " + until.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "";
  if (a.repeat === "weekly") return "Every " + DAY_NAMES[d.getDay()] + tail;
  if (a.repeat === "biweekly") return "Every other " + DAY_NAMES[d.getDay()] + tail;
  if (a.repeat === "monthlyDay") return "Every month on the " + ORDINALS[nthOfMonth(d)] + " " + DAY_NAMES[d.getDay()] + tail;
  if (a.repeat === "monthlyDate") return "Every month on day " + d.getDate() + tail;
  return "";
}
function apptTitle(a) { return t(a.title) || APPT_TYPES[a.type] || "Appointment"; }

/* Every date this appointment falls on between two dates (inclusive). */
function occurrences(a, from, to) {
  var start = parseDate(a.date); if (!start) return [];
  var until = parseDate(a.until), out = [], i;
  var end = until && until < to ? until : to;
  if (a.repeat === "none") return (start >= from && start <= end) ? [start] : [];
  if (a.repeat === "weekly" || a.repeat === "biweekly") {
    var step = a.repeat === "weekly" ? 7 : 14;
    for (i = 0; i < 600; i++) { var d = addDays(start, i * step); if (d > end) break; if (d >= from) out.push(d); }
    return out;
  }
  var n = nthOfMonth(start), wd = start.getDay();
  for (i = 0; i < 240; i++) {
    var y = start.getFullYear(), m = start.getMonth() + i;
    var dd = a.repeat === "monthlyDay" ? nthWeekday(y + Math.floor(m / 12), m % 12, wd, n) : new Date(y, m, start.getDate());
    if (a.repeat === "monthlyDate" && dd && dd.getDate() !== start.getDate()) dd = null;
    if (!dd) continue;
    if (dd > end) break;
    if (dd >= from) out.push(dd);
  }
  return out;
}
function upcoming(s, from, days) {
  var to = addDays(from, days), list = [];
  s.appts.forEach(function (a) { occurrences(a, from, to).forEach(function (d) { list.push({ date: d, appt: a }); }); });
  return list.sort(function (x, y) { return x.date - y.date || t(x.appt.time).localeCompare(t(y.appt.time)); });
}

/* ---------- Calendar file (iCalendar, .ics) ---------- */
function icsEscape(s) { return String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n"); }
function icsFold(line) {
  var out = [], cur = line;
  while (cur.length > 73) { out.push(cur.slice(0, 73)); cur = " " + cur.slice(73); }
  out.push(cur); return out.join("\r\n");
}
function compact(dateStr, timeStr) {
  var d = t(dateStr).replace(/-/g, "");
  return t(timeStr) ? d + "T" + t(timeStr).replace(":", "").slice(0, 4) + "00" : d;
}
function endOf(a) {
  var d = parseDate(a.date); if (!d) return "";
  if (!t(a.time)) return isoDate(addDays(d, 1)).replace(/-/g, "");
  var m = /^(\d{1,2}):(\d{2})/.exec(a.time), mins = (+m[1]) * 60 + (+m[2]) + (parseInt(a.duration, 10) || 60);
  var e = addDays(d, Math.floor(mins / 1440)); mins = mins % 1440;
  return isoDate(e).replace(/-/g, "") + "T" + pad(Math.floor(mins / 60)) + pad(mins % 60) + "00";
}
function rrule(a) {
  var d = parseDate(a.date); if (!d || a.repeat === "none") return "";
  var r = "";
  if (a.repeat === "weekly") r = "FREQ=WEEKLY";
  else if (a.repeat === "biweekly") r = "FREQ=WEEKLY;INTERVAL=2";
  else if (a.repeat === "monthlyDay") r = "FREQ=MONTHLY;BYDAY=" + nthOfMonth(d) + DAY_CODES[d.getDay()];
  else if (a.repeat === "monthlyDate") r = "FREQ=MONTHLY;BYMONTHDAY=" + d.getDate();
  if (parseDate(a.until)) r += ";UNTIL=" + t(a.until).replace(/-/g, "") + "T235959";
  return r;
}
function visibleTitle(s, a) { return s.plain ? "Appointment" : apptTitle(a); }
function buildIcs(s) {
  var now = new Date(), stamp = now.getUTCFullYear() + pad(now.getUTCMonth() + 1) + pad(now.getUTCDate()) + "T" + pad(now.getUTCHours()) + pad(now.getUTCMinutes()) + pad(now.getUTCSeconds()) + "Z";
  var L = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Reentry Toolkit//Appointments//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH"];
  s.appts.filter(function (a) { return parseDate(a.date); }).forEach(function (a) {
    var timed = !!t(a.time);
    var desc = [s.plain ? apptTitle(a) : "", t(a.bring) ? "Bring: " + t(a.bring) : ""].filter(Boolean).join("\n");
    L.push("BEGIN:VEVENT", "UID:" + a.id + "@reentry-toolkit", "DTSTAMP:" + stamp,
      (timed ? "DTSTART:" : "DTSTART;VALUE=DATE:") + compact(a.date, a.time),
      (timed ? "DTEND:" : "DTEND;VALUE=DATE:") + endOf(a),
      "SUMMARY:" + icsEscape(visibleTitle(s, a)));
    if (t(a.place)) L.push("LOCATION:" + icsEscape(a.place));
    if (desc) L.push("DESCRIPTION:" + icsEscape(desc));
    var r = rrule(a); if (r) L.push("RRULE:" + r);
    [["-P1D", "Tomorrow"], ["-PT1H", "In one hour"]].forEach(function (al) {
      L.push("BEGIN:VALARM", "ACTION:DISPLAY", "TRIGGER:" + al[0], "DESCRIPTION:" + icsEscape(al[1] + ": " + visibleTitle(s, a)), "END:VALARM");
    });
    L.push("END:VEVENT");
  });
  L.push("END:VCALENDAR");
  return L.map(icsFold).join("\r\n") + "\r\n";
}
function googleLink(s, a) {
  if (!parseDate(a.date)) return "";
  var p = ["action=TEMPLATE", "text=" + encodeURIComponent(visibleTitle(s, a)), "dates=" + compact(a.date, a.time) + "/" + endOf(a)];
  if (t(a.place)) p.push("location=" + encodeURIComponent(a.place));
  var desc = [s.plain ? apptTitle(a) : "", t(a.bring) ? "Bring: " + t(a.bring) : ""].filter(Boolean).join("\n");
  if (desc) p.push("details=" + encodeURIComponent(desc));
  var r = rrule(a); if (r) p.push("recur=" + encodeURIComponent("RRULE:" + r));
  return "https://calendar.google.com/calendar/render?" + p.join("&");
}

/* ---------- Example (a made-up person; dates are set from today) ---------- */
function exampleWork() {
  var today = new Date(), s = newState(); s.plain = true;
  function next(weekday, minAhead) { var d = addDays(today, minAhead || 1); while (d.getDay() !== weekday) d = addDays(d, 1); return isoDate(d); }
  var nm = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  var firstMon = nthWeekday(nm.getFullYear(), nm.getMonth(), 1, 1);
  function A(o) { return Object.assign(newAppt(), o); }
  s.appts = [
    A({ type: "checkin", title: "Parole check-in", date: isoDate(firstMon), time: "09:00", place: "Probation and Parole office, Baton Rouge", bring: "ID and my latest pay stub", repeat: "monthlyDay" }),
    A({ type: "drug", title: "Drug test", date: next(3), time: "08:00", duration: "30", place: "Testing center on Main Street", bring: "ID", repeat: "biweekly" }),
    A({ type: "program", title: "Job readiness class", date: next(2), time: "18:00", duration: "90", place: "Reentry program office", bring: "Notebook", repeat: "weekly" }),
    A({ type: "office", title: "Social Security office", date: next(4), time: "10:00", place: "Social Security office, Baton Rouge", bring: "ID and birth certificate" }),
    A({ type: "interview", title: "Interview at Gulf Mechanical", date: isoDate(addDays(today, 5)), time: "14:00", place: "Gulf Mechanical", bring: "Copies of my resume, ID, and a pen" })
  ];
  return s;
}
