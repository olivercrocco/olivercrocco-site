var state = newState();
var step = 0, dirty = false;
var STEPS = [
  { id: "start", title: "Start" },
  { id: "appts", title: "Your appointments" },
  { id: "calendar", title: "Add to your phone" },
  { id: "print", title: "Print and save" }
];
var STORE_KEY = "reentry-appointments";
function h(s) { return String(s === undefined || s === null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function getPath(p) { return p.split(".").reduce(function (o, k) { return o == null ? undefined : o[k]; }, state); }
function setPath(p, v) { var k = p.split("."), o = state; for (var i = 0; i < k.length - 1; i++) o = o[k[i]]; o[k[k.length - 1]] = v; changed(); }
function changed() { dirty = true; persist(); }
function persist() {
  try { if (state.keep) localStorage.setItem(STORE_KEY, JSON.stringify(state)); else localStorage.removeItem(STORE_KEY); } catch (e) {}
}
function restore() {
  try { var raw = localStorage.getItem(STORE_KEY); if (raw) { var s = mergeState(JSON.parse(raw)); if (s.keep) { state = s; return true; } } } catch (e) {}
  return false;
}
function inp(path, type, extra) {
  return '<input type="' + (type || "text") + '" data-bind="' + path + '" value="' + h(getPath(path)) + '"' + (extra || "") + ">";
}
function field(label, path, type, extra, help) {
  return '<label class="field">' + h(label) + "</label>" + (help ? '<div class="help">' + help + "</div>" : "") + inp(path, type, extra);
}
function select(path, options, labels) {
  var v = getPath(path);
  return '<select data-bind="' + path + '" data-rerender="1">' + options.map(function (o, i) {
    return '<option value="' + h(o) + '"' + (v === o ? " selected" : "") + ">" + h(labels ? labels[i] : o) + "</option>";
  }).join("") + "</select>";
}
function renderProgress() {
  var pct = Math.round((step / (STEPS.length - 1)) * 100);
  document.getElementById("progress").innerHTML =
    '<span class="label">Step ' + (step + 1) + " of " + STEPS.length + ": " + h(STEPS[step].title) + "</span>" +
    '<div class="bar" aria-hidden="true"><div style="width:' + pct + '%"></div></div>' +
    '<select class="jump" data-action="jump" aria-label="Go to step">' +
    STEPS.map(function (s, i) { return '<option value="' + i + '"' + (i === step ? " selected" : "") + ">" + (i + 1) + ". " + h(s.title) + "</option>"; }).join("") + "</select>";
}
function nav() {
  return '<div class="nav no-print">' + (step > 0 ? '<button data-action="prev">Back</button>' : "<span></span>") +
    (step < STEPS.length - 1 ? '<button class="primary" data-action="next">Next</button>' : "<span></span>") + "</div>";
}
function upcomingHtml(days, max) {
  var list = upcoming(state, new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()), days).slice(0, max);
  if (!list.length) return '<p class="help">No appointments in the next ' + days + " days.</p>";
  return '<ul class="tight upcoming">' + list.map(function (o) {
    return "<li><b>" + h(niceDate(o.date)) + (t(o.appt.time) ? ", " + h(niceTime(o.appt.time)) : "") + "</b>: " + h(apptTitle(o.appt)) + (t(o.appt.place) ? " (" + h(o.appt.place) + ")" : "") + "</li>";
  }).join("") + "</ul>";
}

function stepStart() {
  return '<div class="card"><h2>Stay on track</h2>' +
    "<p>Keep your appointments in one place and add them to your phone's calendar with reminders.</p>" +
    '<div class="tip">Privacy: everything stays on this device. Nothing is sent over the internet unless you choose the Google Calendar option, which says so.</div>' +
    "<h3>Keeping your work</h3>" +
    '<label class="check"><input type="checkbox" data-action="keep"' + (state.keep ? " checked" : "") + "> <span>Keep my work on this device. Only check this on your own phone or computer, not a shared one.</span></label>" +
    '<div class="help">If you leave this unchecked, use \u201CSave my work\u201D on the last step to keep a file you can open next time.</div>' +
    '<div class="actions"><button class="primary" data-action="next">Start</button><button data-action="tryExample">Try it with an example</button><button data-action="openFile">Open saved work</button>' +
    '<input type="file" id="loadFile" accept=".json,application/json" class="hidden"></div><div id="loadMsg"></div></div>';
}
function apptCard(a, i) {
  var p = "appts." + i, rep = describeRepeat(a);
  return '<div class="entry"><div class="entry-head"><strong>' + h(apptTitle(a)) + "</strong>" +
    '<button class="small danger" data-action="removeAppt" data-i="' + i + '">Remove</button></div>' +
    '<label class="field">What kind of appointment?</label>' + select(p + ".type", Object.keys(APPT_TYPES), Object.keys(APPT_TYPES).map(function (k) { return APPT_TYPES[k]; })) +
    field("What to call it (optional)", p + ".title", "text", ' placeholder="' + h(APPT_TYPES[a.type]) + '"') +
    '<div class="row"><div>' + field("Date", p + ".date", "date") + "</div><div>" + field("Time (optional)", p + ".time", "time") + "</div></div>" +
    field("Where", p + ".place", "text", ' placeholder="Address or name of the place"') +
    field("What to bring (optional)", p + ".bring", "text", ' placeholder="ID, pay stub, paperwork"') +
    '<div class="row"><div><label class="field">Does it repeat?</label>' + select(p + ".repeat", Object.keys(REPEATS), Object.keys(REPEATS).map(function (k) { return REPEATS[k]; })) + "</div>" +
    (a.repeat !== "none" ? "<div>" + field("Repeat until (optional)", p + ".until", "date") + "</div>" : "") + "</div>" +
    (rep ? '<p class="help">' + h(rep) + ".</p>" : "") + "</div>";
}
function stepAppts() {
  var html = '<div class="card"><h2>Your appointments</h2>' +
    '<div class="help">Add each appointment you know about: check-ins, drug tests, classes, court dates, interviews, and office visits. For one that repeats, like a check-in every month, add it once and choose how it repeats.</div>';
  if (state.appts.length) html += "<h3>Coming up in the next two weeks</h3>" + upcomingHtml(14, 10);
  state.appts.forEach(function (a, i) { html += apptCard(a, i); });
  if (!state.appts.length) html += '<p class="help">No appointments yet.</p>';
  html += '<div class="actions"><button data-action="addAppt">Add an appointment</button></div>';
  return html + nav() + "</div>";
}
function stepCalendar() {
  var ready = state.appts.filter(function (a) { return parseDate(a.date); });
  var html = '<div class="card"><h2>Add to your phone</h2>';
  if (!ready.length) return html + '<div class="msg warn">Add at least one appointment with a date first.</div>' + nav() + "</div>";
  html += '<div class="help">This makes a calendar file with your ' + ready.length + " appointment" + (ready.length === 1 ? "" : "s") + ". Your phone's calendar will then remind you the day before and one hour before, even if you never open this page again.</div>" +
    '<label class="check"><input type="checkbox" data-action="plain"' + (state.plain ? " checked" : "") + "> <span>Use plain titles. Your phone will show \u201CAppointment\u201D instead of \u201CParole check-in\u201D or \u201CDrug test,\u201D so the details do not show on your lock screen. The full name is still inside the appointment when you open it.</span></label>" +
    '<div class="actions"><button class="primary" data-action="ics">Add to my phone\u2019s calendar</button></div>' +
    "<h3>What happens next</h3><ul class=\"tight\">" +
    "<li>On an iPhone: open the file, then tap \u201CAdd All.\u201D</li>" +
    "<li>On a Samsung phone: open the file and choose the Calendar app.</li>" +
    "<li>On other Android phones: if the file does not open, use the Google Calendar option below.</li>" +
    "<li>If an appointment changes, change it in your phone\u2019s calendar. Adding the file again can make a second copy.</li></ul>" +
    "<h3>Google Calendar (optional)</h3>" +
    '<label class="check"><input type="checkbox" data-action="google"' + (state.google ? " checked" : "") + "> <span>Show a Google Calendar button for each appointment. Each button sends that one appointment to Google, so it leaves this device.</span></label>";
  if (state.google) {
    html += '<ul class="tight">' + ready.map(function (a) {
      return "<li>" + h(apptTitle(a)) + ' <a class="gbtn" target="_blank" rel="noopener" href="' + h(googleLink(state, a)) + '">Add to Google Calendar</a></li>';
    }).join("") + "</ul>";
  }
  html += '<div class="tip">No phone yet? The last step prints a list of your appointments to keep on paper.</div>';
  return html + nav() + "</div>";
}
function printAreaHtml() {
  var today = new Date(); today = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  var html = '<div class="print-area"><p class="pa-title">My appointments</p><p>Printed ' + h(today.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })) + "</p>";
  html += "<h4>Next 30 days</h4>" + upcomingHtml(30, 40);
  var rep = state.appts.filter(function (a) { return describeRepeat(a); });
  if (rep.length) html += "<h4>Repeating appointments</h4><ul class=\"tight\">" + rep.map(function (a) {
    return "<li>" + h(apptTitle(a)) + ": " + h(describeRepeat(a)) + (t(a.time) ? ", " + h(niceTime(a.time)) : "") + (t(a.place) ? " (" + h(a.place) + ")" : "") + (t(a.bring) ? ". Bring " + h(a.bring) : "") + "</li>";
  }).join("") + "</ul>";
  return html + "</div>";
}
function stepPrint() {
  return '<div class="card"><h2>Print and save</h2>' +
    '<div class="help">Print a copy to keep with your papers, or save your work to open again next time.</div>' +
    '<div class="actions no-print"><button class="primary" data-action="print">Print</button><button data-action="save">Save my work</button><button class="danger" data-action="clear">Clear everything</button></div>' +
    '<div class="tip no-print">On a shared computer, use \u201CClear everything\u201D when you finish, and delete any file you saved.</div>' +
    printAreaHtml() + nav() + "</div>";
}

