var state = newState();
/* ----- Step examples: fill this step's boxes with a made-up person's answers (undoable) ----- */
var exampleOpen = false;
var filledSteps = {};
function getP(o, p) { return p.split(".").reduce(function (x, k) { return x == null ? undefined : x[k]; }, o); }
function setP(o, p, v) { var k = p.split("."), x = o; for (var i = 0; i < k.length - 1; i++) x = x[k[i]]; x[k[k.length - 1]] = v; }
function cloneV(v) { return v === undefined ? v : JSON.parse(JSON.stringify(v)); }
function fillStepExample() {
  var id = STEPS[step].id, keys = stepKeys(id);
  if (!keys) return;
  if (filledSteps[id]) {
    var saved = filledSteps[id];
    keys.forEach(function (p, i) { setP(state, p, cloneV(saved[i])); });
    delete filledSteps[id];
    dirty = true; rerender(); return;
  }
  var blank = newState(), E = exampleWork();
  var own = keys.some(function (p) { return JSON.stringify(getP(state, p)) !== JSON.stringify(getP(blank, p)); });
  if (own && !confirm("Fill this step with the example? Your own answers on this step will be replaced for now. You can bring them back with \u201CRemove the example.\u201D")) return;
  filledSteps[id] = keys.map(function (p) { return cloneV(getP(state, p)); });
  keys.forEach(function (p) { setP(state, p, cloneV(getP(E, p))); });
  dirty = true; rerender();
}
function addExampleButton() {
  if (exampleMode) return;
  var id = STEPS[step].id;
  if (!stepKeys(id)) return;
  var h2 = document.querySelector("#app .card h2");
  if (!h2) return;
  var anchor = document.getElementById("speakBtn") || h2;
  var b = document.createElement("button");
  b.className = "small speak no-print";
  b.setAttribute("data-action", "toggleStepExample");
  b.style.marginLeft = anchor.id === "speakBtn" ? "8px" : "0";
  b.textContent = filledSteps[id] ? "Remove the example" : "See an example";
  anchor.insertAdjacentElement("afterend", b);
  if (filledSteps[id]) {
    var note = document.createElement("div");
    note.className = "msg warn no-print";
    note.textContent = "Example answers from a made-up person are filled in below. Change them to your own, or tap \u201CRemove the example\u201D to bring back what you had.";
    b.insertAdjacentElement("afterend", note);
  }
}

function stepKeys(id) {
  if (id === "me") return ["me"];
  if (id === "growth") return ["record"];
  if (id === "details") return state.type ? [state.type] : null;
  if (id === "letter") return state.type ? ["letters." + state.type] : null;
  return null;
}

/* ----- Example mode ----- */
var exampleMode = false; filledSteps = {};
function exampleBanner() {
  if (!exampleMode) return;
  document.getElementById("app").insertAdjacentHTML("afterbegin",
    '<div class="msg warn no-print" style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between">' +
    "<span>You are looking at a made-up example. Use Back and Next to see every step filled in, and change anything you like.</span>" +
    '<button class="small" data-action="endExample">Start my own</button></div>');
}
function startExample(target) {
  if (dirty && !confirm("Replace what you entered with the example? Save your work first if you want to keep it.")) return;
  state = exampleWork(); exampleMode = true; filledSteps = {}; dirty = false; goTo(target);
}
function endExample() {
  if (!confirm("Clear the example and start your own?")) return;
  state = newState(); exampleMode = false; filledSteps = {}; dirty = false; goTo(1);
}

