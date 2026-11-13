var state = newState();
var step = 0, dirty = false;
var STEPS = [
  { id: "start", title: "Start" },
  { id: "jobs", title: "Your job search" },
  { id: "print", title: "Print and save" }
];
var STORE_KEY = "reentry-job-search-log";
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
function stepStart() {
  return '<div class="card"><h2>Keep track of your job search</h2>' +
    "<p>Add a line for every job you apply for. The log shows how many you applied for this week, reminds you who to follow up with, and prints a record you can show your parole officer or program if they ask for one.</p>" +
    '<div class="tip">Privacy: everything stays on this device. Nothing is sent over the internet.</div>' +
    "<h3>Keeping your work</h3>" +
    '<label class="check"><input type="checkbox" data-action="keep"' + (state.keep ? " checked" : "") + "> <span>Keep my work on this device. Only check this on your own phone or computer, not a shared one.</span></label>" +
    '<div class="help">If you leave this unchecked, use \u201CSave my work\u201D on the last step to keep a file you can open next time.</div>' +
    '<div class="actions"><button class="primary" data-action="next">Start</button><button data-action="tryExample">Try it with an example</button><button data-action="openFile">Open saved work</button>' +
    '<input type="file" id="loadFile" accept=".json,application/json" class="hidden"></div><div id="loadMsg"></div></div>';
}
function jobCard(j, i) {
  var p = "jobs." + i;
  var html = '<div class="entry"><div class="entry-head"><strong>' + h(t(j.employer) || "New application") + (t(j.job) ? ": " + h(j.job) : "") + "</strong>" +
    '<button class="small danger" data-action="removeJob" data-i="' + i + '">Remove</button></div>' +
    '<div class="row"><div>' + field("Date you applied", p + ".date", "date") + "</div><div>" + '<label class="field">How you applied</label>' + select(p + ".how", HOW) + "</div></div>" +
    '<div class="row"><div>' + field("Employer", p + ".employer") + "</div><div>" + field("Job", p + ".job") + "</div></div>" +
    field("Person you talked to (optional)", p + ".contact") +
    '<div class="row"><div><label class="field">Where it stands</label>' + select(p + ".status", STATUSES) + "</div>" +
    "<div>" + field("Follow up on (optional)", p + ".followUp", "date") + "</div></div>";
  if (j.status === "Interview scheduled") {
    html += '<div class="row"><div>' + field("Interview date", p + ".interviewDate", "date") + "</div><div>" + field("Interview time", p + ".interviewTime", "time") + "</div></div>" +
      '<div class="actions"><button class="small" data-action="interviewIcs" data-i="' + i + '"' + (parseDate(j.interviewDate) ? "" : " disabled") + ">Add this interview to my phone\u2019s calendar</button></div>" +
      '<p class="help">This makes a calendar file with a reminder the day before and one hour before. Open it on your phone to add it.</p>';
  }
  html += field("Notes (optional)", p + ".notes", "text", ' placeholder="What happened, who to call back"');
  return html + "</div>";
}
function stepJobs() {
  var sum = jobSummary(state, new Date());
  var html = '<div class="card"><h2>Your job search</h2>' +
    '<div class="help">Add a line for every job you apply for. It helps you remember who to call back, and it gives you a record to show your parole officer or program if they ask for one.</div>' +
    '<div class="big"><div><div class="n">' + sum.thisWeek + '</div><div class="l">applications this week (' + h(sum.weekLabel) + ")</div></div>" +
    '<div><div class="n">' + sum.total + '</div><div class="l">applications in all</div></div>' +
    '<div><div class="n">' + sum.interviews + '</div><div class="l">interviews scheduled</div></div></div>';
  if (sum.due.length) html += '<div class="msg warn">Time to follow up with: ' + sum.due.map(function (j) { return h(j.employer); }).join(", ") + ".</div>";
  state.jobs.forEach(function (j, i) { html += jobCard(j, i); });
  if (!state.jobs.length) html += '<p class="help">No applications yet.</p>';
  html += '<div class="actions"><button data-action="addJob">Add an application</button></div>';
  return html + nav() + "</div>";
}
function printAreaHtml() {
  var today = new Date();
  var html = '<div class="print-area"><p class="pa-title">My job search log</p><p>Printed ' + h(today.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })) + "</p>";
  var jobs = state.jobs.filter(function (j) { return t(j.employer) || t(j.job); }).slice().sort(function (x, y) { return t(x.date).localeCompare(t(y.date)); });
  if (!jobs.length) return html + "<p>No applications yet.</p></div>";
  html += '<table class="log"><thead><tr><th>Date</th><th>Employer</th><th>Job</th><th>How</th><th>Contact</th><th>Status</th></tr></thead><tbody>' +
    jobs.map(function (j) {
      var d = parseDate(j.date);
      return "<tr><td>" + h(d ? d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "") + "</td><td>" + h(j.employer) + "</td><td>" + h(j.job) + "</td><td>" + h(j.how) + "</td><td>" + h(j.contact) + "</td><td>" + h(j.status) + "</td></tr>";
    }).join("") + "</tbody></table>";
  return html + "</div>";
}
function stepPrint() {
  return '<div class="card"><h2>Print and save</h2>' +
    '<div class="help">Print your log to keep with your papers or to show your parole officer or program, or save your work to open again next time.</div>' +
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
function stepKeys(id) { return ({ jobs: ["jobs"] })[id] || null; }
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
  else if (id === "jobs") html = stepJobs();
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
    case "addJob": state.jobs.unshift(newJob()); changed(); rerender(); break;
    case "removeJob": if (confirm("Remove this application?")) { state.jobs.splice(i, 1); changed(); rerender(); } break;
    case "interviewIcs": var job = state.jobs[i]; download(interviewIcs(job), "Interview at " + (t(job.employer) || "employer").replace(/[^A-Za-z0-9 .'-]/g, "") + ".ics", "text/calendar;charset=utf-8"); break;
    case "print": window.print(); break;
    case "save": download(JSON.stringify(state, null, 2), "Job Search Log (saved work).json", "application/json"); dirty = false; break;
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
