var state = newState();
var step = 0;
var dirty = false;
var openGroups = {};
var showExample = false;
var STEPS = [
  { id: "start", title: "Start" },
  { id: "contact", title: "Your contact information" },
  { id: "goal", title: "The job you want" },
  { id: "work", title: "Work history" },
  { id: "skills", title: "Skills" },
  { id: "certs", title: "Certifications and training" },
  { id: "edu", title: "Education" },
  { id: "vol", title: "Volunteer and leadership" },
  { id: "summary", title: "Summary" },
  { id: "review", title: "Review and download" },
  { id: "letter", title: "Cover letter (optional)" }
];
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
  function entries(list) {
    return list.map(function (e) {
      return "<dt>" + h(e.title) + "</dt><dd>" + h(entryLine2(e)) + exList(cleanBullets(e.bullets)) + "</dd>";
    }).join("");
  }
  if (id === "contact") return exPairs([["Full name", E.contact.name], ["City and state", E.contact.city + ", " + E.contact.state], ["Phone", E.contact.phone], ["Email", E.contact.email]]);
  if (id === "goal") return exPairs([["Job wanted", E.goal.title], ["Job posting", E.goal.posting]]);
  if (id === "work") return "<p>Work done while incarcerated is listed like any other job.</p><dl>" + entries(E.work) + "</dl>";
  if (id === "skills") return exList(E.skills);
  if (id === "certs") return exList(E.certs.map(certLine));
  if (id === "edu") return exList(E.education.map(function (ed) { return eduLine1(ed) + ", " + eduLine2(ed); }));
  if (id === "vol") return "<dl>" + entries(E.volunteer) + "</dl>";
  if (id === "summary") return exPairs([["Years of experience", E.summaryHelp.years], ["Kind of work", E.summaryHelp.field], ["Strengths", E.summaryHelp.strengths.join(", ")], ["Summary", E.summary]]);
  if (id === "letter") return exText(E.letter.text);
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

var STATUS_MARK = { done: "✓ ", todo: "", optional: "" };

