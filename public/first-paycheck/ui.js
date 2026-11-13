var state = newState();
var step = 0;
var dirty = false;
/* ----- Step examples: a read-only example for the current step ----- */
var exampleOpen = false;
function exList(items) { return "<ul>" + items.filter(Boolean).map(function (x) { return "<li>" + h(x) + "</li>"; }).join("") + "</ul>"; }
function exPairs(pairs) {
  return "<dl>" + pairs.filter(function (p) { return p && p[1]; }).map(function (p) { return "<dt>" + h(p[0]) + "</dt><dd>" + h(p[1]) + "</dd>"; }).join("") + "</dl>";
}
function exText(x) { return '<div class="ex-text">' + h(x) + "</div>"; }
function addExampleButton() {
  if (exampleMode) return;
  var html = exampleHtml(STEPS[step].id);
  if (!html) return;
  var h2 = document.querySelector("#app .card h2");
  if (!h2) return;
  var anchor = document.getElementById("speakBtn") || h2;
  var b = document.createElement("button");
  b.className = "small speak no-print";
  b.setAttribute("data-action", "toggleStepExample");
  b.setAttribute("aria-expanded", exampleOpen ? "true" : "false");
  b.style.marginLeft = anchor.id === "speakBtn" ? "8px" : "0";
  b.textContent = exampleOpen ? "Hide the example" : "See an example";
  anchor.insertAdjacentElement("afterend", b);
  if (exampleOpen) {
    var box = document.createElement("div");
    box.className = "example-box no-print";
    box.innerHTML = '<p class="ex-title">Example: a made-up person\u2019s answers</p>' + html +
      '<p class="ex-note">This is only an example to show what goes here. Your own answers stay in the boxes below.</p>';
    b.insertAdjacentElement("afterend", box);
  }
}