var step = 0, dirty = false;
var STEPS = [
  { id: "start", title: "Choose a letter" },
  { id: "me", title: "About you" },
  { id: "growth", title: "Your record and your growth" },
  { id: "details", title: "About this letter" },
  { id: "letter", title: "Your letter" }
];
function h(s) { return String(s === undefined || s === null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function getPath(p) { return p.split(".").reduce(function (o, k) { return o == null ? undefined : o[k]; }, state); }
function setPath(p, v) { var k = p.split("."), o = state; for (var i = 0; i < k.length - 1; i++) o = o[k[i]]; o[k[k.length - 1]] = v; dirty = true; }
function field(label, path, opts) {
  opts = opts || {};
  var id = "f_" + path.replace(/\./g, "_");
  return '<label class="field" for="' + id + '">' + h(label) + "</label>" + (opts.help ? '<div class="help">' + opts.help + "</div>" : "") +
    (opts.area ? '<textarea id="' + id + '" data-bind="' + path + '" placeholder="' + h(opts.ph || "") + '">' + h(getPath(path)) + "</textarea>"
      : '<input type="text" id="' + id + '" data-bind="' + path + '" value="' + h(getPath(path)) + '" placeholder="' + h(opts.ph || "") + '"' + (opts.mode ? ' inputmode="' + opts.mode + '"' : "") + ">");
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
function needType() { return '<div class="msg warn">Choose which letter you are writing on the first step.</div>'; }

function stepStart() {
  return '<div class="card"><h2>Which letter do you need?</h2>' +
    '<div class="help">Pick one. You can come back and write another one later using the same answers.</div>' +
    '<div class="types">' + Object.keys(TYPES).map(function (k) {
      return '<label class="type' + (state.type === k ? " on" : "") + '"><input type="radio" name="type" value="' + k + '" data-action="type"' + (state.type === k ? " checked" : "") +
        "><span><b>" + h(TYPES[k].label) + '</b><span class="sm">' + h(TYPES[k].note) + "</span></span></label>";
    }).join("") + "</div>" +
    '<div class="tip">Privacy: everything stays on this device. Nothing is sent over the internet, and nothing is saved unless you choose to save it. Every sentence in a letter like this should be true and something you can stand behind.</div>' +
    "<h3>Already made a resume?</h3>" +
    '<div class="help">If you saved your work in the Resume Builder, open that file and the tool will fill in your contact details and start your list of accomplishments.</div>' +
    '<div class="actions"><button class="primary" data-action="next">Start</button><button data-action="openResume">Use my resume file</button><button data-action="openFile">Open saved letters</button><button data-action="tryExample">Try it with an example</button>' +
    '<input type="file" id="resumeFile" accept=".json,application/json" class="hidden"><input type="file" id="loadFile" accept=".json,application/json" class="hidden"></div>' +
    '<div id="loadMsg"></div></div>';
}
function stepMe() {
  return '<div class="card"><h2>About you</h2><div class="help">This is about you, the person writing the letter, not the person you are writing to. It goes at the top of your letter so they can reach you.</div>' +
    field("Your full name", "me.name") +
    field("Your street address (optional)", "me.street", { help: "Leave this blank if you do not have a stable address yet." }) +
    field("Your city and state", "me.cityState", { ph: "Baton Rouge, LA" }) +
    '<div class="row"><div>' + field("Your phone", "me.phone", { mode: "tel" }) + "</div><div>" + field("Your email", "me.email", { mode: "email" }) + "</div></div>" +
    nav() + "</div>";
}
function stepGrowth() {
  var r = state.record;
  return '<div class="card"><h2>Your record and your growth</h2>' +
    '<div class="help">These answers go into every letter. Keep the record part short and plain. Most of the letter should be about what you have done since.</div>' +
    "<h3>Your record</h3>" +
    field("How to describe it", "record.what", { help: "Use plain, general words. You do not need to give the details of the case.", ph: "a felony conviction" }) +
    '<div class="row"><div>' + field("Year of the conviction (optional)", "record.year", { mode: "numeric", ph: "2004" }) + "</div>" +
    "<div>" + field("When you came home (optional)", "record.home", { ph: "December 2025" }) + "</div></div>" +
    "<h3>What you did with the time</h3>" +
    '<div class="help">Tap a starting sentence to add it, then fill in the blanks and change the words so they are yours.</div>' +
    '<div class="quick">' + GROWTH_STARTERS.map(function (st, k) { return '<button class="small" data-action="starter" data-k="' + k + '">+ ' + h(st) + "</button>"; }).join("") + "</div>" +
    '<textarea id="f_record_growth" data-bind="record.growth" aria-label="What you did with the time">' + h(r.growth) + "</textarea>" +
    "<h3>Where you are now</h3>" +
    '<div class="row"><div>' + field("Job title (if working)", "record.jobTitle", { ph: "HVAC Technician" }) + "</div>" +
    "<div>" + field("Where you work", "record.jobPlace") + "</div></div>" +
    '<div class="row"><div>' + field("Working there since (optional)", "record.jobSince", { ph: "March 2026" }) + "</div>" +
    "<div>" + field("Monthly income (optional)", "record.income", { mode: "decimal", ph: "2200", help: "Mostly for landlord letters." }) + "</div></div>" +
    field("People or programs supporting you (optional)", "record.support", { ph: "my case manager at a reentry program and my family" }) +
    '<label class="check"><input type="checkbox" data-action="supervision"' + (r.supervision ? " checked" : "") + "> <span>I am meeting all the requirements of my supervision. (Check only if it is true. The letter will say so.)</span></label>" +
    nav() + "</div>";
}
function stepDetails() {
  if (!state.type) return '<div class="card"><h2>About this letter</h2>' + needType() + nav() + "</div>";
  var html = '<div class="card"><h2>About this letter</h2><div class="help">' + h(TYPES[state.type].label) + ". Fill in what you know. Leave a box blank if it does not apply.</div>";
  if (state.type === "landlord") {
    html += field("Landlord or manager's name (optional)", "landlord.to", { ph: "Ms. Johnson" }) +
      field("Property or address", "landlord.property", { ph: "Oak Street Apartments, Unit 4B" }) +
      field("Monthly rent (optional)", "landlord.rent", { mode: "decimal", ph: "750" }) +
      field("What you can provide (optional)", "landlord.offer", { ph: "pay stubs, two references, and a letter from my case manager" });
  } else if (state.type === "employer") {
    html += field("Hiring manager's name (optional)", "employer.to", { ph: "Mr. Davis" }) +
      field("Company", "employer.company") + field("Position", "employer.position", { ph: "HVAC Technician" }) +
      field("How the job relates to your record (optional)", "employer.related", { area: true,
        help: "Only if it is true and fair to say. For example, how long ago it was, or that it does not involve the duties of this job.",
        ph: "The conviction is more than 20 years old and is not related to the duties of this job." });
  } else if (state.type === "license") {
    html += field("Who to address (optional)", "license.to", { ph: "Members of the Board" }) +
      field("Name of the board", "license.board", { ph: "Louisiana Board of Barber Examiners" }) +
      field("License you are applying for", "license.license", { ph: "Barber license" }) +
      field("Your training", "license.training", { area: true, ph: "I completed 1,500 hours of barber training through ___ in ___." }) +
      field("Exam (optional)", "license.exam", { ph: "I passed the written exam in ___." });
  } else {
    html += field("Who you are asking", "reference.to", { ph: "Mr. Thomas" }) +
      field("How they know you", "reference.context", { ph: "the welding program, where you were my instructor for two years" }) +
      field("What you are applying for", "reference.purpose", { ph: "a job as a welder at Gulf Fabrication" }) +
      field("What their letter could mention (optional)", "reference.mention", { ph: "my work habits, my reliability, and the progress you saw" }) +
      field("Who the letter should be addressed to (optional)", "reference.recipient", { ph: "the hiring manager at Gulf Fabrication" }) +
      field("When you need it (optional)", "reference.deadline", { ph: "December 1" });
  }
  return html + nav() + "</div>";
}
function stepLetter() {
  if (!state.type) return '<div class="card"><h2>Your letter</h2>' + needType() + nav() + "</div>";
  var text = state.letters[state.type];
  var html = '<div class="card"><h2>Your letter</h2>' +
    '<div class="help">' + h(TYPES[state.type].label) + '. Tap “Write a draft for me,” then read it and change anything that does not sound like you or is not true.</div>' +
    '<div class="actions no-print"><button class="primary" data-action="draft">Write a draft for me</button><button data-action="readLetter">Read it to me</button></div>' +
    '<textarea id="letterText" class="letter" data-bind="letters.' + state.type + '" placeholder="Your letter will appear here. You can also write your own.">' + h(text) + "</textarea>" +
    '<div id="checks">' + letterChecks(state).map(function (m) { return '<div class="msg ' + m.level + '">' + h(m.text) + "</div>"; }).join("") + "</div>" +
    "<h3>" + (state.type === "reference" ? "Give them" : "Send these with your letter") + '</h3><ul class="tight">' + DOCS[state.type].map(function (d) { return "<li>" + h(d) + "</li>"; }).join("") + "</ul>" +
    '<div class="tip">If you can, ask staff or someone you trust to read your letter before you send it. For a licensing board or anything legal, ask whether a lawyer or legal aid office should look at it too.</div>' +
    '<div class="actions no-print"><button class="primary" data-action="download">Download Word file</button><button data-action="print">Print or save as PDF</button><button data-action="copy">Copy text</button></div>' +
    '<div id="copyMsg" class="no-print"></div>' +
    '<div class="actions no-print"><button data-action="another">Write a different letter</button><button data-action="save">Save my letters</button><button class="danger" data-action="clear">Clear everything</button></div>' +
    '<div class="letter-print">' + h(text) + "</div>";
  return html + nav() + "</div>";
}

/* ----- Read aloud ----- */
var canSpeak = "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";
var speaking = false;
function say(text) {
  if (!canSpeak) return;
  window.speechSynthesis.cancel();
  var u = new SpeechSynthesisUtterance(text);
  var voices = window.speechSynthesis.getVoices() || [];
  var v = voices.filter(function (x) { return /^en(-|_)US/i.test(x.lang) && x.localService; })[0] || voices.filter(function (x) { return /^en(-|_)US/i.test(x.lang); })[0];
  if (v) u.voice = v;
  u.rate = 0.9;
  u.onend = u.onerror = function () { speaking = false; var b = document.getElementById("speakBtn"); if (b) b.textContent = "🔊 Read this to me"; };
  window.speechSynthesis.speak(u);
  speaking = true;
}
function stopSpeaking() { if (canSpeak) window.speechSynthesis.cancel(); speaking = false; var b = document.getElementById("speakBtn"); if (b) b.textContent = "🔊 Read this to me"; }
function speakCard() {
  if (speaking) { stopSpeaking(); return; }
  var card = document.querySelector("#app .card"), parts = [];
  card.querySelectorAll("h2, h3, p, li, .help, .tip, label.field, .type b, .type .sm, label.check span, .msg").forEach(function (el) {
    if (el.closest(".example-box, #speakBtn, .letter-print")) return;
    var x = (el.innerText || "").replace(/\s+/g, " ").trim();
    if (x && parts.indexOf(x) === -1) parts.push(x);
  });
  say(parts.join(". ").replace(/\.\./g, "."));
  document.getElementById("speakBtn").textContent = "■ Stop reading";
}
function addSpeakButton() {
  if (!canSpeak) return;
  var h2 = document.querySelector("#app .card h2");
  if (!h2) return;
  var b = document.createElement("button");
  b.id = "speakBtn"; b.className = "small speak no-print"; b.setAttribute("data-action", "speak");
  b.textContent = "🔊 Read this to me";
  h2.insertAdjacentElement("afterend", b);
}

function render() {
  renderProgress();
  var id = STEPS[step].id, html;
  if (id === "start") html = stepStart();
  else if (id === "me") html = stepMe();
  else if (id === "growth") html = stepGrowth();
  else if (id === "details") html = stepDetails();
  else html = stepLetter();
  document.getElementById("app").innerHTML = html;
  addSpeakButton();
  addExampleButton();
  exampleBanner();
}
function rerender() { var y = window.scrollY; render(); window.scrollTo(0, y); }
function goTo(n) { exampleOpen = false; stopSpeaking(); step = Math.max(0, Math.min(STEPS.length - 1, n)); render(); window.scrollTo(0, 0); }
function download(data, name, mime) {
  var url = URL.createObjectURL(new Blob([data], { type: mime }));
  var a = document.createElement("a"); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
}
function readJsonFile(input, onData) {
  var fr = new FileReader();
  fr.onload = function () {
    try { onData(JSON.parse(fr.result)); }
    catch (e) { document.getElementById("loadMsg").innerHTML = '<div class="msg bad">That file could not be opened.</div>'; }
  };
  fr.readAsText(input.files[0]);
}
function refreshChecks() {
  var c = document.getElementById("checks");
  if (c) c.innerHTML = letterChecks(state).map(function (m) { return '<div class="msg ' + m.level + '">' + h(m.text) + "</div>"; }).join("");
}

document.addEventListener("input", function (ev) {
  var p = ev.target.getAttribute("data-bind");
  if (!p) return;
  setPath(p, ev.target.value);
  if (ev.target.id === "letterText") refreshChecks();
});
document.addEventListener("change", function (ev) {
  var el = ev.target, a = el.getAttribute("data-action");
  if (a === "jump") { goTo(parseInt(el.value, 10)); return; }
  if (a === "type") { state.type = el.value; dirty = true; rerender(); return; }
  if (a === "supervision") { state.record.supervision = el.checked; dirty = true; return; }
  if (el.id === "loadFile" && el.files && el.files[0]) readJsonFile(el, function (d) { state = mergeState(d); exampleMode = false; filledSteps = {}; dirty = false; goTo(state.type ? 4 : 0); });
  if (el.id === "resumeFile" && el.files && el.files[0]) {
    readJsonFile(el, function (d) {
      var r = fromResume(d);
      if (!r) { document.getElementById("loadMsg").innerHTML = '<div class="msg bad">That does not look like a file saved by the Resume Builder.</div>'; return; }
      Object.keys(r.me).forEach(function (k) { if (r.me[k] && !t(state.me[k])) state.me[k] = r.me[k]; });
      r.growth.forEach(function (g) { state.record.growth = addStarter(state.record.growth, g); });
      dirty = true; render();
      document.getElementById("loadMsg").innerHTML = '<div class="msg good">Got it. Your contact details and some accomplishments are filled in. Check them on the next steps.</div>';
    });
  }
});
document.addEventListener("click", function (ev) {
  var el = ev.target.closest("[data-action]");
  if (!el || el.tagName === "SELECT" || el.tagName === "INPUT") return;
  switch (el.getAttribute("data-action")) {
    case "next": goTo(step + 1); break;
    case "prev": goTo(step - 1); break;
    case "speak": speakCard(); break;
    case "openFile": document.getElementById("loadFile").click(); break;
    case "openResume": document.getElementById("resumeFile").click(); break;
    case "starter":
      state.record.growth = addStarter(state.record.growth, GROWTH_STARTERS[parseInt(el.getAttribute("data-k"), 10)]);
      dirty = true; rerender();
      var ta = document.getElementById("f_record_growth"); if (ta) { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); }
      break;
    case "draft":
      if (t(state.letters[state.type]) && !confirm("Replace what is in the letter box with a new draft?")) break;
      state.letters[state.type] = draft(state, state.type); dirty = true; rerender(); break;
    case "readLetter":
      if (!t(state.letters[state.type])) { alert("Write or draft your letter first."); break; }
      say(state.letters[state.type]); break;
    case "download":
      if (!t(state.letters[state.type])) { alert("Write or draft your letter first."); break; }
      download(letterDocxBytes(state), letterFileName(state), "application/vnd.openxmlformats-officedocument.wordprocessingml.document"); break;
    case "print":
      if (!t(state.letters[state.type])) { alert("Write or draft your letter first."); break; }
      rerender(); window.print(); break;
    case "copy":
      var msg = document.getElementById("copyMsg"), txt = state.letters[state.type] || "";
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(function () { msg.innerHTML = '<div class="msg good">Copied.</div>'; }, function () { msg.innerHTML = '<div class="msg warn">Could not copy. Select the text in the box and copy it.</div>'; });
      else msg.innerHTML = '<div class="msg warn">Could not copy. Select the text in the box and copy it.</div>';
      break;
    case "another": goTo(0); break;
    case "save": download(JSON.stringify(state, null, 2), "Letters of Explanation (saved work).json", "application/json"); dirty = false; break;
    case "tryExample": startExample(1); break;
    case "toggleStepExample": fillStepExample(); break;
    case "endExample": endExample(); break;
    case "clear":
      if (confirm("Clear everything you entered on this device? Save your letters first if you want to keep them.")) { state = newState(); exampleMode = false; filledSteps = {}; dirty = false; goTo(0); }
      break;
  }
});
window.addEventListener("beforeunload", function (ev) { if (dirty) { ev.preventDefault(); ev.returnValue = ""; } });
render();
