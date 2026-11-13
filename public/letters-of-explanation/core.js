function t(v) { return (v === undefined || v === null) ? "" : String(v).trim(); }

/* ---------- Word (.docx) output, shared with the Reentry Resume Builder ---------- */
function xmlEsc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function smartQuotes(s) {
  return String(s)
    .replace(/(^|[\s(\[{—–-])'/g, "$1‘")
    .replace(/'/g, "’")
    .replace(/(^|[\s(\[{—–-])"/g, "$1“")
    .replace(/"/g, "”");
}
var PPR_SPACING = '<w:spacing w:before="0" w:after="0" w:line="240" w:lineRule="auto"/><w:contextualSpacing/>';
function wRun(text, opt) {
  opt = opt || {};
  var rpr = "";
  if (opt.b) rpr += "<w:b/><w:bCs/>";
  if (opt.sz) rpr += '<w:sz w:val="' + opt.sz + '"/><w:szCs w:val="' + opt.sz + '"/>';
  return "<w:r>" + (rpr ? "<w:rPr>" + rpr + "</w:rPr>" : "") +
    '<w:t xml:space="preserve">' + xmlEsc(smartQuotes(text)) + "</w:t></w:r>";
}
function wPara(inner, ppr) {
  return "<w:p><w:pPr>" + (ppr || "") + PPR_SPACING + "</w:pPr>" + (inner || "") + "</w:p>";
}
function docxWrap(bodyXml) {
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" ' +
    'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:body>' +
    bodyXml +
    '<w:sectPr><w:pgSz w:w="12240" w:h="15840"/>' +
    '<w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>' +
    "</w:sectPr></w:body></w:document>";
}
var FONT = '<w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:eastAsia="Times New Roman" w:cs="Times New Roman"/>';
var STYLES_XML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
  '<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
  "<w:docDefaults><w:rPrDefault><w:rPr>" + FONT +
  '<w:sz w:val="24"/><w:szCs w:val="24"/><w:lang w:val="en-US" w:eastAsia="en-US" w:bidi="ar-SA"/></w:rPr></w:rPrDefault>' +
  '<w:pPrDefault><w:pPr><w:spacing w:before="0" w:after="0" w:line="240" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>' +
  '<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/>' +
  "<w:pPr>" + PPR_SPACING + "</w:pPr><w:rPr>" + FONT + '<w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr></w:style>' +
  '<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/>' +
  "<w:pPr><w:keepNext/>" + PPR_SPACING + '<w:outlineLvl w:val="0"/></w:pPr>' +
  "<w:rPr>" + FONT + '<w:b/><w:bCs/><w:color w:val="000000"/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr></w:style>' +
  '<w:style w:type="character" w:default="1" w:styleId="DefaultParagraphFont"><w:name w:val="Default Paragraph Font"/><w:uiPriority w:val="1"/><w:semiHidden/></w:style>' +
  "</w:styles>";
var NUMBERING_XML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
  '<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
  '<w:abstractNum w:abstractNumId="0"><w:multiLevelType w:val="singleLevel"/>' +
  '<w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="•"/><w:lvlJc w:val="left"/>' +
  '<w:pPr><w:ind w:left="360" w:hanging="360"/></w:pPr><w:rPr>' + FONT + "</w:rPr></w:lvl></w:abstractNum>" +
  '<w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num></w:numbering>';
var CONTENT_TYPES_XML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
  '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
  '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
  '<Default Extension="xml" ContentType="application/xml"/>' +
  '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
  '<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>' +
  '<Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>' +
  '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>' +
  '<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>' +
  "</Types>";
var ROOT_RELS_XML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
  '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
  '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
  '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>' +
  '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>' +
  "</Relationships>";
var DOC_RELS_XML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
  '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
  '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
  '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>' +
  "</Relationships>";
var APP_XML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
  '<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"></Properties>';
function coreXml(s, title) {
  var now = new Date().toISOString().replace(/\.\d+Z$/, "Z");
  var who = xmlEsc(t(s.contact.name));
  var docTitle = xmlEsc(title || "Resume");
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" ' +
    'xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" ' +
    'xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' +
    "<dc:title>" + docTitle + (who ? " - " + who : "") + "</dc:title><dc:creator>" + who + "</dc:creator>" +
    "<cp:lastModifiedBy>" + who + "</cp:lastModifiedBy>" +
    '<dcterms:created xsi:type="dcterms:W3CDTF">' + now + "</dcterms:created>" +
    '<dcterms:modified xsi:type="dcterms:W3CDTF">' + now + "</dcterms:modified></cp:coreProperties>";
}

/* Minimal ZIP writer (stored, no compression), enough for a .docx package. */
var CRC_TABLE = (function () {
  var tbl = new Uint32Array(256);
  for (var n = 0; n < 256; n++) {
    var c = n;
    for (var k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    tbl[n] = c >>> 0;
  }
  return tbl;
})();
function crc32(bytes) {
  var c = 0xFFFFFFFF;
  for (var i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}
function zipStore(files) {
  var enc = new TextEncoder();
  var chunks = [], central = [], offset = 0;
  files.forEach(function (f) {
    var name = enc.encode(f.name);
    var data = typeof f.data === "string" ? enc.encode(f.data) : f.data;
    var crc = crc32(data);
    var lh = new DataView(new ArrayBuffer(30));
    lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true);
    lh.setUint16(8, 0, true); lh.setUint16(10, 0, true); lh.setUint16(12, 0x0021, true);
    lh.setUint32(14, crc, true); lh.setUint32(18, data.length, true); lh.setUint32(22, data.length, true);
    lh.setUint16(26, name.length, true); lh.setUint16(28, 0, true);
    chunks.push(new Uint8Array(lh.buffer), name, data);
    var ch = new DataView(new ArrayBuffer(46));
    ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true);
    ch.setUint16(8, 0x0800, true); ch.setUint16(10, 0, true); ch.setUint16(12, 0, true); ch.setUint16(14, 0x0021, true);
    ch.setUint32(16, crc, true); ch.setUint32(20, data.length, true); ch.setUint32(24, data.length, true);
    ch.setUint16(28, name.length, true); ch.setUint16(30, 0, true); ch.setUint16(32, 0, true);
    ch.setUint16(34, 0, true); ch.setUint16(36, 0, true); ch.setUint32(38, 0, true); ch.setUint32(42, offset, true);
    central.push(new Uint8Array(ch.buffer), name);
    offset += 30 + name.length + data.length;
  });
  var cdSize = central.reduce(function (a, b) { return a + b.length; }, 0);
  var end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true); end.setUint16(4, 0, true); end.setUint16(6, 0, true);
  end.setUint16(8, files.length, true); end.setUint16(10, files.length, true);
  end.setUint32(12, cdSize, true); end.setUint32(16, offset, true); end.setUint16(20, 0, true);
  var all = chunks.concat(central, [new Uint8Array(end.buffer)]);
  var total = all.reduce(function (a, b) { return a + b.length; }, 0);
  var out = new Uint8Array(total), pos = 0;
  all.forEach(function (b) { out.set(b, pos); pos += b.length; });
  return out;
}
function buildDocxBytes(s, documentXml, title) {
  return zipStore([
    { name: "[Content_Types].xml", data: CONTENT_TYPES_XML },
    { name: "_rels/.rels", data: ROOT_RELS_XML },
    { name: "docProps/core.xml", data: coreXml(s, title) },
    { name: "docProps/app.xml", data: APP_XML },
    { name: "word/_rels/document.xml.rels", data: DOC_RELS_XML },
    { name: "word/document.xml", data: documentXml || docxDocumentXml(s) },
    { name: "word/styles.xml", data: STYLES_XML },
    { name: "word/numbering.xml", data: NUMBERING_XML }
  ]);
}
function fileBaseName(s, kind) {
  kind = kind || "Resume";
  var n = t(s.contact.name).replace(/[^A-Za-z0-9 .'-]/g, "").replace(/\s+/g, " ").trim();
  return n ? kind + " - " + n : kind;
}

/* ---------- Letter types ---------- */
var TYPES = {
  reference: { label: "Asking someone for a reference letter", short: "Reference request",
    note: "To a teacher, supervisor, chaplain, mentor, or case manager who knows your work." },
  landlord: { label: "To a landlord or housing authority", short: "Landlord letter",
    note: "For a rental application that will include a background check." },
  employer: { label: "To an employer after a background check", short: "Employer letter",
    note: "When a job offer may depend on your background check, or an employer asks you to explain it." },
  license: { label: "To a licensing board", short: "Licensing board letter",
    note: "For a license such as barber, cosmetology, HVAC, electrical, or commercial driving." }
};
var GROWTH_STARTERS = [
  "While I was incarcerated, I earned my HiSET.",
  "I earned certifications in ___.",
  "I worked ___ years as a ___.",
  "I took college classes in ___.",
  "I completed programs on ___.",
  "I mentored other people going through ___.",
  "I kept a good conduct record and was trusted with ___."
];
var DOCS = {
  landlord: ["A photo ID", "Proof of income, such as pay stubs or a job offer letter", "One or two reference letters", "A letter from your reentry program or case manager", "Any past rental history or landlord references"],
  employer: ["Copies of your certificates", "One or two reference letters", "A letter from a teacher, program, or past supervisor", "Proof of programs you completed"],
  license: ["Certificates and records of your training hours", "Exam results, if you have taken the exam", "Reference letters", "Proof of programs you completed", "Any court papers the board asks for"],
  reference: ["A copy of your resume, so they have the facts right", "The name and address the letter should go to", "The date you need it by"]
};

function newState() {
  return {
    version: 1, type: "",
    me: { name: "", street: "", cityState: "", phone: "", email: "" },
    record: { what: "a felony conviction", year: "", home: "", growth: "", jobTitle: "", jobPlace: "", jobSince: "", income: "", support: "", supervision: false },
    landlord: { to: "", property: "", rent: "", offer: "" },
    employer: { to: "", company: "", position: "", related: "" },
    license: { to: "", board: "", license: "", training: "", exam: "" },
    reference: { to: "", context: "", purpose: "", mention: "", recipient: "", deadline: "" },
    letters: { landlord: "", employer: "", license: "", reference: "" }
  };
}
function mergeState(x) {
  var s = newState();
  if (!x || typeof x !== "object") return s;
  if (TYPES[x.type]) s.type = x.type;
  ["me", "record", "landlord", "employer", "license", "reference", "letters"].forEach(function (k) {
    if (x[k] && typeof x[k] === "object") Object.keys(s[k]).forEach(function (f) { if (x[k][f] !== undefined) s[k][f] = x[k][f]; });
  });
  return s;
}
/* "an" before a vowel sound, including abbreviations said letter by letter (an HVAC, an RN). */
function article(w) {
  var v = t(w), first = v.split(/\s+/)[0] || "";
  if (/^[A-Z]{2,}/.test(first)) return /^[AEFHILMNORSX]/.test(first) ? "an" : "a";
  return /^[aeiou]/i.test(v) ? "an" : "a";
}
function oneLine(x) { return t(x).replace(/\s*\n\s*/g, " "); }
function sentence(x) { var v = oneLine(x); if (!v) return ""; v = v.charAt(0).toUpperCase() + v.slice(1); return /[.!?]$/.test(v) ? v : v + "."; }
function hasBlank(x) { return /_{2,}/.test(x || ""); }
function todayLong() { return new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }); }
function addStarter(current, starter) { var c = t(current); if (c.indexOf(starter) !== -1) return c; return c ? c + " " + starter : starter; }

function recordPhrase(s) {
  var what = t(s.record.what) || "a conviction";
  return what + (t(s.record.year) ? " from " + t(s.record.year) : "");
}
function currentSentences(s) {
  var r = s.record, out = [];
  if (t(r.jobTitle) && t(r.jobPlace)) {
    var role = article(r.jobTitle) + " " + t(r.jobTitle) + " at " + t(r.jobPlace);
    if (t(r.home)) out.push("I came home in " + t(r.home) + ".");
    out.push(t(r.jobSince) ? "Since " + t(r.jobSince) + ", I have worked as " + role + "." : "I now work as " + role + ".");
  } else if (t(r.home)) {
    out.push("I came home in " + t(r.home) + ", and I am focused on steady work and a stable home.");
  }
  if (t(r.income)) out.push("I earn about $" + t(r.income).replace(/^\$/, "") + " a month.");
  if (t(r.support)) out.push("I have the support of " + oneLine(r.support).replace(/\.$/, "") + ".");
  if (r.supervision) out.push("I am meeting all the requirements of my supervision.");
  return out.join(" ");
}
function senderBlock(s) {
  var m = s.me;
  return [t(m.name) || "Your Name", t(m.street), t(m.cityState), [t(m.phone), t(m.email)].filter(Boolean).join(" | ")].filter(Boolean).join("\n");
}
function closing(s) {
  return "Sincerely,\n\n" + (t(s.me.name) || "Your Name");
}
function para(list) { return list.filter(Boolean).join(" "); }

function draft(s, type) {
  var r = s.record, growth = oneLine(r.growth), now = currentSentences(s), P = [];
  var head = senderBlock(s) + "\n\n" + todayLong() + "\n\n";
  if (type === "landlord") {
    var L = s.landlord;
    head += (t(L.to) || "Property Manager") + (t(L.property) ? "\n" + t(L.property) : "") + "\n\n";
    P.push("Dear " + (t(L.to) || "Property Manager") + ",");
    P.push(para(["I am applying to rent " + (t(L.property) ? "at " + t(L.property) : "a home with you") + ".",
      "I want to be upfront that my background check will show " + recordPhrase(s) + ".",
      "I take full responsibility for what I did, and I would like to tell you who I am today."]));
    if (growth) P.push(growth);
    P.push(para([now, t(L.rent) ? "The rent of $" + t(L.rent).replace(/^\$/, "") + " a month fits my budget." : ""]));
    P.push(para(["I will pay my rent on time, take care of the home, and be a good neighbor.",
      t(L.offer) ? "I can provide " + oneLine(L.offer).replace(/\.$/, "") + "." : "I can provide proof of income and references.",
      "I would be grateful if you would consider my application based on who I am today."]));
  } else if (type === "employer") {
    var E = s.employer;
    head += (t(E.to) || "Hiring Manager") + (t(E.company) ? "\n" + t(E.company) : "") + "\n\n";
    P.push("Dear " + (t(E.to) || "Hiring Manager") + ",");
    P.push(para(["Thank you for considering me for the " + (t(E.position) || "open") + " position" + (t(E.company) ? " at " + t(E.company) : "") + ".",
      "I understand that my background check shows " + recordPhrase(s) + ".",
      "I take full responsibility for it, and I would like to share some information I hope you will consider before making a final decision."]));
    if (t(E.related)) P.push(sentence(E.related));
    if (growth) P.push(growth);
    if (now) P.push(now);
    P.push(para(["I am ready to work hard, and I believe I would be an asset to your team.",
      "I am glad to provide references and copies of my certificates.",
      "Thank you for your time and consideration."]));
  } else if (type === "license") {
    var B = s.license;
    head += (t(B.to) || "Members of the Board") + (t(B.board) ? "\n" + t(B.board) : "") + "\n\n";
    P.push("Dear " + (t(B.to) || "Members of the Board") + ",");
    P.push(para(["I am applying for " + (t(B.license) ? article(B.license) + " " + t(B.license) : "a license") + (t(B.board) ? " from the " + t(B.board) : "") + ".",
      "I want to be open with the Board about my record: I have " + recordPhrase(s) + ".",
      "I take full responsibility for what I did."]));
    P.push(para([t(B.training) ? sentence(B.training) : "", t(B.exam) ? sentence(B.exam) : ""]));
    if (growth) P.push(growth);
    if (now) P.push(now);
    P.push(para(["This work is how I plan to support myself and my family.",
      "I respectfully ask the Board to consider my training, my record since then, and the letters of support I have included.",
      "I am glad to provide anything else the Board needs."]));
  } else {
    var R = s.reference;
    head = senderBlock(s) + "\n\n" + todayLong() + "\n\n";
    P.push("Dear " + (t(R.to) || "___") + ",");
    P.push(para(["I am applying for " + (t(R.purpose) || "___") + ", and I am asking people who know my work to write a short reference letter for me.",
      t(R.context) ? "You know me from " + oneLine(R.context).replace(/\.$/, "") + "." : ""]));
    P.push(para([t(R.mention) ? "If you are willing, it would help if your letter mentioned " + oneLine(R.mention).replace(/\.$/, "") + "." : "If you are willing, it would help if your letter said what you have seen of my work and how I have grown.",
      t(R.recipient) ? "The letter can be addressed to " + oneLine(R.recipient).replace(/\.$/, "") + "." : "",
      t(R.deadline) ? "I need it by " + oneLine(R.deadline).replace(/\.$/, "") + "." : ""]));
    P.push("Thank you for considering this. I know your time is valuable, and I appreciate everything you have done to help me.");
  }
  return head + P.filter(Boolean).join("\n\n") + "\n\n" + closing(s);
}

/* ---------- Example to try (a made-up person) ---------- */
function exampleWork() {
  var s = newState();
  s.type = "employer";
  s.me = { name: "Andrew Example", street: "1234 Example Street, Apt. 2", cityState: "Baton Rouge, LA", phone: "(225) 555-0123", email: "andrew.example@gmail.com" };
  s.record = { what: "a felony conviction", year: "2008", home: "December 2025",
    growth: "While I was incarcerated, I earned my HiSET. I earned HVAC Excellence and EPA Section 608 certifications. I worked 15 years as a maintenance and HVAC technician.",
    jobTitle: "Maintenance Helper", jobPlace: "Capital Area Property Services", jobSince: "January 2026", income: "2100",
    support: "my case manager at a reentry program and my family", supervision: true };
  s.landlord = { to: "Ms. Johnson", property: "Oak Street Apartments, Unit 4B", rent: "750", offer: "pay stubs, two references, and a letter from my case manager" };
  s.employer = { to: "Mr. Davis", company: "Gulf Mechanical", position: "HVAC Technician", related: "The conviction is more than 15 years old and is not related to the duties of this job." };
  s.license = { to: "Members of the Board", board: "State Licensing Board for HVAC Work", license: "HVAC license", training: "I completed the HVAC program and earned HVAC Excellence and EPA Section 608 certifications.", exam: "I passed the EPA Section 608 exam in 2019." };
  s.reference = { to: "Mr. Thomas", context: "the HVAC program, where you were my instructor", purpose: "a job as an HVAC technician at Gulf Mechanical", mention: "my work habits and my reliability", recipient: "the hiring manager at Gulf Mechanical", deadline: "December 1" };
  ["landlord", "employer", "license", "reference"].forEach(function (k) { s.letters[k] = draft(s, k); });
  return s;
}

function letterDocumentXml(text) {
  var body = String(text || "").split("\n").map(function (line) {
    return t(line) ? wPara(wRun(line.replace(/\s+$/, ""))) : wPara("");
  });
  return docxWrap(body.join(""));
}
function letterDocxBytes(s) {
  var who = { contact: { name: s.me.name } };
  return buildDocxBytes(who, letterDocumentXml(s.letters[s.type]), TYPES[s.type].short);
}
function letterFileName(s) {
  return fileBaseName({ contact: { name: s.me.name } }, TYPES[s.type].short) + ".docx";
}
function words(x) { var m = t(x).match(/\S+/g); return m ? m.length : 0; }
function letterChecks(s) {
  var text = s.letters[s.type] || "", out = [];
  if (!t(text)) return out;
  if (hasBlank(text)) out.push({ level: "bad", text: "There is still a blank (___) in your letter. Fill it in or take that part out." });
  if (!t(s.me.name)) out.push({ level: "warn", text: "Add your name on the “About you” step." });
  if (!t(s.me.phone) && !t(s.me.email)) out.push({ level: "warn", text: "Add a phone number or email so they can reach you." });
  var w = words(text);
  if (w > 450) out.push({ level: "warn", text: "Your letter is about " + w + " words. One page, about 250 to 400 words, usually works best." });
  if (!out.some(function (m) { return m.level === "bad"; })) out.push({ level: "good", text: "Read it out loud once. If it sounds like you and every sentence is true, it is ready." });
  return out;
}

/* Starts "About you" and "Your growth" from a file saved by the Reentry Resume Builder. */
function fromResume(r) {
  if (!r || typeof r !== "object" || !r.contact) return null;
  var c = r.contact, out = { me: {}, growth: [] };
  out.me.name = t(c.name);
  out.me.cityState = [t(c.city), t(c.state)].filter(Boolean).join(", ");
  out.me.phone = t(c.phone);
  out.me.email = t(c.email);
  var certs = Array.isArray(r.certs) ? r.certs.map(function (x) { return x && t(x.name); }).filter(Boolean).slice(0, 4) : [];
  if (certs.length) out.growth.push("I earned " + (certs.length === 1 ? certs[0] : certs.length === 2 ? certs[0] + " and " + certs[1] : certs.slice(0, -1).join(", ") + ", and " + certs[certs.length - 1]) + ".");
  (Array.isArray(r.work) ? r.work : []).filter(function (e) { return e && e.inside && t(e.title); }).slice(0, 2).forEach(function (e) {
    var a = parseInt(e.start, 10), b = /present/i.test(t(e.end)) ? new Date().getFullYear() : parseInt(e.end, 10);
    var yrs = (a && b && b > a) ? (b - a) + " years " : "";
    out.growth.push("I worked " + yrs + "as " + article(e.title) + " " + t(e.title) + ".");
  });
  return out;
}
