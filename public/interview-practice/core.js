/* ---------- Content ---------- */
var STORY_PARTS = [
  { key: "own", title: "Say it plainly", help: "Answer the question honestly and briefly. You do not need to go into the details of the case unless they ask.",
    starters: ["Yes. I was convicted of a felony in ___.", "Yes, I have a conviction from ___, and I'm glad to talk about it.", "Yes. I served ___ years for a mistake I made when I was ___."] },
  { key: "resp", title: "Take responsibility", help: "One or two sentences. Do not blame other people or explain the case.",
    starters: ["I take full responsibility for what I did.", "I made a serious mistake, and I own it.", "I'm not proud of who I was then, and I've worked hard to change."] },
  { key: "time", title: "What you did with the time", help: "This is the most important part. Tap everything that is true for you, then fill in the blanks.",
    starters: ["While I was there, I earned my HiSET.", "I earned certifications in ___.", "I worked ___ years as a ___.", "I took college classes in ___.", "I mentored other people going through ___.", "I completed programs on ___.", "I kept a good conduct record and was trusted with ___."] },
  { key: "now", title: "Who you are now", help: "Say what changed and what you bring to work today.",
    starters: ["I learned how to show up, follow through, and work with all kinds of people.", "Today I'm focused on working hard and supporting my family.", "I have a strong support system, and I'm ready to work."] },
  { key: "bridge", title: "Bring it back to the job", help: "End by turning the conversation back to the job you want.",
    starters: ["I'm ready to bring that same work ethic to this job.", "I believe I'd be an asset to your team as a ___.", "That's why I'm excited about this position."] }
];
var TELL_PARTS = [
  { key: "present", title: "Who you are as a worker", starters: ["I'm a hard worker with ___ years of experience in ___.", "I'm a ___ who takes pride in doing the job right."] },
  { key: "past", title: "What you have done", starters: ["Most recently, I worked as a ___, where I ___.", "I've also earned certifications in ___."] },
  { key: "future", title: "Why this job", starters: ["I'm looking for steady work where I can keep learning, and this job fits that.", "I'm excited about this position because ___."] }
];
var QUESTIONS = [
  { id: "about", g: "Common questions", q: "Tell me about yourself.", secs: 60,
    why: "They want a short picture of you as a worker, not your life story.",
    tips: ["Use your answer from the “Tell me about yourself” step.", "Keep it to about a minute.", "End with why you want this job."] },
  { id: "why", g: "Common questions", q: "Why do you want to work here?", secs: 60,
    why: "They want to know you chose this job on purpose.",
    tips: ["Say one specific thing about the job or the company.", "It is fine to say you want steady work where you can grow.", "If you can, learn a little about the company before the interview."] },
  { id: "strengths", g: "Common questions", q: "What are your strengths?", secs: 60,
    why: "They want to hear what you do well and some proof of it.",
    tips: ["Pick two strengths that fit this job.", "Give a quick example from a job for each one.", "For example: “I'm dependable. In my last job I was never late in five years.”"] },
  { id: "improve", g: "Common questions", q: "What is something you are working to improve?", secs: 60,
    why: "They want to see that you are honest and keep learning.",
    tips: ["Pick something real that will not stop you from doing this job.", "Say what you are doing about it.", "For example, computers: “I'm practicing every week and getting faster.”"] },
  { id: "hire", g: "Common questions", q: "Why should we hire you?", secs: 60,
    why: "They want you to connect your skills to what they need.",
    tips: ["Name two or three things from the job posting that you can do.", "Add one thing about your attitude, like showing up every day.", "Say it with confidence. It is not bragging if it is true."] },
  { id: "avail", g: "Common questions", q: "What is your availability? Do you have reliable transportation?", secs: 45,
    why: "They need to know you can be there when they need you.",
    tips: ["Be honest about the days and hours you can work.", "If you have regular appointments, you can say you have a few scheduled appointments and will plan them around your shifts.", "Know how you will get to work before the interview."] },
  { id: "future", g: "Common questions", q: "Where do you see yourself in a year?", secs: 45,
    why: "They want to know if you plan to stay and grow.",
    tips: ["Say you want to be good at this job and take on more.", "If the company promotes from within, say you would like to move up."] },
  { id: "pay", g: "Common questions", q: "What pay are you looking for?", secs: 30,
    why: "They want to know if their pay fits what you expect.",
    tips: ["Look up what this kind of job usually pays before you go.", "Give a range, and say you are flexible.", "For example: “Jobs like this usually pay about $14 to $16 an hour, and I'm flexible.”"] },
  { id: "conviction", g: "About your background", q: "Have you ever been convicted of a crime? Can you tell me about it?", secs: 60,
    why: "They want to see how you talk about it: honest, brief, and focused on now.",
    tips: ["Use your answer from the “Your story” step.", "Stay calm. A steady answer matters more than the conviction itself to many employers.", "Answer honestly. Do not go into the details of the case unless they ask."] },
  { id: "gap", g: "About your background", q: "Can you explain this gap in your work history?", secs: 45,
    why: "They noticed years with no outside job and want to understand them.",
    tips: ["Be brief and honest about where you were.", "Talk about the work, training, and certificates from that time.", "Bring it back to why you are ready now."] },
  { id: "inside", g: "About your background", q: "What did you do while you were incarcerated?", secs: 60,
    why: "This is a chance to show your work and training.",
    tips: ["Talk about jobs, certificates, classes, and mentoring.", "Use numbers if you can: how many years, how many people.", "Connect it to this job."] },
  { id: "chance", g: "About your background", q: "Why should we take a chance on you?", secs: 60,
    why: "They may be worried. They want a reason to trust you.",
    tips: ["Do not get defensive. It is a fair question.", "Point to proof: work history, certificates, people who will vouch for you.", "Say what you will do in the first months to earn their trust."] },
  { id: "younger", g: "About your background", q: "How would you feel working for a supervisor younger than you?", secs: 45,
    why: "They want to know you can take direction from anyone.",
    tips: ["Say age does not matter to you. Experience and respect do.", "Mention a time you learned from someone younger, if you can."] },
  { id: "conflict", g: "Work situations", q: "Tell me about a time you had a conflict with a coworker.", secs: 90,
    why: "They want to see that you can stay calm and work things out.",
    tips: ["Use three parts: what happened, what you did, how it turned out.", "Pick a story where you stayed calm and solved it.", "Do not put the other person down."] },
  { id: "mistake", g: "Work situations", q: "Tell me about a time you made a mistake at work.", secs: 90,
    why: "They want to see that you own mistakes and fix them.",
    tips: ["Pick a small work mistake, not your case.", "Say what you did to fix it and what you learned.", "What happened, what you did, how it turned out."] },
  { id: "learn", g: "Work situations", q: "Tell me about a time you had to learn something new quickly.", secs: 90,
    why: "Every new job means learning. They want to know you can.",
    tips: ["A training program or a new job inside works well here.", "Say how you learned it: asking questions, practicing, taking notes."] },
  { id: "customer", g: "Work situations", q: "How would you handle a customer who is upset?", secs: 60,
    why: "They want to know you will stay calm and polite.",
    tips: ["Listen first, then say you understand.", "Fix what you can, and get a supervisor if you cannot.", "Keep your voice calm, even if they are not."] },
  { id: "feedback", g: "Work situations", q: "Tell me about a time a supervisor corrected you.", secs: 90,
    why: "They want to know you can take correction without arguing.",
    tips: ["Show that you listened, said okay, and did it the new way.", "If you disagreed, say you asked a question calmly, later.", "End with what you learned."] },
  { id: "ask", g: "End of the interview", q: "Do you have any questions for us?", secs: 45,
    why: "Asking a question shows you are interested.",
    tips: ["Always ask one or two. Pick them on the “Questions to ask them” step.", "Pay and benefits are fair to ask about, often near the end."] }
];
var ASK_THEM = [
  "What does a normal day look like in this job?",
  "What would make someone successful here in the first few months?",
  "Is there training when I start?",
  "What are the hours and schedule for this position?",
  "Are there chances to move up for people who do well?",
  "What do you like about working here?",
  "What are the next steps after this interview?"
];
var DAY_CHECKS = [
  "I know the address, how I will get there, and how long it takes.",
  "I will arrive 10 to 15 minutes early.",
  "My clothes are clean and fit the job.",
  "I have copies of my resume, my ID, and a pen.",
  "I have the name of the person I am meeting.",
  "I practiced my story and “Tell me about yourself” out loud.",
  "My phone will be on silent before I walk in.",
  "I picked one or two questions to ask them."
];

