var state = newState();
var step = 0, dirty = false, qi = 0, qFilter = "all", showTips = false;
var timer = { running: false, start: 0, elapsed: 0, handle: null };
var STEPS = [
  { id: "start", title: "Start" },
  { id: "story", title: "Your story" },
  { id: "tell", title: "Tell me about yourself" },
  { id: "practice", title: "Practice questions" },
  { id: "ask", title: "Questions to ask them" },
  { id: "day", title: "Interview day" }
];
function h(s) { return String(s === undefined || s === null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function setPath(p, v) { var k = p.split("."), o = state; for (var i = 0; i < k.length - 1; i++) o = o[k[i]]; o[k[k.length - 1]] = v; dirty = true; }
function getPath(p) { return p.split(".").reduce(function (o, k) { return o == null ? undefined : o[k]; }, state); }
function groups() { var g = []; QUESTIONS.forEach(function (q) { if (g.indexOf(q.g) === -1) g.push(q.g); }); return g; }
function visibleQs() { return QUESTIONS.filter(function (q) { return qFilter === "all" || q.g === qFilter; }); }
function fmt(sec) { var m = Math.floor(sec / 60), s = Math.floor(sec % 60); return m + ":" + (s < 10 ? "0" : "") + s; }

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
function meter(text, target) {
  var w = words(text), sec = seconds(text);
  if (!w) return '<p class="meter" data-meter>Nothing written yet.</p>';
  var note = sec <= target ? "a good length." : "a little long. Try to trim it.";
  return '<p class="meter" data-meter><b>' + w + " words</b>, about <b>" + sec + " seconds</b> out loud: " + note + "</p>";
}
function partBlock(group, part, i) {
  var path = group + "." + part.key, id = "p_" + group + "_" + part.key;
  return '<div class="part"><span class="num">' + (i + 1) + ". " + h(part.title) + "</span>" +
    (part.help ? '<div class="help">' + h(part.help) + "</div>" : "") +
    '<div class="quick">' + part.starters.map(function (st, k) {
      return '<button class="small" data-action="starter" data-group="' + group + '" data-key="' + part.key + '" data-k="' + k + '">+ ' + h(st) + "</button>";
    }).join("") + "</div>" +
    '<textarea id="' + id + '" data-bind="' + path + '" data-live="' + group + '" aria-label="' + h(part.title) + '">' + h(getPath(path)) + "</textarea></div>";
}

function stepStart() {
  return '<div class="card"><h2>Get ready for your interview</h2>' +
    "<p>This tool helps you prepare the two answers that matter most, practice common questions out loud, and make a one-page sheet to take with you.</p>" +
    '<div class="tip">Privacy: everything stays on this device. Nothing is sent over the internet, and nothing is saved unless you choose to save it.</div>' +
    '<label class="field" for="name">Your first and last name</label><input type="text" id="name" data-bind="name" value="' + h(state.name) + '">' +
    '<div class="row"><label class="field" for="jt">Job you are interviewing for (optional)</label><input type="text" id="jt" data-bind="job.title" value="' + h(state.job.title) + '" placeholder="For example: HVAC Technician"></div>' +
    '<label class="field" for="jc">Company (optional)</label><input type="text" id="jc" data-bind="job.company" value="' + h(state.job.company) + '">' +
    '<label class="field" for="jp">Person you will meet (optional)</label><input type="text" id="jp" data-bind="job.person" value="' + h(state.job.person) + '" placeholder="For example: Ms. Johnson">' +
    "<h3>Already made a resume?</h3>" +
    '<div class="help">If you saved your work in the Resume Builder, open that file here and the tool will start your “Tell me about yourself” answer for you.</div>' +
    '<div class="actions"><button class="primary" data-action="next">Start</button>' +
    '<button data-action="openResume">Use my resume file</button><button data-action="openFile">Open saved practice</button>' +
    '<input type="file" id="resumeFile" accept=".json,application/json" class="hidden"><input type="file" id="loadFile" accept=".json,application/json" class="hidden"></div>' +
    '<div id="loadMsg"></div></div>';
}
function stepStory() {
  var html = '<div class="card"><h2>Your story</h2>' +
    '<div class="help">Many employers will ask about your conviction. A short, steady answer you have practiced can make the difference. Build it in five parts. Tap a starting sentence to add it, then change the words so they are yours.</div>' +
    STORY_PARTS.map(function (p, i) { return partBlock("story", p, i); }).join("") +
    "<h3>Your whole answer</h3>" +
    '<div class="sheet" data-preview="story">' + (h(storyText(state)) || "Your answer will appear here as you write.") + "</div>" +
    meter(storyText(state), 60) +
    (hasBlank(storyText(state)) ? '<div class="msg warn" data-blank>There is still a blank (___). Fill it in or take that part out.</div>' : "") +
    '<div class="actions no-print"><button data-action="readText" data-what="story">Read my answer to me</button><button data-action="goPractice" data-q="conviction">Practice it with a timer</button></div>' +
    '<div class="tip">Aim for 30 to 60 seconds. Say it out loud until it feels natural, not memorized. Look the interviewer in the eye, keep your voice steady, and then stop talking. Let them ask the next question.</div>';
  return html + nav() + "</div>";
}
function stepTell() {
  var html = '<div class="card"><h2>Tell me about yourself</h2>' +
    '<div class="help">This is often the first question. Answer in three parts: who you are as a worker, what you have done, and why you want this job. Tap a starting sentence to add it, then make it yours.</div>' +
    TELL_PARTS.map(function (p, i) { return partBlock("tell", p, i); }).join("") +
    "<h3>Your whole answer</h3>" +
    '<div class="sheet" data-preview="tell">' + (h(tellText(state)) || "Your answer will appear here as you write.") + "</div>" +
    meter(tellText(state), 60) +
    (hasBlank(tellText(state)) ? '<div class="msg warn" data-blank>There is still a blank (___). Fill it in or take that part out.</div>' : "") +
    '<div class="actions no-print"><button data-action="readText" data-what="tell">Read my answer to me</button><button data-action="goPractice" data-q="about">Practice it with a timer</button></div>' +
    '<div class="tip">Keep this about work. Your conviction can come later if they ask, and you have your story ready for that.</div>';
  return html + nav() + "</div>";
}
function stepPractice() {
  var list = visibleQs();
  if (qi >= list.length) qi = 0;
  var q = list[qi];
  var done = QUESTIONS.filter(function (x) { return state.practiced[x.id]; }).length;
  var html = '<div class="card"><h2>Practice questions</h2>' +
    '<div class="help">Read the question out loud, or tap “Read the question.” Start the timer and answer out loud as if you were in the room. Practicing with another person is even better.</div>' +
    '<label class="field" for="qf">Show</label><select id="qf" data-action="filter"><option value="all"' + (qFilter === "all" ? " selected" : "") + ">All questions (" + QUESTIONS.length + ")</option>" +
    groups().map(function (g) { return '<option value="' + h(g) + '"' + (qFilter === g ? " selected" : "") + ">" + h(g) + "</option>"; }).join("") + "</select>" +
    '<p class="count">Question ' + (qi + 1) + " of " + list.length + ". You have practiced " + done + " of " + QUESTIONS.length + ".</p>" +
    '<div class="qcard"><div class="grp">' + h(q.g) + '</div><div class="q">' + h(q.q) + "</div>" +
    '<div class="actions"><button class="small" data-action="readQ">🔊 Read the question</button><button class="small" data-action="tips">' + (showTips ? "Hide tips" : "Show tips") + "</button></div>" +
    '<div class="timer-row"><span class="timer" id="timer">' + fmt(timer.elapsed) + '</span><button class="primary" data-action="timer">' + (timer.running ? "Stop" : (timer.elapsed ? "Start again" : "Start timer")) + "</button>" +
    '<span class="count">Aim for about ' + fmt(q.secs) + "</span></div>" +
    (showTips ? '<div class="tip"><b>Why they ask:</b> ' + h(q.why) + '<ul class="tight">' + q.tips.map(function (x) { return "<li>" + h(x) + "</li>"; }).join("") + "</ul></div>" : "") +
    '<label class="field" for="note">My notes for this question</label><textarea id="note" data-bind="notes.' + q.id + '">' + h(state.notes[q.id] || "") + "</textarea>" +
    '<label class="check"><input type="checkbox" data-action="practiced" data-id="' + q.id + '"' + (state.practiced[q.id] ? " checked" : "") + "> I practiced this one out loud</label></div>" +
    '<div class="actions"><button data-action="qprev"' + (list.length < 2 ? " disabled" : "") + ">Previous question</button>" +
    '<button class="primary" data-action="qnext"' + (list.length < 2 ? " disabled" : "") + '>Next question</button><button data-action="shuffle">Surprise me</button></div>';
  return html + nav() + "</div>";
}
function stepAsk() {
  var html = '<div class="card"><h2>Questions to ask them</h2>' +
    '<div class="help">At the end, most interviewers ask if you have questions. Pick one or two to have ready.</div>' +
    ASK_THEM.map(function (q, i) {
      return '<label class="check"><input type="checkbox" data-action="askPick" data-i="' + i + '"' + (state.ask.indexOf(q) !== -1 ? " checked" : "") + "> <span>" + h(q) + "</span></label>";
    }).join("") +
    '<label class="field" for="askOwn">Or write your own</label><input type="text" id="askOwn" data-bind="askOwn" value="' + h(state.askOwn) + '">' +
    '<div class="tip">Pay and benefits are fair to ask about, often near the end or once they show interest in you.</div>';
  return html + nav() + "</div>";
}
function stepDay() {
  var html = '<div class="card"><h2>Interview day</h2>' +
    '<div class="help">Check off what you have ready. Then print your interview sheet to take with you.</div>' +
    DAY_CHECKS.map(function (c, i) {
      return '<label class="check"><input type="checkbox" data-action="dayCheck" data-i="' + i + '"' + (state.checks[i] ? " checked" : "") + "> <span>" + h(c) + "</span></label>";
    }).join("") +
    "<h3>The first 30 seconds</h3><ol class=\"tight\">" +
    "<li>Greet the person at the front desk and say who you are there to see.</li>" +
    "<li>When the interviewer comes, stand up, smile, and look them in the eye.</li>" +
    "<li>Shake hands if they offer: firm, not crushing, two pumps. If they do not offer, a nod and a smile are fine.</li>" +
    "<li>Say your name and “Thank you for having me.”</li>" +
    "<li>Wait to be offered a seat. Sit up straight with your hands relaxed.</li></ol>" +
    "<h3>After the interview</h3>" +
    '<div class="help">Send a short thank-you the same day, by text, email, or a note left at the front desk. Here is one you can use:</div>' +
    '<div class="sheet">' + h(thankYou(state)) + "</div>" +
    '<div class="actions no-print"><button data-action="copyThanks">Copy the thank-you</button></div><div id="copyMsg" class="no-print"></div>' +
    "<h3>Your interview sheet</h3>" +
    '<div class="sheet print-area">' + h(sheetText(state)) + "</div>" +
    '<div class="actions no-print"><button class="primary" data-action="print">Print my sheet</button><button data-action="save">Save my practice</button><button class="danger" data-action="clear">Clear everything</button></div>';
  return html + nav() + "</div>";
}

/* ----- Read aloud ----- */
var canSpeak = "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";
var speaking = false;
function say(text, btn) {
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
  card.querySelectorAll("h2, h3, p, li, .help, .tip, label.field, label.check span, .part .num, .qcard .q").forEach(function (el) {
    if (el.closest("#speakBtn, .sheet")) return;
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

/* ----- Timer ----- */
function tick() {
  var el = document.getElementById("timer");
  var now = timer.elapsed + (timer.running ? (Date.now() - timer.start) / 1000 : 0);
  if (el) {
    el.textContent = fmt(now);
    var q = visibleQs()[qi];
    el.className = "timer" + (q && now > q.secs ? " over" : "");
  }
}
function stopTimer() {
  if (timer.running) { timer.elapsed += (Date.now() - timer.start) / 1000; timer.running = false; }
  clearInterval(timer.handle); timer.handle = null;
}
function resetTimer() { stopTimer(); timer.elapsed = 0; }

function render() {
  renderProgress();
  var id = STEPS[step].id, html;
  if (id === "start") html = stepStart();
  else if (id === "story") html = stepStory();
  else if (id === "tell") html = stepTell();
  else if (id === "practice") html = stepPractice();
  else if (id === "ask") html = stepAsk();
  else html = stepDay();
  document.getElementById("app").innerHTML = html;
  addSpeakButton();
  tick();
}
function rerender() { var y = window.scrollY; render(); window.scrollTo(0, y); }
function goTo(n) { stopSpeaking(); resetTimer(); step = Math.max(0, Math.min(STEPS.length - 1, n)); render(); window.scrollTo(0, 0); }
function refreshLive(group) {
  var text = group === "story" ? storyText(state) : tellText(state);
  var pv = document.querySelector('[data-preview="' + group + '"]');
  if (pv) pv.textContent = text || "Your answer will appear here as you write.";
  var m = document.querySelector("[data-meter]");
  if (m) m.outerHTML = meter(text, 60);
}
function download(text, name) {
  var url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
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

document.addEventListener("input", function (ev) {
  var el = ev.target, p = el.getAttribute("data-bind");
  if (!p) return;
  setPath(p, el.value);
  var live = el.getAttribute("data-live");
  if (live) refreshLive(live);
});
document.addEventListener("change", function (ev) {
  var el = ev.target, a = el.getAttribute("data-action");
  if (a === "jump") { goTo(parseInt(el.value, 10)); return; }
  if (a === "filter") { qFilter = el.value; qi = 0; resetTimer(); rerender(); return; }
  if (a === "practiced") { state.practiced[el.getAttribute("data-id")] = el.checked; dirty = true; rerender(); return; }
  if (a === "askPick") {
    var q = ASK_THEM[parseInt(el.getAttribute("data-i"), 10)], at = state.ask.indexOf(q);
    if (el.checked && at === -1) state.ask.push(q); else if (!el.checked && at !== -1) state.ask.splice(at, 1);
    dirty = true; return;
  }
  if (a === "dayCheck") { state.checks[el.getAttribute("data-i")] = el.checked; dirty = true; return; }
  if (el.id === "loadFile" && el.files && el.files[0]) {
    readJsonFile(el, function (d) { state = mergeState(d); dirty = false; goTo(1); });
  }
  if (el.id === "resumeFile" && el.files && el.files[0]) {
    readJsonFile(el, function (d) {
      var r = fromResume(d), msg = document.getElementById("loadMsg");
      if (!r) { msg.innerHTML = '<div class="msg bad">That does not look like a file saved by the Resume Builder.</div>'; return; }
      if (r.name && !t(state.name)) state.name = r.name;
      if (r.job && !t(state.job.title)) state.job.title = r.job;
      Object.keys(r.tell).forEach(function (k) { if (!t(state.tell[k])) state.tell[k] = r.tell[k]; });
      dirty = true; render();
      document.getElementById("loadMsg").innerHTML = '<div class="msg good">Got it. Your “Tell me about yourself” answer has a head start on step 3.</div>';
    });
  }
});
document.addEventListener("click", function (ev) {
  var el = ev.target.closest("[data-action]");
  if (!el || el.tagName === "SELECT" || el.tagName === "INPUT") return;
  var a = el.getAttribute("data-action");
  switch (a) {
    case "next": goTo(step + 1); break;
    case "prev": goTo(step - 1); break;
    case "speak": speakCard(); break;
    case "openFile": document.getElementById("loadFile").click(); break;
    case "openResume": document.getElementById("resumeFile").click(); break;
    case "starter":
      var grp = el.getAttribute("data-group"), key = el.getAttribute("data-key"), k = parseInt(el.getAttribute("data-k"), 10);
      var parts = grp === "story" ? STORY_PARTS : TELL_PARTS;
      var part = parts.filter(function (p) { return p.key === key; })[0];
      state[grp][key] = addStarter(state[grp][key], part.starters[k]);
      dirty = true; rerender();
      var ta = document.getElementById("p_" + grp + "_" + key); if (ta) { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); }
      break;
    case "readText":
      var txt = el.getAttribute("data-what") === "story" ? storyText(state) : tellText(state);
      if (!txt) { alert("Write your answer first."); break; }
      say(txt); break;
    case "goPractice":
      qFilter = "all"; qi = QUESTIONS.map(function (q) { return q.id; }).indexOf(el.getAttribute("data-q")); showTips = false; goTo(3); break;
    case "readQ": say(visibleQs()[qi].q); break;
    case "tips": showTips = !showTips; rerender(); break;
    case "timer":
      if (timer.running) { stopTimer(); }
      else { if (timer.elapsed) timer.elapsed = 0; timer.start = Date.now(); timer.running = true; timer.handle = setInterval(tick, 250); }
      rerender(); break;
    case "qnext": qi = (qi + 1) % visibleQs().length; resetTimer(); showTips = false; rerender(); break;
    case "qprev": var n = visibleQs().length; qi = (qi - 1 + n) % n; resetTimer(); showTips = false; rerender(); break;
    case "shuffle":
      var len = visibleQs().length, next = qi;
      if (len > 1) while (next === qi) next = Math.floor(Math.random() * len);
      qi = next; resetTimer(); showTips = false; rerender(); break;
    case "copyThanks":
      var msgEl = document.getElementById("copyMsg");
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(thankYou(state)).then(function () { msgEl.innerHTML = '<div class="msg good">Copied.</div>'; }, function () { msgEl.innerHTML = '<div class="msg warn">Could not copy. Select the text above and copy it.</div>'; });
      else msgEl.innerHTML = '<div class="msg warn">Could not copy. Select the text above and copy it.</div>';
      break;
    case "print": window.print(); break;
    case "save": download(JSON.stringify(state, null, 2), "Interview Practice (saved work).json"); dirty = false; break;
    case "clear":
      if (confirm("Clear everything you entered on this device? Save your practice first if you want to keep it.")) { state = newState(); dirty = false; qi = 0; goTo(0); }
      break;
  }
});
window.addEventListener("beforeunload", function (ev) { if (dirty) { ev.preventDefault(); ev.returnValue = ""; } });
render();