/* ----- Read aloud ----- */
var canSpeak = "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";
var speaking = false;
function stopSpeaking() { if (canSpeak) window.speechSynthesis.cancel(); speaking = false; var b = document.getElementById("speakBtn"); if (b) b.textContent = "\uD83D\uDD0A Read this to me"; }
function speakCard() {
  if (!canSpeak) return;
  if (speaking) { stopSpeaking(); return; }
  var card = document.querySelector("#app .card"), parts = [];
  card.querySelectorAll("h2, h3, p, li, .help, .tip, label.field, label.check span, .msg, .big > div").forEach(function (el) {
    if (el.closest("#speakBtn, .print-area")) return;
    var x = (el.innerText || "").replace(/\s+/g, " ").trim();
    if (x && parts.indexOf(x) === -1) parts.push(x);
  });
  window.speechSynthesis.cancel();
  var u = new SpeechSynthesisUtterance(parts.join(". ").replace(/\.\./g, "."));
  var voices = window.speechSynthesis.getVoices() || [];
  var v = voices.filter(function (x) { return /^en(-|_)US/i.test(x.lang) && x.localService; })[0] || voices.filter(function (x) { return /^en(-|_)US/i.test(x.lang); })[0];
  if (v) u.voice = v;
  u.rate = 0.9;
  u.onend = u.onerror = function () { speaking = false; var b = document.getElementById("speakBtn"); if (b) b.textContent = "\uD83D\uDD0A Read this to me"; };
  window.speechSynthesis.speak(u); speaking = true;
  document.getElementById("speakBtn").textContent = "\u25A0 Stop reading";
}
function addSpeakButton() {
  if (!canSpeak) return;
  var h2 = document.querySelector("#app .card h2"); if (!h2) return;
  var b = document.createElement("button");
  b.id = "speakBtn"; b.className = "small speak no-print"; b.setAttribute("data-action", "speak");
  b.textContent = "\uD83D\uDD0A Read this to me";
  h2.insertAdjacentElement("afterend", b);
}