/* ---------- State ---------- */
function newState() {
  var s = { version: 1, story: {}, tell: {}, notes: {}, practiced: {}, ask: [], askOwn: "", checks: {}, job: { title: "", company: "", person: "" }, name: "" };
  STORY_PARTS.forEach(function (p) { s.story[p.key] = ""; });
  TELL_PARTS.forEach(function (p) { s.tell[p.key] = ""; });
  return s;
}
function mergeState(x) {
  var s = newState();
  if (!x || typeof x !== "object") return s;
  ["story", "tell", "notes", "practiced", "checks", "job"].forEach(function (k) {
    if (x[k] && typeof x[k] === "object") Object.keys(x[k]).forEach(function (f) { s[k][f] = x[k][f]; });
  });
  if (Array.isArray(x.ask)) s.ask = x.ask.filter(function (a) { return typeof a === "string"; });
  if (typeof x.askOwn === "string") s.askOwn = x.askOwn;
  if (typeof x.name === "string") s.name = x.name;
  return s;
}
function t(v) { return (v === undefined || v === null) ? "" : String(v).trim(); }
function joinParts(obj, parts) { return parts.map(function (p) { return t(obj[p.key]).replace(/\s*\n\s*/g, " "); }).filter(Boolean).join(" "); }
function storyText(s) { return joinParts(s.story, STORY_PARTS); }
function tellText(s) { return joinParts(s.tell, TELL_PARTS); }
function words(x) { var m = t(x).match(/\S+/g); return m ? m.length : 0; }
/* About 130 spoken words a minute for a calm pace. */
function seconds(x) { return Math.round(words(x) / 130 * 60); }
function hasBlank(x) { return /_{2,}/.test(x || ""); }
function addStarter(current, starter) {
  var c = t(current);
  if (c.indexOf(starter) !== -1) return c;
  return c ? c + " " + starter : starter;
}