function exampleHtml(id) {
  var E = exampleWork();
  if (id === "pay") return exPairs([["Hourly wage", "$" + E.pay.rate], ["Hours a week", E.pay.hours], ["Paid", SCHEDULES[E.pay.schedule].label], ["Files taxes as", "Single"]]);
  if (id === "costs") {
    var rows = [];
    COST_GROUPS.forEach(function (g) { g.items.forEach(function (it) { var c = E.costs[it[0]]; if (num(c.amt)) rows.push(it[1] + ": $" + c.amt + " " + FREQ[c.freq].label); }); });
    return "<p>Made-up numbers. Use your own, or a good guess.</p>" + exList(rows);
  }
  return "";
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
function startExample(target) {
  if (dirty && !confirm("Replace what you entered with the example? Save your work first if you want to keep it.")) return;
  state = exampleWork(); exampleMode = true; dirty = false; goTo(target);
}
function endExample() {
  if (!confirm("Clear the example and start your own?")) return;
  state = newState(); exampleMode = false; dirty = false; goTo(1);
}

var stubLine = "";
var STEPS = [
  { id: "start", title: "Start" },
  { id: "pay", title: "Your pay" },
  { id: "takehome", title: "Your take-home pay" },
  { id: "costs", title: "Your monthly costs" },
  { id: "plan", title: "Your plan" },
  { id: "stub", title: "Read your paystub" }
];
function h(s) { return String(s === undefined || s === null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function getPath(p) { return p.split(".").reduce(function (o, k) { return o == null ? undefined : o[k]; }, state); }
function setPath(p, v) { var k = p.split("."), o = state; for (var i = 0; i < k.length - 1; i++) o = o[k[i]]; o[k[k.length - 1]] = v; dirty = true; }

function renderProgress() {
  var pct = Math.round((step / (STEPS.length - 1)) * 100);
  document.getElementById("progress").innerHTML =
    '<span class="label">Step ' + (step + 1) + " of " + STEPS.length + ": " + h(STEPS[step].title) + "</span>" +
    '<div class="bar" aria-hidden="true"><div style="width:' + pct + '%"></div></div>' +
    '<select class="jump" id="jump" data-action="jump" aria-label="Go to step">' +
    STEPS.map(function (s, i) { return '<option value="' + i + '"' + (i === step ? " selected" : "") + ">" + (i + 1) + ". " + h(s.title) + "</option>"; }).join("") +
    "</select>";
}
function nav() {
  return '<div class="nav no-print">' + (step > 0 ? '<button data-action="prev">Back</button>' : "<span></span>") +
    (step < STEPS.length - 1 ? '<button class="primary" data-action="next">Next</button>' : "<span></span>") + "</div>";
}
function moneyInput(path, label, id, help) {
  return (label ? '<label class="field" for="' + id + '">' + h(label) + "</label>" : "") + (help ? '<div class="help">' + help + "</div>" : "") +
    '<div class="money"><input type="text" inputmode="decimal" id="' + id + '" data-bind="' + path + '" value="' + h(getPath(path)) + '" autocomplete="off"></div>';
}

function stepStart() {
  return '<div class="card"><h2>Plan your first paycheck</h2>' +
    "<p>This tool shows what you will actually take home from a job after taxes, and helps you plan for the costs that come first after release.</p>" +
    '<div class="tip">Privacy: everything stays on this device. Nothing is sent over the internet, and nothing is saved unless you choose to save it.</div>' +
    "<h3>Good to know</h3><ul class=\"tight\">" +
    "<li>Many jobs pay one or two weeks after you start. Plan for a gap before your first check.</li>" +
    "<li>The numbers here are estimates. Your real paycheck may be a little different.</li>" +
    "<li>You do not need exact amounts. A good guess is enough to start.</li></ul>" +
    '<div class="actions"><button class="primary" data-action="next">Start</button>' +
    '<button data-action="openFile">Open saved work</button><button data-action="tryExample">Try it with an example</button><input type="file" id="loadFile" accept=".json,application/json" class="hidden"></div>' +
    '<div id="loadMsg"></div></div>';
}
function stepPay() {
  var p = state.pay;
  var html = '<div class="card"><h2>Your pay</h2>' +
    '<div class="help">If you do not have a job offer yet, try a wage you have seen in job postings. You can change it any time.</div>' +
    '<div class="row"><div>' + moneyInput("pay.rate", "Hourly wage", "rate", "") + "</div>" +
    '<div><label class="field" for="hours">Hours a week</label><input type="text" inputmode="decimal" id="hours" data-bind="pay.hours" value="' + h(p.hours) + '"></div></div>' +
    '<label class="field" for="ot">Overtime hours a week (optional)</label><div class="help">Hours over 40 usually pay one and a half times your wage.</div>' +
    '<input type="text" inputmode="decimal" id="ot" data-bind="pay.ot" value="' + h(p.ot) + '" placeholder="0">' +
    '<label class="field" for="schedule">How often are you paid?</label><select id="schedule" data-bind="pay.schedule">' +
    Object.keys(SCHEDULES).map(function (k) { return '<option value="' + k + '"' + (p.schedule === k ? " selected" : "") + ">" + SCHEDULES[k].label + "</option>"; }).join("") +
    "</select><h3>How you will file taxes</h3>" + '<div class="choices">' +
    [["single", "Single", "Not married, and no child or relative depends on you."],
     ["hoh", "Head of household", "Not married, and you pay most of the costs of a home for a child or relative who lives with you."],
     ["mfj", "Married, filing together", "You are married and will file one tax return with your spouse."]].map(function (o) {
      return '<label class="choice"><input type="radio" name="status" value="' + o[0] + '" data-bind-radio="pay.status"' + (p.status === o[0] ? " checked" : "") + "><span><b>" + o[1] + '</b><span class="sm">' + o[2] + "</span></span></label>";
    }).join("") + "</div>" +
    '<div class="tip">Not sure? Choose Single. You can ask about this at tax time.</div>';
  return html + nav() + "</div>";
}
function stepTakeHome() {
  var b = payBreakdown(state);
  if (!b.valid) return '<div class="card"><h2>Your take-home pay</h2><div class="msg warn">Add your hourly wage and hours on the step before this one.</div>' + nav() + "</div>";
  var rows = [["gross", "Pay before taxes", false], ["federal", "Federal income tax", true], ["ss", "Social Security", true], ["medicare", "Medicare", true], ["louisiana", "Louisiana income tax", true]];
  var html = '<div class="card"><h2>Your take-home pay</h2>' +
    '<div class="big"><div><div class="n">' + money(b.check.net) + '</div><div class="l">take-home each paycheck (' + SCHEDULES[state.pay.schedule].label.toLowerCase() + ")</div></div>" +
    '<div><div class="n">' + money(b.month.net) + '</div><div class="l">take-home in an average month</div></div></div>' +
    '<table class="pay"><thead><tr><th></th><th>Each paycheck</th><th>Each month</th></tr></thead><tbody>' +
    rows.map(function (r) {
      return '<tr class="' + (r[2] ? "minus" : "") + '"><td>' + r[1] + "</td><td>" + (r[2] ? "− " : "") + money(b.check[r[0]]) + "</td><td>" + (r[2] ? "− " : "") + money(b.month[r[0]]) + "</td></tr>";
    }).join("") +
    '<tr class="total"><td>Take-home pay</td><td>' + money(b.check.net) + "</td><td>" + money(b.month.net) + "</td></tr></tbody></table>" +
    '<p class="help">You earn ' + money(b.rate) + " an hour, and after taxes you keep about " + money(b.takeHomeHourly) + " of each hour you work. A month here is a year of pay divided by 12, so some months will have an extra paycheck.</p>" +
    "<h3>Other things that can come out of a check</h3><ul class=\"tight\">" +
    "<li>Health insurance, if you sign up for it at work.</li>" +
    "<li>Child support, if a court has ordered your employer to take it out.</li>" +
    "<li>Uniforms, union dues, or a retirement plan, at some jobs.</li></ul>" +
    '<div class="tip">You may get money back at tax time, especially if you have children. Free help filing taxes is available through the IRS Volunteer Income Tax Assistance program (VITA). Ask staff where to find it.</div>';
  return html + nav() + "</div>";
}
function stepCosts() {
  var html = '<div class="card"><h2>Your monthly costs</h2>' +
    '<div class="help">Put in what you expect to pay. Leave a line blank if it does not apply. If you pay something weekly, choose “per week” and the tool will work out the month.</div>';
  COST_GROUPS.forEach(function (g) {
    var total = 0;
    html += "<h3>" + h(g.label) + "</h3>" + (g.note ? '<div class="help">' + h(g.note) + "</div>" : "");
    g.items.forEach(function (it) {
      var c = state.costs[it[0]], id = "c_" + it[0];
      total += monthlyCost(c);
      html += '<div class="cost-row"><label class="name" for="' + id + '">' + h(it[1]) + (it[2] ? '<span class="sm">' + h(it[2]) + "</span>" : "") + "</label>" +
        '<div class="money"><input type="text" inputmode="decimal" id="' + id + '" data-bind="costs.' + it[0] + '.amt" data-live="1" value="' + h(c.amt) + '" aria-label="' + h(it[1]) + ' amount"></div>' +
        '<select data-bind="costs.' + it[0] + '.freq" data-live="1" aria-label="' + h(it[1]) + ' how often">' +
        Object.keys(FREQ).map(function (k) { return '<option value="' + k + '"' + (c.freq === k ? " selected" : "") + ">" + FREQ[k].label + "</option>"; }).join("") +
        "</select></div>";
    });
    html += '<p class="sum" data-sum="' + g.id + '">' + h(g.label) + ": " + money(total) + " a month</p>";
  });
  html += '<div class="tip">Not sure what something costs? Ask staff, family, or someone who came home recently. A rough guess is better than leaving it out.</div>';
  return html + nav() + "</div>";
}
function stepPlan() {
  var b = budget(state);
  var html = '<div class="card"><h2>Your plan</h2>';
  if (!b.pay.valid) return html + '<div class="msg warn">Add your hourly wage and hours on the “Your pay” step first.</div>' + nav() + "</div>";
  html += '<div class="big"><div><div class="n">' + money(b.income) + '</div><div class="l">take-home in an average month</div></div>' +
    '<div><div class="n">' + money(b.costs) + '</div><div class="l">your monthly costs</div></div>' +
    '<div><div class="n" style="color:' + (b.left >= 0 ? "#2e7d32" : "#c0392b") + '">' + money(Math.abs(b.left)) + '</div><div class="l">' + (b.left >= 0 ? "left over each month" : "short each month") + "</div></div></div>";
  var scale = Math.max(b.income, b.costs) || 1;
  html += '<div class="stack" role="img" aria-label="Costs compared with take-home pay">' +
    b.groups.map(function (g) { return g.total > 0 ? '<div style="width:' + (g.total / scale * 100).toFixed(1) + "%;background:" + g.color + '" title="' + h(g.label) + '"></div>' : ""; }).join("") +
    (b.left > 0 ? '<div style="width:' + (b.left / scale * 100).toFixed(1) + '%;background:#e3f3e6"></div>' : "") + "</div>" +
    '<div class="legend">' + b.groups.map(function (g) { return "<span><i style=\"background:" + g.color + '"></i>' + h(g.label) + ": " + money(g.total, false) + "</span>"; }).join("") +
    (b.left > 0 ? '<span><i style="background:#e3f3e6;border:1px solid #2e7d32"></i>Left over: ' + money(b.left, false) + "</span>" : "") + "</div>";
  if (b.costs === 0) html += '<div class="msg warn">You have not entered any costs yet. Go back to “Your monthly costs” to add them.</div>';
  else if (b.left >= 0) {
    html += '<div class="msg good">Your take-home pay covers your costs, with about ' + money(b.left) + " left each month.</div>" +
      "<h3>Ideas for what is left</h3><ul class=\"tight\"><li>Build an emergency fund first. Even $500 can cover a missed shift or a car repair.</li>" +
      "<li>Put savings aside the day you get paid, before you spend on anything else.</li>" +
      "<li>Plan for the gap before your first paycheck, and for months when hours are cut.</li></ul>";
  } else {
    html += '<div class="msg bad">Your costs are about ' + money(-b.left) + " more than your take-home pay each month. That is common in the first months home, and there are things that can help.</div>" +
      "<h3>Things to try</h3><ul class=\"tight\">" +
      "<li>Covering these costs at this wage would take about " + Math.ceil(b.hoursToCover) + " hours of work a week.</li>" +
      "<li>Ask your parole officer whether supervision fees or payment schedules can be adjusted while you get started.</li>" +
      "<li>Ask staff whether you may qualify for food assistance (SNAP) or help with housing or transportation.</li>" +
      "<li>Look at the biggest line in your costs first. Housing usually matters most.</li>" +
      "<li>Try a higher wage on the “Your pay” step to see what kind of job would cover your costs.</li></ul>";
  }
  html += "<h3>Pay the right things first</h3><ol class=\"tight\"><li>Required payments, like supervision fees and child support.</li><li>Housing.</li><li>Getting to work, and your phone, so you can keep the job.</li><li>Food and the other basics.</li><li>Savings, then everything else.</li></ol>" +
    '<div class="tip">Cashing a check at a store can cost several dollars each time. A bank account with direct deposit is usually cheaper. Ask staff about banks that open accounts for people rebuilding credit.</div>' +
    '<div class="actions no-print"><button class="primary" data-action="print">Print my plan</button><button data-action="copy">Copy my plan</button>' +
    '<button data-action="save">Save my work</button><button class="danger" data-action="clear">Clear everything</button></div><div id="copyMsg" class="no-print"></div>' +
    '<pre class="print-only" style="white-space:pre-wrap;font-family:inherit">' + h(planText(state)) + "</pre>";
  return html + nav() + "</div>";
}

var STUB_LINES = {
  period: ["Pay period and pay date", "The pay period is the days you worked for this check. The pay date is when you get paid, often a week or more after the period ends."],
  hours: ["Hours and rate", "Your regular hours and your hourly wage. Check these against your own record of the hours you worked. Mistakes happen, and you can ask payroll to fix them."],
  ot: ["Overtime", "Hours over 40 in a week, usually paid at one and a half times your wage. Your stub may say OT."],
  gross: ["Gross pay", "Everything you earned before anything comes out. Your take-home pay is always less than this."],
  federal: ["Federal income tax", "Money held back for your federal taxes. It may say FIT, FWT, or Fed W/H. How much depends on the W-4 form you filled out when you were hired."],
  ss: ["Social Security", "6.2% of your pay. It may say OASDI, SS, or FICA-SS. It builds toward Social Security benefits when you retire or if you become disabled."],
  medicare: ["Medicare", "1.45% of your pay. It may say MED or FICA-MED. It pays for health care when you are older."],
  louisiana: ["Louisiana income tax", "Money held back for your state taxes. It may say SIT, LA SIT, or State W/H."],
  net: ["Net pay", "What you actually take home. This is the number to plan your money around."],
  ytd: ["Year to date (YTD)", "The total for the whole year so far. It grows with each check and helps at tax time."]
};
function stepStub() {
  var b = payBreakdown(state);
  var useOwn = b.valid;
  var rate = useOwn ? b.rate : 15, hrs = useOwn ? b.hours : 40, ot = useOwn ? b.ot : 0;
  var s2 = mergeState(state);
  if (!useOwn) { s2.pay.rate = "15"; s2.pay.hours = "40"; s2.pay.ot = ""; }
  var pb = payBreakdown(s2), c = pb.check, weeks = 52 / pb.periods;
  function ytd(x) { return money(x * 3); }
  var period = { weekly: "03/09 - 03/15", biweekly: "03/02 - 03/15", semimonthly: "03/01 - 03/15", monthly: "02/01 - 02/28" }[s2.pay.schedule];
  function row(key, label, cur, y) {
    return '<tr class="clickable' + (stubLine === key ? " on" : "") + '" data-action="stub" data-key="' + key + '" tabindex="0"><td>' + label + "</td><td>" + cur + "</td><td>" + y + "</td></tr>";
  }
  var html = '<div class="card"><h2>Read your paystub</h2>' +
    '<div class="help">This is a pretend paystub ' + (useOwn ? "built from your numbers" : "for $15 an hour, 40 hours a week") + ". Tap any line to see what it means. Real paystubs look different from job to job, but they use the same words.</div>" +
    '<div class="stub"><div class="head"><span>ACME SERVICES LLC</span><span data-action="stub" data-key="period" style="cursor:pointer;text-decoration:underline">Period: ' + period + ' &nbsp; Pay date: 03/20</span></div>' +
    "<table><thead><tr><th>Earnings</th><th>Current</th><th>YTD</th></tr></thead><tbody>" +
    row("hours", "Regular " + (hrs * weeks).toFixed(2) + " hrs @ " + money(rate), money(rate * hrs * weeks), ytd(rate * hrs * weeks)) +
    (ot ? row("ot", "Overtime " + (ot * weeks).toFixed(2) + " hrs @ " + money(rate * 1.5), money(rate * 1.5 * ot * weeks), ytd(rate * 1.5 * ot * weeks)) : "") +
    row("gross", "GROSS PAY", money(c.gross), ytd(c.gross)) +
    "</tbody><thead><tr><th>Deductions</th><th></th><th></th></tr></thead><tbody>" +
    row("federal", "FED W/H", money(c.federal), ytd(c.federal)) +
    row("ss", "FICA-SS (OASDI)", money(c.ss), ytd(c.ss)) +
    row("medicare", "FICA-MED", money(c.medicare), ytd(c.medicare)) +
    row("louisiana", "LA SIT", money(c.louisiana), ytd(c.louisiana)) +
    '</tbody><tbody><tr class="net clickable' + (stubLine === "net" ? " on" : "") + '" data-action="stub" data-key="net" tabindex="0"><td>NET PAY</td><td>' + money(c.net) + "</td><td>" + ytd(c.net) + "</td></tr>" +
    row("ytd", "(YTD = year to date)", "", "") + "</tbody></table></div>" +
    '<div class="explain" aria-live="polite">' + (stubLine ? '<div class="tip"><b>' + h(STUB_LINES[stubLine][0]) + ".</b> " + h(STUB_LINES[stubLine][1]) + "</div>" : '<p class="help">Tap a line on the paystub.</p>') + "</div>" +
    "<h3>All the paystub words</h3>" +
    Object.keys(STUB_LINES).map(function (k) { return '<details class="gloss"><summary>' + h(STUB_LINES[k][0]) + "</summary><p>" + h(STUB_LINES[k][1]) + "</p></details>"; }).join("") +
    '<div class="tip">Keep every paystub. You may need them for housing, benefits, parole, or taxes.</div>';
  return html + nav() + "</div>";
}

/* ----- Read aloud ----- */
var canSpeak = "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";
var speaking = false;
function stopSpeaking() { if (canSpeak) window.speechSynthesis.cancel(); speaking = false; var b = document.getElementById("speakBtn"); if (b) b.textContent = "🔊 Read this to me"; }
function speakCard() {
  if (!canSpeak) return;
  if (speaking) { stopSpeaking(); return; }
  var card = document.querySelector("#app .card");
  var parts = [];
  card.querySelectorAll("h2, h3, p, li, .help, .tip, label.field, .msg, .big > div, table.pay tr, summary").forEach(function (el) {
    if (el.closest(".example-box, .print-only, #speakBtn, .stub")) return;
    var t = (el.innerText || "").replace(/−/g, "minus").replace(/\s+/g, " ").trim();
    if (t && parts.indexOf(t) === -1) parts.push(t);
  });
  var u = new SpeechSynthesisUtterance(parts.join(". ").replace(/\.\./g, "."));
  var voices = window.speechSynthesis.getVoices() || [];
  var v = voices.filter(function (x) { return /^en(-|_)US/i.test(x.lang) && x.localService; })[0] || voices.filter(function (x) { return /^en(-|_)US/i.test(x.lang); })[0];
  if (v) u.voice = v;
  u.rate = 0.9;
  u.onend = u.onerror = function () { speaking = false; var b = document.getElementById("speakBtn"); if (b) b.textContent = "🔊 Read this to me"; };
  window.speechSynthesis.cancel(); window.speechSynthesis.speak(u); speaking = true;
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
  else if (id === "pay") html = stepPay();
  else if (id === "takehome") html = stepTakeHome();
  else if (id === "costs") html = stepCosts();
  else if (id === "plan") html = stepPlan();
  else html = stepStub();
  document.getElementById("app").innerHTML = html;
  addSpeakButton();
  addExampleButton();
  exampleBanner();
}
function rerender() { var y = window.scrollY; render(); window.scrollTo(0, y); }
function goTo(n) { exampleOpen = false; stopSpeaking(); step = Math.max(0, Math.min(STEPS.length - 1, n)); render(); window.scrollTo(0, 0); }
function download(text, name, mime) {
  var url = URL.createObjectURL(new Blob([text], { type: mime }));
  var a = document.createElement("a"); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
}
function updateSums() {
  COST_GROUPS.forEach(function (g) {
    var el = document.querySelector('[data-sum="' + g.id + '"]');
    if (!el) return;
    var total = 0; g.items.forEach(function (it) { total += monthlyCost(state.costs[it[0]]); });
    el.textContent = g.label + ": " + money(total) + " a month";
  });
}

document.addEventListener("input", function (ev) {
  var p = ev.target.getAttribute("data-bind");
  if (p && ev.target.tagName !== "SELECT") { setPath(p, ev.target.value); if (ev.target.getAttribute("data-live")) updateSums(); }
});
document.addEventListener("change", function (ev) {
  var el = ev.target;
  if (el.getAttribute("data-action") === "jump") { goTo(parseInt(el.value, 10)); return; }
  var p = el.getAttribute("data-bind");
  if (p && el.tagName === "SELECT") { setPath(p, el.value); if (el.getAttribute("data-live")) updateSums(); return; }
  var r = el.getAttribute("data-bind-radio");
  if (r) { setPath(r, el.value); return; }
  if (el.id === "loadFile" && el.files && el.files[0]) {
    var fr = new FileReader();
    fr.onload = function () {
      try { state = mergeState(JSON.parse(fr.result)); exampleMode = false; dirty = false; goTo(1); }
      catch (e) { document.getElementById("loadMsg").innerHTML = '<div class="msg bad">That file could not be opened. Choose a file saved by this tool.</div>'; }
    };
    fr.readAsText(el.files[0]);
  }
});
document.addEventListener("keydown", function (ev) {
  if ((ev.key === "Enter" || ev.key === " ") && ev.target.getAttribute && ev.target.getAttribute("data-action") === "stub") { ev.preventDefault(); ev.target.click(); }
});
document.addEventListener("click", function (ev) {
  var el = ev.target.closest("[data-action]");
  if (!el || el.tagName === "SELECT") return;
  switch (el.getAttribute("data-action")) {
    case "next": goTo(step + 1); break;
    case "prev": goTo(step - 1); break;
    case "speak": speakCard(); break;
    case "openFile": document.getElementById("loadFile").click(); break;
    case "stub": stubLine = el.getAttribute("data-key"); rerender(); break;
    case "print": window.print(); break;
    case "copy":
      var txt = planText(state), msg = document.getElementById("copyMsg");
      var ok = function () { msg.innerHTML = '<div class="msg good">Copied.</div>'; };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(ok, function () { msg.innerHTML = '<div class="msg warn">Could not copy. Use Print instead.</div>'; });
      else msg.innerHTML = '<div class="msg warn">Could not copy. Use Print instead.</div>';
      break;
    case "save": download(JSON.stringify(state, null, 2), "First Paycheck (saved work).json", "application/json"); dirty = false; break;
    case "tryExample": startExample(1); break;
    case "toggleStepExample": exampleOpen = !exampleOpen; rerender(); break;
    case "endExample": endExample(); break;
    case "clear":
      if (confirm("Clear everything you entered on this device? Save your work first if you want to keep it.")) { state = newState(); exampleMode = false; dirty = false; goTo(0); }
      break;
  }
});
window.addEventListener("beforeunload", function (ev) { if (dirty) { ev.preventDefault(); ev.returnValue = ""; } });
render();