/* ----- Step examples: fill this step's boxes with a made-up person's answers (undoable) ----- */
var filledSteps = {};
function stepKeys(id) { return ({ appts: ["appts"] })[id] || null; }
function getP(o, p) { return p.split(".").reduce(function (x, k) { return x == null ? undefined : x[k]; }, o); }
function setP(o, p, v) { var k = p.split("."), x = o; for (var i = 0; i < k.length - 1; i++) x = x[k[i]]; x[k[k.length - 1]] = v; }
function cloneV(v) { return v === undefined ? v : JSON.parse(JSON.stringify(v)); }
function fillStepExample() {
  var id = STEPS[step].id, keys = stepKeys(id); if (!keys) return;
  if (filledSteps[id]) {
    var saved = filledSteps[id];
    keys.forEach(function (p, i) { setP(state, p, cloneV(saved[i])); });
    delete filledSteps[id]; changed(); rerender(); return;
  }
  var blank = newState(), E = exampleWork();
  var own = keys.some(function (p) { return JSON.stringify(getP(state, p)) !== JSON.stringify(getP(blank, p)); });
  if (own && !confirm("Fill this step with the example? Your own entries on this step will be replaced for now. You can bring them back with \u201CRemove the example.\u201D")) return;
  filledSteps[id] = keys.map(function (p) { return cloneV(getP(state, p)); });
  keys.forEach(function (p) { setP(state, p, cloneV(getP(E, p))); });
  changed(); rerender();
}
function addExampleButton() {
  if (exampleMode) return;
  var id = STEPS[step].id; if (!stepKeys(id)) return;
  var anchor = document.getElementById("speakBtn") || document.querySelector("#app .card h2"); if (!anchor) return;
  var b = document.createElement("button");
  b.className = "small speak no-print"; b.setAttribute("data-action", "toggleStepExample");
  b.style.marginLeft = anchor.id === "speakBtn" ? "8px" : "0";
  b.textContent = filledSteps[id] ? "Remove the example" : "See an example";
  anchor.insertAdjacentElement("afterend", b);
  if (filledSteps[id]) {
    var note = document.createElement("div");
    note.className = "msg warn no-print";
    note.textContent = "Example entries from a made-up person are filled in below. Change them to your own, or tap \u201CRemove the example\u201D to bring back what you had.";
    b.insertAdjacentElement("afterend", note);
  }
}