function h(s) {
  return String(s === undefined || s === null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function getPath(path) {
  return path.split(".").reduce(function (o, k) { return o == null ? undefined : o[k]; }, state);
}
function setPath(path, value) {
  var keys = path.split("."), o = state;
  for (var i = 0; i < keys.length - 1; i++) o = o[keys[i]];
  o[keys[keys.length - 1]] = value;
  dirty = true;
}
function input(path, opts) {
  opts = opts || {};
  var type = opts.type || "text";
  return '<input type="' + type + '" data-bind="' + path + '" value="' + h(getPath(path)) + '"' +
    (opts.placeholder ? ' placeholder="' + h(opts.placeholder) + '"' : "") +
    (opts.list ? ' list="' + opts.list + '"' : "") +
    (opts.mode ? ' inputmode="' + opts.mode + '"' : "") +
    (opts.id ? ' id="' + opts.id + '"' : "") +
    ' autocomplete="off">';
}
function field(label, path, opts) {
  var id = "f_" + path.replace(/\./g, "_");
  opts = Object.assign({ id: id }, opts || {});
  return '<label class="field" for="' + id + '">' + h(label) + "</label>" +
    (opts.help ? '<div class="help">' + opts.help + "</div>" : "") + input(path, opts);
}
function datalist(id, items) {
  return '<datalist id="' + id + '">' + items.map(function (x) { return '<option value="' + h(x) + '">'; }).join("") + "</datalist>";
}

function renderProgress() {
  var pct = Math.round((step / (STEPS.length - 1)) * 100);
  var st = stepStatus(state);
  document.getElementById("progress").innerHTML =
    '<span class="label">Step ' + (step + 1) + " of " + STEPS.length + ": " + h(STEPS[step].title) + "</span>" +
    '<div class="bar" aria-hidden="true"><div style="width:' + pct + '%"></div></div>' +
    '<label class="hidden" for="jump">Go to step</label>' +
    '<select class="jump" id="jump" data-action="jump" aria-label="Go to step">' +
    STEPS.map(function (s, i) {
      return '<option value="' + i + '"' + (i === step ? " selected" : "") + ">" + (STATUS_MARK[st[s.id]] || "") + (i + 1) + ". " + h(s.title) + "</option>";
    }).join("") +
    "</select>";
}
function navButtons() {
  var back = step > 0 ? '<button data-action="prev">Back</button>' : "<span></span>";
  var next = step < STEPS.length - 1 ? '<button class="primary" data-action="next">Next</button>' : "<span></span>";
  return '<div class="nav no-print">' + back + next + "</div>";
}

/* ----- Steps ----- */
function stepStart() {
  return '<div class="card"><h2>Build your resume</h2>' +
    "<p>This tool asks you questions one section at a time and builds a resume that hiring software can read. At the end you can download it as a Word file, print it, or copy the text into an online job application.</p>" +
    '<div class="tip">Privacy: everything stays on this device. Nothing is sent over the internet, and nothing is saved unless you choose to save it. On a shared computer, use Clear everything when you finish.</div>' +
    "<h3>Before you start</h3><ul>" +
    "<li>Jobs you did while incarcerated are real work experience. Include them.</li>" +
    "<li>You do not list your conviction on a resume. That conversation happens in the interview, and you will practice it in class.</li>" +
    "<li>Everything on your resume should be true and something you could talk about.</li>" +
    "<li>You can skip any step and come back to it.</li></ul>" +
    '<div class="actions"><button class="primary" data-action="next">Start a new resume</button>' +
    '<button data-action="openFile">Open saved work</button><button data-action="tryExample">Try it with an example</button>' +
    '<button data-action="toggleExample">' + (showExample ? "Hide the example" : "See an example resume") + "</button>" +
    '<input type="file" id="loadFile" accept=".json,application/json" class="hidden"></div>' +
    '<div id="loadMsg"></div>' +
    (showExample
      ? '<div class="example"><p class="help">This is a made-up person. It shows what a finished resume from this tool looks like.</p>' +
        '<div class="preview-box">' + previewHtml(EXAMPLE_STATE) + "</div></div>"
      : "") +
    "</div>";
}
function stepContact() {
  return '<div class="card"><h2>Your contact information</h2>' +
    '<div class="help">This goes at the top of your resume. You only need your city and state, not a street address.</div>' +
    field("Full name", "contact.name", { placeholder: "First and last name" }) +
    '<div class="row"><div>' + field("City", "contact.city", { placeholder: "Baton Rouge" }) + "</div>" +
    "<div>" + field("State", "contact.state", { placeholder: "LA" }) + "</div></div>" +
    field("Phone number", "contact.phone", { type: "tel", placeholder: "(225) 555-0123", mode: "tel" }) +
    field("Email address", "contact.email", { type: "email", placeholder: "firstname.lastname@gmail.com", mode: "email",
      help: "Use a simple email with your name in it. If you don't have one yet, leave this blank and add it later." }) +
    field("LinkedIn or other link (optional)", "contact.link", { placeholder: "Leave blank if you don't have one" }) +
    '<div class="tip">No phone or email yet? That is common. Leave them blank for now. You will need both before you apply, and staff can help you set them up.</div>' +
    navButtons() + "</div>";
}
function stepGoal() {
  return '<div class="card"><h2>The job you want</h2>' +
    field("What kind of job are you looking for?", "goal.title", { placeholder: "For example: HVAC Technician, Warehouse Worker, Forklift Operator" }) +
    '<label class="field" for="posting">Job posting (optional)</label>' +
    '<div class="help">If you have a job posting, paste or type it here. On the last step, the tool will show which words from the posting already appear in your resume.</div>' +
    '<textarea id="posting" data-bind="goal.posting" placeholder="Paste the job posting here">' + h(state.goal.posting) + "</textarea>" +
    '<div class="tip">Hiring software helps employers search for words that match the job. Using the same words as the posting, when they are true for you, helps your resume get seen.</div>' +
    navButtons() + "</div>";
}
function entryCard(list, i) {
  var e = state[list][i];
  var p = list + "." + i;
  var job = JOBS[e.type] || null;
  var noun = list === "work" ? "Job" : "Activity";
  var html = '<div class="entry"><div class="entry-head"><strong>' + noun + " " + (i + 1) + (t(e.title) ? ": " + h(e.title) : "") + "</strong>" +
    "<span>" + (i > 0 ? '<button class="small" data-action="moveUp" data-list="' + list + '" data-i="' + i + '">Move up</button> ' : "") +
    '<button class="small danger" data-action="removeEntry" data-list="' + list + '" data-i="' + i + '">Remove</button></span></div>';
  html += '<label class="check"><input type="checkbox" data-bind-check="' + p + '.inside"' + (e.inside ? " checked" : "") + "> I did this while incarcerated</label>";
  html += '<label class="field" for="type_' + list + i + '">What kind of work was it?</label>' +
    '<select id="type_' + list + i + '" data-bind="' + p + '.type" data-rerender="1"><option value="">Choose one (this shows suggestions)</option>' +
    Object.keys(JOBS).map(function (k) { return '<option value="' + k + '"' + (e.type === k ? " selected" : "") + ">" + h(JOBS[k].label) + "</option>"; }).join("") +
    "</select>";
  var titleList = "titles_" + list + i;
  html += (job && job.titles.length ? datalist(titleList, job.titles) : "") +
    field("Job title", p + ".title", { list: job && job.titles.length ? titleList : null, placeholder: job && job.titles[0] ? "For example: " + job.titles[0] : "Your job title" });
  var empHelp = e.inside
    ? "You choose how to name the employer. Each of these is honest: the state department, the facility, or the program or industry you worked for. Pick the one you are most comfortable explaining in an interview."
    : "";
  html += field("Employer or organization", p + ".employer", { help: empHelp, placeholder: "Who you worked for" });
  if (e.inside) {
    html += '<div class="quick">' +
      ["Louisiana Department of Public Safety and Corrections", "Louisiana Prison Enterprises"].map(function (v) {
        return '<button class="small" data-action="fillEmployer" data-list="' + list + '" data-i="' + i + '" data-value="' + h(v) + '">Use: ' + h(v) + "</button>";
      }).join("") + "</div>";
  }
  html += field("City and state", p + ".location", { placeholder: "For example: Angola, LA" });
  html += '<div class="row"><div>' + field("Start year", p + ".start", { placeholder: "2012", mode: "numeric" }) + "</div>" +
    "<div>" + field("End year", p + ".end", { placeholder: "2025 or Present" }) + "</div></div>";
  html += "<h3>What you did</h3>" +
    '<div class="help">Three to six lines. Start each line with an action word, like Prepared, Repaired, Trained, or Led. If a line has ___, fill it in with a real number you could explain, or delete that part.</div>';
  e.bullets.forEach(function (b, j) {
    html += '<div class="bullet-row"><textarea rows="2" class="line" aria-label="Line ' + (j + 1) + '" data-bind="' + p + ".bullets." + j + '">' + h(b) + "</textarea>" +
      '<button class="small danger" data-action="removeBullet" data-list="' + list + '" data-i="' + i + '" data-j="' + j + '" aria-label="Remove line ' + (j + 1) + '">X</button></div>';
  });
  html += '<div class="actions"><button class="small" data-action="addBullet" data-list="' + list + '" data-i="' + i + '">Add a line in my own words</button></div>';
  if (job && job.bullets.length) {
    html += '<h3>Suggested lines</h3><div class="help">Add only the ones that are true for you, then change the wording to fit what you actually did.</div>';
    job.bullets.forEach(function (b, k) {
      var used = e.bullets.indexOf(b) !== -1;
      html += '<div class="suggest"><span>' + h(b) + "</span>" +
        '<button class="small" data-action="useSuggestion" data-list="' + list + '" data-i="' + i + '" data-k="' + k + '"' + (used ? " disabled" : "") + ">" + (used ? "Added" : "Add") + "</button></div>";
    });
  }
  return html + "</div>";
}
function stepEntries(list) {
  var isWork = list === "work";
  var html = '<div class="card"><h2>' + (isWork ? "Work history" : "Volunteer and leadership") + "</h2>";
  html += isWork
    ? '<div class="help">Start with your most recent job and work backward. Include jobs you did while incarcerated. They count as real work experience, and many employers value them.</div>'
    : '<div class="help">Optional. Mentoring, clubs, faith groups, hospice, and other service show leadership and responsibility. Skip this step if it does not apply.</div>';
  state[list].forEach(function (e, i) { html += entryCard(list, i); });
  html += '<div class="actions"><button data-action="addEntry" data-list="' + list + '">' + (isWork ? "Add another job" : "Add an activity") + "</button></div>";
  return html + navButtons() + "</div>";
}
function suggestedSkills() {
  var out = [];
  state.work.concat(state.volunteer).forEach(function (e) {
    var j = JOBS[e.type];
    if (j) j.skills.forEach(function (s) { if (out.indexOf(s) === -1) out.push(s); });
  });
  return out;
}
function chip(label, pressed, action, attr) {
  return '<button class="chip" aria-pressed="' + (pressed ? "true" : "false") + '" data-action="' + action + '" ' + attr + '="' + h(label) + '">' + h(label) + "</button>";
}
function stepSkills() {
  var html = '<div class="card"><h2>Skills</h2>' +
    '<div class="help">Tap a skill to add it. Tap again to remove it. Six to twelve is a good range. Pick only skills you could talk about in an interview.</div>';
  var sug = suggestedSkills();
  if (sug.length) {
    html += "<h3>Suggested from your work history</h3><div class=\"chips\">" +
      sug.map(function (s) { return chip(s, state.skills.indexOf(s) !== -1, "toggleSkill", "data-skill"); }).join("") + "</div>";
  }
  Object.keys(SKILL_GROUPS).forEach(function (g) {
    html += "<h3>" + h(g) + '</h3><div class="chips">' +
      SKILL_GROUPS[g].map(function (s) { return chip(s, state.skills.indexOf(s) !== -1, "toggleSkill", "data-skill"); }).join("") + "</div>";
  });
  var custom = state.skills.filter(function (s) {
    if (sug.indexOf(s) !== -1) return false;
    return !Object.keys(SKILL_GROUPS).some(function (g) { return SKILL_GROUPS[g].indexOf(s) !== -1; });
  });
  html += "<h3>Your own skills</h3>";
  if (custom.length) html += '<div class="chips">' + custom.map(function (s) { return chip(s, true, "toggleSkill", "data-skill"); }).join("") + "</div>";
  html += '<div class="bullet-row"><input type="text" id="customSkill" aria-label="Type a skill" placeholder="Type a skill, then tap Add">' +
    '<button class="small" data-action="addCustomSkill">Add</button></div>';
  html += '<p class="help">Selected: ' + state.skills.length + "</p>";
  return html + navButtons() + "</div>";
}
function hasCert(name) {
  return state.certs.some(function (c) { return t(c.name).toLowerCase() === name.toLowerCase(); });
}
function stepCerts() {
  var html = '<div class="card"><h2>Certifications and training</h2>' +
    '<div class="help">Licenses, certificates, and training programs you finished. List only ones you completed and can show proof of.</div>' +
    datalist("certList", CERT_SUGGESTIONS);
  html += "<h3>Programs offered in Louisiana prisons</h3>" +
    '<div class="help">Open a group and tap each one you earned. Tap again to remove it. Then add the year below.</div>';
  CERT_GROUPS.forEach(function (g, gi) {
    var count = g.items.filter(function (it) { return hasCert(it[0]); }).length;
    html += '<details class="group" data-g="' + gi + '"' + (openGroups[gi] ? " open" : "") + "><summary>" + h(g.group) +
      (count ? ' <span class="count">' + count + " added</span>" : "") + "</summary>" +
      (g.note ? '<div class="help">' + h(g.note) + "</div>" : "") + '<div class="chips">' +
      g.items.map(function (it, k) {
        return '<button class="chip" aria-pressed="' + (hasCert(it[0]) ? "true" : "false") + '" data-action="toggleCert" data-g="' + gi + '" data-k="' + k + '">' + h(it[0]) + "</button>";
      }).join("") + "</div></details>";
  });
  html += '<div class="tip">Lost your certificate? Many can be looked up. NCCER keeps a national registry of the credentials it issues, and staff can help you request copies.</div>';
  html += "<h3>Your certifications" + (state.certs.length ? " (" + state.certs.length + ")" : "") + "</h3>";
  if (!state.certs.length) html += '<p class="help">None added yet. Tap one above, or add one that is not listed.</p>';
  state.certs.forEach(function (c, i) {
    var p = "certs." + i;
    html += '<div class="entry"><div class="entry-head"><strong>Certification ' + (i + 1) + "</strong>" +
      '<button class="small danger" data-action="removeItem" data-list="certs" data-i="' + i + '">Remove</button></div>' +
      field("Name of certification or training", p + ".name", { list: "certList", placeholder: "For example: ServSafe Food Handler" }) +
      '<div class="row"><div>' + field("Who gave it (optional)", p + ".org", { placeholder: "For example: ServSafe" }) + "</div>" +
      "<div>" + field("Year", p + ".year", { placeholder: "2024", mode: "numeric" }) + "</div></div></div>";
  });
  html += '<div class="actions"><button data-action="addCert">Add one that is not listed</button></div>';
  return html + navButtons() + "</div>";
}
function stepEdu() {
  var html = '<div class="card"><h2>Education</h2>' +
    '<div class="help">High school diploma, HiSET or GED, college classes, or degrees. For the school, list the school or organization that gave the credential.</div>' +
    datalist("eduList", EDU_SUGGESTIONS) + datalist("schoolList", PRISON_SCHOOLS);
  html += "<h3>Quick add</h3>" +
    '<div class="help">Tap to start an entry, then fill in the details below.</div>' +
    '<div class="quick"><button class="small" data-action="addEduQuick" data-cred="High School Equivalency Diploma (HiSET)">HiSET</button>' +
    '<button class="small" data-action="addEduQuick" data-cred="GED">GED</button>' +
    '<button class="small" data-action="addEduQuick" data-cred="High School Diploma">High school diploma</button></div>' +
    '<details class="group" data-g="edu"' + (openGroups.edu ? " open" : "") + "><summary>Colleges that teach inside Louisiana prisons</summary>" +
    '<div class="quick">' + PRISON_SCHOOLS.map(function (s) {
      return '<button class="small" data-action="addEduQuick" data-school="' + h(s) + '">' + h(s) + "</button>";
    }).join("") + "</div></details>";
  state.education.forEach(function (ed, i) {
    var p = "education." + i;
    html += '<div class="entry"><div class="entry-head"><strong>Education ' + (i + 1) + "</strong>" +
      '<button class="small danger" data-action="removeItem" data-list="education" data-i="' + i + '">Remove</button></div>' +
      field("Diploma, degree, or credential", p + ".credential", { list: "eduList", placeholder: "For example: HiSET (High School Equivalency)" }) +
      field("Subject (optional)", p + ".field", { placeholder: "For example: Business Administration" }) +
      field("School or organization", p + ".school", { list: "schoolList", placeholder: "Who gave the credential" }) +
      '<div class="row"><div>' + field("City and state (optional)", p + ".location") + "</div>" +
      "<div>" + field("Year finished", p + ".year", { placeholder: "2019", mode: "numeric" }) + "</div></div>" +
      field("One more detail (optional)", p + ".detail", { placeholder: "For example: Completed 30 credit hours toward an associate degree" }) +
      "</div>";
  });
  html += '<div class="actions"><button data-action="addEdu">Add education</button></div>';
  return html + navButtons() + "</div>";
}
function stepSummary() {
  var html = '<div class="card"><h2>Summary</h2>' +
    '<div class="help">Two or three sentences at the top of your resume that tell an employer who you are as a worker. Answer the questions below and the tool will write a first draft. Then change it so it sounds like you.</div>' +
    '<div class="row"><div>' + field("Years of experience (optional)", "summaryHelp.years", { placeholder: "10", mode: "numeric" }) + "</div>" +
    "<div>" + field("In what kind of work?", "summaryHelp.field", { placeholder: "food service and kitchen work" }) + "</div></div>" +
    '<h3>Pick up to three strengths</h3><div class="chips">' +
    STRENGTHS.map(function (s) { return chip(s, state.summaryHelp.strengths.indexOf(s) !== -1, "toggleStrength", "data-strength"); }).join("") + "</div>" +
    '<div class="actions"><button data-action="draftSummary">Write a draft for me</button></div>' +
    '<label class="field" for="summaryText">Your summary</label>' +
    '<textarea id="summaryText" data-bind="summary" placeholder="Your summary will appear here. You can also write your own.">' + h(state.summary) + "</textarea>";
  return html + navButtons() + "</div>";
}
function previewHtml(s) {
  var html = "", inList = false;
  function closeList() { if (inList) { html += "</ul>"; inList = false; } }
  outline(s || state).forEach(function (item) {
    if (item.kind === "bullet") { if (!inList) { html += "<ul>"; inList = true; } html += "<li>" + h(item.text) + "</li>"; return; }
    closeList();
    if (item.kind === "name") html += '<p class="name">' + (h(item.text) || "Your Name") + "</p>";
    else if (item.kind === "contact") html += '<p class="contact">' + h(item.text) + "</p>";
    else if (item.kind === "heading") html += '<p class="sec">' + h(item.text) + "</p>";
    else if (item.kind === "bold") html += '<p class="b">' + h(item.text) + "</p>";
    else if (item.kind === "blank") html += '<div class="gap"></div>';
    else html += "<p>" + h(item.text) + "</p>";
  });
  closeList();
  return html;
}
function stepReview() {
  var checks = runChecks(state);
  var html = '<div class="card"><h2>Review and download</h2><div class="no-print">';
  var st = stepStatus(state);
  html += '<h3>Your progress</h3><ul class="steplist">' + STEPS.map(function (s, i) {
    var v = st[s.id];
    if (!v) return "";
    var label = v === "done" ? '<span class="ok">✓ Done</span>' : v === "optional" ? '<span class="opt">Optional</span>' : '<span class="todo">Not finished</span>';
    return "<li>" + label + ' <button class="linkish" data-action="goStep" data-i="' + i + '">' + h(s.title) + "</button></li>";
  }).join("") + "</ul>";
  html += "<h3>Things to check</h3>" + checks.map(function (c) { return '<div class="msg ' + c.level + '">' + h(c.text) + "</div>"; }).join("");
  var kw = keywordMatch(state);
  if (kw) {
    html += "<h3>Words from the job posting</h3>";
    if (!kw.length) html += '<p class="help">None of the common job words this tool knows were found in the posting. Read the posting yourself and use its words where they are true for you.</p>';
    else {
      html += '<p class="help">Green words are already in your resume. Yellow words are in the posting but not your resume yet. Add a yellow word only if it is true for you.</p><div>' +
        kw.map(function (k) { return '<span class="kw ' + (k.inResume ? "yes" : "no") + '">' + (k.inResume ? "✓ " : "") + h(k.term) + "</span>"; }).join("") + "</div>" +
        '<p class="help">This list only checks common job words. Read the posting for others.</p>';
    }
  }
  html += '<h3>Get your resume</h3><div class="actions">' +
    '<button class="primary" data-action="downloadDocx">Download Word file</button>' +
    '<button data-action="print">Print or save as PDF</button>' +
    '<button data-action="copyText">Copy text for online applications</button></div>' +
    '<div id="copyMsg"></div>' +
    '<h3>Save your work for later</h3><div class="help">This saves your answers in a small file so you can open it here again and keep editing. On a shared computer, delete the saved files from the Downloads folder when you are done.</div>' +
    '<div class="actions"><button data-action="saveJson">Save my work</button>' +
    '<button class="danger" data-action="clearAll">Clear everything</button></div>' +
    "<h3>Preview</h3></div>" +
    '<div id="preview-wrap" class="print-area"><div id="preview" class="preview-box">' + previewHtml() + "</div></div>" +
    '<div class="no-print"><h3>What hiring software reads</h3><div class="help">Hiring software turns your resume into plain text like this. Check that everything is here and in order. You can also paste this into job sites that ask for your resume in a box.</div>' +
    '<textarea id="plainText" readonly style="min-height:220px">' + h(buildPlainText(state)) + "</textarea></div>";
  return html + navButtons() + "</div>";
}

function stepLetter() {
  var L = state.letter;
  var html = '<div class="card"><h2>Cover letter (optional)</h2>' +
    '<div class="help">Some employers ask for a short letter with your resume. Answer a few questions and the tool will write a first draft from your resume. Then change it so it sounds like you.</div>' +
    '<div class="row"><div>' + field("Company name", "letter.company", { placeholder: "For example: Bayou Grill" }) + "</div>" +
    "<div>" + field("Person to address (optional)", "letter.contact", { placeholder: "For example: Ms. Johnson" }) + "</div></div>" +
    field("Job title", "letter.title", { placeholder: t(state.goal.title) || "The job you are applying for" }) +
    field("Where did you hear about the job? (optional)", "letter.source", { placeholder: "For example: Indeed, a friend, a reentry program" }) +
    '<div class="actions"><button data-action="draftLetter">Write a draft for me</button></div>' +
    '<label class="field" for="letterText">Your letter</label>' +
    '<textarea id="letterText" class="letter" data-bind="letter.text" placeholder="Your letter will appear here. You can also write your own.">' + h(L.text) + "</textarea>" +
    '<div class="tip">Keep it short and true. You do not need to mention your conviction in the letter. That conversation belongs in the interview.</div>' +
    '<div class="actions"><button class="primary" data-action="downloadLetter">Download Word file</button>' +
    '<button data-action="printLetter">Print or save as PDF</button>' +
    '<button data-action="copyLetter">Copy text</button></div><div id="letterMsg"></div>' +
    '<div class="print-area letter-print">' + h(L.text) + "</div>";
  return html + navButtons() + "</div>";
}

/* ----- Read aloud (uses the device's own voices, which work offline) ----- */
var canSpeak = typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";
var speaking = false;
function pickVoice() {
  var voices = window.speechSynthesis.getVoices() || [];
  var en = voices.filter(function (v) { return /^en(-|_)US/i.test(v.lang); });
  return en.filter(function (v) { return v.localService; })[0] || en[0] || voices.filter(function (v) { return v.localService; })[0] || null;
}
function stopSpeaking() {
  if (canSpeak) window.speechSynthesis.cancel();
  speaking = false;
  var b = document.getElementById("speakBtn");
  if (b) b.textContent = "🔊 Read this to me";
}
function speakCard() {
  if (!canSpeak) return;
  if (speaking) { stopSpeaking(); return; }
  var card = document.querySelector("#app .card");
  if (!card) return;
  var parts = [];
  card.querySelectorAll("h2, h3, p, li, .help, .tip, label.field, .msg, summary").forEach(function (el) {
    if (el.closest(".example-box, .preview-box, .print-area, .chips, #speakBtn")) return;
    var txt = (el.innerText || "").replace(/\s+/g, " ").trim();
    if (txt && parts.indexOf(txt) === -1) parts.push(txt);
  });
  var u = new SpeechSynthesisUtterance(parts.join(". ").replace(/\.\./g, "."));
  var v = pickVoice();
  if (v) u.voice = v;
  u.rate = 0.9;
  u.onend = u.onerror = function () { speaking = false; var b = document.getElementById("speakBtn"); if (b) b.textContent = "🔊 Read this to me"; };
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
  speaking = true;
  var b = document.getElementById("speakBtn");
  if (b) b.textContent = "■ Stop reading";
}
function addSpeakButton() {
  if (!canSpeak) return;
  var card = document.querySelector("#app .card");
  var h2 = card && card.querySelector("h2");
  if (!h2) return;
  var b = document.createElement("button");
  b.id = "speakBtn";
  b.className = "small speak no-print";
  b.setAttribute("data-action", "speak");
  b.textContent = speaking ? "■ Stop reading" : "🔊 Read this to me";
  h2.insertAdjacentElement("afterend", b);
}

function render() {
  renderProgress();
  var id = STEPS[step].id, html = "";
  if (id === "start") html = stepStart();
  else if (id === "contact") html = stepContact();
  else if (id === "goal") html = stepGoal();
  else if (id === "work") html = stepEntries("work");
  else if (id === "skills") html = stepSkills();
  else if (id === "certs") html = stepCerts();
  else if (id === "edu") html = stepEdu();
  else if (id === "vol") html = stepEntries("volunteer");
  else if (id === "summary") html = stepSummary();
  else if (id === "letter") html = stepLetter();
  else html = stepReview();
  document.getElementById("app").innerHTML = html;
  addSpeakButton();
  addExampleButton();
  exampleBanner();
}
function rerenderKeepScroll() {
  var y = window.scrollY;
  render();
  window.scrollTo(0, y);
}
function goTo(n) { exampleOpen = false;
  stopSpeaking();
  step = Math.max(0, Math.min(STEPS.length - 1, n));
  render();
  window.scrollTo(0, 0);
}

function download(bytesOrText, filename, mime) {
  var blob = new Blob([bytesOrText], { type: mime });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
}
function copyPlain() { copyText(buildPlainText(state), "copyMsg", "plainText"); }
function copyText(text, msgId, boxId) {
  var msg = document.getElementById(msgId);
  function done(ok) {
    msg.innerHTML = ok ? '<div class="msg good">Copied. Paste it into the application with Ctrl+V (or Cmd+V on a Mac).</div>'
      : '<div class="msg warn">Could not copy automatically. Select the text in the box and copy it.</div>';
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function () { done(true); }, function () { fallback(); });
  } else fallback();
  function fallback() {
    var ta = document.getElementById(boxId);
    try { ta.focus(); ta.select(); done(document.execCommand("copy")); } catch (e) { done(false); }
  }
}

document.addEventListener("input", function (ev) {
  var el = ev.target;
  var path = el.getAttribute("data-bind");
  if (path && el.tagName !== "SELECT") setPath(path, el.value);
});
document.addEventListener("change", function (ev) {
  var el = ev.target;
  if (el.getAttribute("data-action") === "jump") { goTo(parseInt(el.value, 10)); return; }
  var path = el.getAttribute("data-bind");
  if (path && el.tagName === "SELECT") { setPath(path, el.value); if (el.getAttribute("data-rerender")) rerenderKeepScroll(); return; }
  var cpath = el.getAttribute("data-bind-check");
  if (cpath) { setPath(cpath, el.checked); rerenderKeepScroll(); return; }
  if (el.id === "loadFile" && el.files && el.files[0]) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        state = mergeState(JSON.parse(reader.result)); exampleMode = false;
        dirty = false;
        goTo(1);
      } catch (e) {
        document.getElementById("loadMsg").innerHTML = '<div class="msg bad">That file could not be opened. Choose a file saved by this tool.</div>';
      }
    };
    reader.readAsText(el.files[0]);
  }
});
document.addEventListener("keydown", function (ev) {
  if (ev.key === "Enter" && ev.target.id === "customSkill") { ev.preventDefault(); document.querySelector('[data-action="addCustomSkill"]').click(); }
});
document.addEventListener("click", function (ev) {
  var el = ev.target.closest("[data-action]");
  if (!el || el.tagName === "SELECT") return;
  var a = el.getAttribute("data-action");
  var list = el.getAttribute("data-list");
  var i = parseInt(el.getAttribute("data-i"), 10);
  switch (a) {
    case "next": goTo(step + 1); break;
    case "prev": goTo(step - 1); break;
    case "goStep": goTo(i); break;
    case "speak": speakCard(); break;
    case "toggleExample": showExample = !showExample; rerenderKeepScroll(); break;
    case "draftLetter":
      if (t(state.letter.text) && !confirm("Replace what is in the letter box with a new draft?")) break;
      state.letter.text = draftLetter(state); dirty = true; rerenderKeepScroll(); break;
    case "downloadLetter":
      if (!t(state.letter.text)) { alert("Write or draft your letter first."); break; }
      download(buildLetterDocxBytes(state), fileBaseName(state, "Cover Letter") + ".docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      break;
    case "printLetter":
      if (!t(state.letter.text)) { alert("Write or draft your letter first."); break; }
      rerenderKeepScroll(); window.print(); break;
    case "copyLetter": copyText(state.letter.text, "letterMsg", "letterText"); break;
    case "openFile": document.getElementById("loadFile").click(); break;
    case "addEntry": state[list].push(newEntry()); dirty = true; rerenderKeepScroll(); break;
    case "removeEntry":
    case "removeItem":
      if (confirm("Remove this section?")) { state[list].splice(i, 1); dirty = true; rerenderKeepScroll(); }
      break;
    case "moveUp":
      var tmp = state[list][i - 1]; state[list][i - 1] = state[list][i]; state[list][i] = tmp; dirty = true; rerenderKeepScroll(); break;
    case "addBullet": state[list][i].bullets.push(""); dirty = true; rerenderKeepScroll(); break;
    case "removeBullet": state[list][i].bullets.splice(parseInt(el.getAttribute("data-j"), 10), 1); dirty = true; rerenderKeepScroll(); break;
    case "useSuggestion":
      var e = state[list][i];
      var b = JOBS[e.type].bullets[parseInt(el.getAttribute("data-k"), 10)];
      if (e.bullets.indexOf(b) === -1) {
        var emptyAt = e.bullets.indexOf("");
        if (emptyAt !== -1) e.bullets[emptyAt] = b; else e.bullets.push(b);
      }
      dirty = true; rerenderKeepScroll(); break;
    case "fillEmployer": state[list][i].employer = el.getAttribute("data-value"); dirty = true; rerenderKeepScroll(); break;
    case "toggleSkill":
      var s = el.getAttribute("data-skill"), at = state.skills.indexOf(s);
      if (at === -1) state.skills.push(s); else state.skills.splice(at, 1);
      dirty = true; rerenderKeepScroll(); break;
    case "addCustomSkill":
      var box = document.getElementById("customSkill"), v = t(box.value);
      if (v && state.skills.indexOf(v) === -1) state.skills.push(v);
      dirty = true; rerenderKeepScroll();
      var nb = document.getElementById("customSkill"); if (nb) nb.focus();
      break;
    case "toggleStrength":
      var st = el.getAttribute("data-strength"), arr = state.summaryHelp.strengths, pos = arr.indexOf(st);
      if (pos !== -1) arr.splice(pos, 1); else if (arr.length < 3) arr.push(st);
      else { alert("You can pick up to three. Tap one you picked to remove it first."); }
      dirty = true; rerenderKeepScroll(); break;
    case "draftSummary":
      var d = draftSummary(state);
      if (!d) { alert("Answer at least one question above first."); break; }
      if (t(state.summary) && !confirm("Replace what is in the summary box with a new draft?")) break;
      state.summary = d; dirty = true; rerenderKeepScroll(); break;
    case "addCert": state.certs.push({ name: "", org: "", year: "" }); dirty = true; rerenderKeepScroll(); break;
    case "toggleCert":
      var item = CERT_GROUPS[parseInt(el.getAttribute("data-g"), 10)].items[parseInt(el.getAttribute("data-k"), 10)];
      var ci = -1;
      state.certs.forEach(function (c, idx) { if (t(c.name).toLowerCase() === item[0].toLowerCase()) ci = idx; });
      if (ci === -1) state.certs.push({ name: item[0], org: item[1], year: "" });
      else if (!t(state.certs[ci].year) || confirm("Remove " + item[0] + "?")) state.certs.splice(ci, 1);
      dirty = true; rerenderKeepScroll(); break;
    case "addEduQuick":
      state.education.push({ credential: el.getAttribute("data-cred") || "", field: "", school: el.getAttribute("data-school") || "", location: "", year: "", detail: "" });
      dirty = true; rerenderKeepScroll(); break;
    case "addEdu": state.education.push({ credential: "", field: "", school: "", location: "", year: "", detail: "" }); dirty = true; rerenderKeepScroll(); break;
    case "downloadDocx":
      if (!t(state.contact.name)) { alert("Add your name first (step 2)."); break; }
      download(buildDocxBytes(state), fileBaseName(state) + ".docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      break;
    case "print": window.print(); break;
    case "copyText": copyPlain(); break;
    case "saveJson":
      download(JSON.stringify(state, null, 2), fileBaseName(state) + " (saved work).json", "application/json");
      dirty = false; break;
    case "tryExample": startExample(1); break;
    case "toggleStepExample": exampleOpen = !exampleOpen; rerenderKeepScroll(); break;
    case "endExample": endExample(); break;
    case "clearAll":
      if (confirm("Clear everything you entered on this device? Save your work first if you want to keep it.")) {
        state = newState(); exampleMode = false; dirty = false; goTo(0);
      }
      break;
  }
});
document.addEventListener("toggle", function (ev) {
  var d = ev.target;
  if (d.tagName === "DETAILS" && d.hasAttribute("data-g")) openGroups[d.getAttribute("data-g")] = d.open;
}, true);
window.addEventListener("beforeunload", function (ev) {
  if (dirty) { ev.preventDefault(); ev.returnValue = ""; }
});
render();