/* Fills "Tell me about yourself" from a file saved by the resume builder. */
function fromResume(r) {
  var out = { name: "", job: "", tell: {} };
  if (!r || typeof r !== "object" || !r.contact) return null;
  out.name = t(r.contact.name);
  out.job = r.goal ? t(r.goal.title) : "";
  var h = r.summaryHelp || {};
  if (t(h.years) && t(h.field)) out.tell.present = "I'm a hard worker with " + t(h.years) + " years of experience in " + t(h.field) + ".";
  var work = Array.isArray(r.work) ? r.work.filter(function (e) { return e && t(e.title); }) : [];
  if (work.length) {
    var e = work[0], b = (e.bullets || []).map(t).filter(function (x) { return x && !hasBlank(x); })[0];
    out.tell.past = "Most recently, I worked as " + (/^[aeiou]/i.test(t(e.title)) ? "an " : "a ") + t(e.title) + (b ? ", where I " + b.charAt(0).toLowerCase() + b.slice(1).replace(/\.$/, "") : "") + ".";
  }
  var certs = Array.isArray(r.certs) ? r.certs.map(function (c) { return c && t(c.name); }).filter(Boolean).slice(0, 3) : [];
  if (certs.length) out.tell.past = (out.tell.past ? out.tell.past + " " : "") + "I've also earned " + (certs.length === 1 ? certs[0] : certs.length === 2 ? certs[0] + " and " + certs[1] : certs.slice(0, -1).join(", ") + ", and " + certs[certs.length - 1]) + ".";
  if (out.job) out.tell.future = "I'm looking for steady work as " + (/^[aeiou]/i.test(out.job) ? "an " : "a ") + out.job + ", where I can keep learning, and this job fits that.";
  return out;
}

/* ---------- Example to try (a made-up person) ---------- */
function exampleWork() {
  var s = newState();
  s.name = "Andrew Example";
  s.job = { title: "HVAC Technician", company: "Gulf Mechanical", person: "Ms. Davis" };
  s.story = {
    own: "Yes. I was convicted of a felony in 2008.",
    resp: "I take full responsibility for what I did.",
    time: "While I was there, I earned my HiSET. I earned certifications in HVAC repair and refrigerant handling. I worked 15 years as a maintenance and HVAC technician.",
    now: "I learned how to show up, follow through, and work with all kinds of people.",
    bridge: "I'm ready to bring that same work ethic to this job."
  };
  s.tell = {
    present: "I'm a hard worker with 15 years of experience in building maintenance and HVAC repair.",
    past: "Most recently, I installed and repaired heating and air-conditioning units across 14 buildings. I've also earned HVAC Excellence and EPA Section 608 certifications.",
    future: "I'm looking for steady work as an HVAC technician, where I can keep learning, and this job fits that."
  };
  s.notes = { about: "Slow down. Smile at the end.", conviction: "Keep my voice steady, then stop and let them ask the next question." };
  s.practiced = { about: true, conviction: true, strengths: true };
  s.ask = [ASK_THEM[0], ASK_THEM[6]];
  s.checks = { 0: true, 2: true, 3: true };
  return s;
}

function thankYou(s) {
  var j = s.job;
  return "Thank you for meeting with me today" + (t(j.title) ? " about the " + t(j.title) + " position" : "") + ". " +
    "I enjoyed learning more about " + (t(j.company) || "the job") + ", and I'm excited about the chance to join your team. " +
    "Please let me know if you need anything else from me.\n\n" + (t(s.name) || "Your name");
}
function sheetText(s) {
  var L = ["MY INTERVIEW SHEET" + (t(s.job.title) ? ": " + t(s.job.title) : "") + (t(s.job.company) ? " at " + t(s.job.company) : ""), ""];
  if (t(s.job.person)) L.push("Meeting with: " + t(s.job.person), "");
  L.push("WHEN I WALK IN", "“Hi, I'm " + (t(s.name) || "___") + ". I'm here for " + (t(s.job.title) ? "the " + t(s.job.title) + " interview" : "an interview") + (t(s.job.person) ? " with " + t(s.job.person) : "") + ".”", "Stand, smile, look them in the eye, and shake hands if they offer.", "");
  if (tellText(s)) L.push("TELL ME ABOUT YOURSELF", tellText(s), "");
  if (storyText(s)) L.push("MY STORY", storyText(s), "");
  var qs = s.ask.concat(t(s.askOwn) ? [t(s.askOwn)] : []);
  if (qs.length) { L.push("QUESTIONS I WILL ASK"); qs.forEach(function (q) { L.push("- " + q); }); L.push(""); }
  L.push("AFTER: THANK-YOU MESSAGE", thankYou(s));
  return L.join("\n");
}