/* ----- Example mode ----- */
var exampleMode = false;
function exampleBanner() {
  if (!exampleMode) return;
  document.getElementById("app").insertAdjacentHTML("afterbegin",
    '<div class="msg warn no-print" style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between">' +
    "<span>You are looking at a made-up example. Use Back and Next to see every step filled in, and change anything you like.</span>" +
    '<button class="small" data-action="endExample">Start my own</button></div>');
}
function startExample() {
  if (dirty && !confirm("Replace what you entered with the example? Save your work first if you want to keep it.")) return;
  var keep = state.keep; state = exampleWork(); state.keep = false; exampleMode = true; filledSteps = {}; dirty = false;
  if (keep) { try { localStorage.removeItem(STORE_KEY); } catch (e) {} }
  goTo(1);
}
function endExample() {
  if (!confirm("Clear the example and start your own?")) return;
  state = newState(); exampleMode = false; filledSteps = {}; dirty = false; persist(); goTo(1);
}

function render() {
  renderProgress();
  var id = STEPS[step].id, html;
  if (id === "start") html = stepStart();
  else if (id === "appts") html = stepAppts();
  else if (id === "calendar") html = stepCalendar();
  else html = stepPrint();
  document.getElementById("app").innerHTML = html;
  addSpeakButton();
  addExampleButton();
  exampleBanner();
}
function rerender() { var y = window.scrollY; render(); window.scrollTo(0, y); }
function goTo(n) { stopSpeaking(); step = Math.max(0, Math.min(STEPS.length - 1, n)); render(); window.scrollTo(0, 0); }
function download(data, name, mime) {
  var url = URL.createObjectURL(new Blob([data], { type: mime }));
  var a = document.createElement("a"); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
}

document.addEventListener("input", function (ev) {
  var p = ev.target.getAttribute("data-bind");
  if (p && ev.target.tagName !== "SELECT") setPath(p, ev.target.value);
});
document.addEventListener("change", function (ev) {
  var el = ev.target, a = el.getAttribute("data-action");
  if (a === "jump") { goTo(parseInt(el.value, 10)); return; }
  if (a === "keep") { state.keep = el.checked; persist(); return; }
  if (a === "plain") { state.plain = el.checked; changed(); return; }
  if (a === "google") { state.google = el.checked; changed(); rerender(); return; }
  var p = el.getAttribute("data-bind");
  if (p && el.tagName === "SELECT") { setPath(p, el.value); if (el.getAttribute("data-rerender")) rerender(); return; }
  if (p && (el.type === "date" || el.type === "time")) { setPath(p, el.value); rerender(); return; }
  if (el.id === "loadFile" && el.files && el.files[0]) {
    var fr = new FileReader();
    fr.onload = function () {
      try { var keep = state.keep; state = mergeState(JSON.parse(fr.result)); state.keep = keep; exampleMode = false; filledSteps = {}; dirty = false; persist(); goTo(1); }
      catch (e) { document.getElementById("loadMsg").innerHTML = '<div class="msg bad">That file could not be opened. Choose a file saved by this tool.</div>'; }
    };
    fr.readAsText(el.files[0]);
  }
});
document.addEventListener("click", function (ev) {
  var el = ev.target.closest("[data-action]");
  if (!el || el.tagName === "SELECT" || el.tagName === "INPUT") return;
  var i = parseInt(el.getAttribute("data-i"), 10);
  switch (el.getAttribute("data-action")) {
    case "next": goTo(step + 1); break;
    case "prev": goTo(step - 1); break;
    case "speak": speakCard(); break;
    case "openFile": document.getElementById("loadFile").click(); break;
    case "tryExample": startExample(); break;
    case "endExample": endExample(); break;
    case "toggleStepExample": fillStepExample(); break;
    case "addAppt": state.appts.push(newAppt()); changed(); rerender(); break;
    case "removeAppt": if (confirm("Remove this appointment?")) { state.appts.splice(i, 1); changed(); rerender(); } break;
    case "ics": download(buildIcs(state), "My appointments.ics", "text/calendar;charset=utf-8"); break;
    case "print": window.print(); break;
    case "save": download(JSON.stringify(state, null, 2), "Appointments (saved work).json", "application/json"); dirty = false; break;
    case "clear":
      if (confirm("Clear everything you entered on this device? Save your work first if you want to keep it.")) {
        state = newState(); exampleMode = false; filledSteps = {}; dirty = false;
        try { localStorage.removeItem(STORE_KEY); } catch (e) {}
        goTo(0);
      }
      break;
  }
});
window.addEventListener("beforeunload", function (ev) { if (dirty && !state.keep) { ev.preventDefault(); ev.returnValue = ""; } });
restore();
render();
