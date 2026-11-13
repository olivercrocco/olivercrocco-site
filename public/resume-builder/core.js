/* ---------- Content libraries ---------- */
var JOBS = {
  kitchen: {
    label: "Kitchen or food service",
    titles: ["Cook", "Line Cook", "Kitchen Worker", "Baker", "Dishwasher"],
    bullets: [
      "Prepared meals for about ___ people per day following set recipes and portion standards",
      "Followed food safety and sanitation rules for storing, handling, and cleaning",
      "Kept the kitchen, equipment, and storage areas clean and ready for inspection",
      "Worked as part of a team to serve meals on a strict schedule",
      "Received, stored, and rotated food supplies",
      "Trained new kitchen workers in procedures and safety"
    ],
    skills: ["Food preparation", "Food safety and sanitation", "Commercial kitchen equipment", "Stock rotation"]
  },
  maintenance: {
    label: "Maintenance or facilities",
    titles: ["Maintenance Worker", "Maintenance Technician", "Facilities Worker", "Maintenance Helper"],
    bullets: [
      "Performed routine repairs on plumbing, electrical, and heating and cooling systems",
      "Completed about ___ work orders per week",
      "Used hand and power tools safely and kept all tools accounted for",
      "Carried out preventive maintenance to reduce breakdowns",
      "Followed safety procedures, including lockout/tagout"
    ],
    skills: ["General maintenance and repair", "Basic plumbing", "Basic electrical", "Preventive maintenance"]
  },
  farm: {
    label: "Farm, landscaping, or grounds",
    titles: ["Farm Worker", "Cattle Hand", "Tractor Operator", "Groundskeeper", "Landscaping Worker", "Horticulture Worker"],
    bullets: [
      "Planted, cultivated, and harvested crops across about ___ acres",
      "Operated and maintained tractors and other farm equipment",
      "Cared for livestock, including feeding and health checks",
      "Maintained grounds, including mowing, trimming, and clearing",
      "Worked outdoors in all weather to meet daily production goals"
    ],
    skills: ["Crop production", "Livestock care", "Tractor and equipment operation", "Landscaping and grounds care"]
  },
  cleaning: {
    label: "Cleaning or sanitation",
    titles: ["Custodian", "Janitor", "Sanitation Worker", "Housekeeping Worker"],
    bullets: [
      "Cleaned and sanitized living areas, offices, and common spaces on a daily schedule",
      "Used and stored cleaning chemicals safely according to labels and safety data sheets",
      "Operated floor care equipment, including buffers and scrubbers",
      "Met inspection standards for cleanliness and sanitation"
    ],
    skills: ["Commercial cleaning", "Chemical safety", "Floor care equipment"]
  },
  laundry: {
    label: "Laundry",
    titles: ["Laundry Worker", "Laundry Attendant"],
    bullets: [
      "Processed about ___ pounds of laundry per day using commercial washers and dryers",
      "Sorted, folded, and delivered linens and clothing accurately and on time",
      "Kept equipment clean and reported needed repairs"
    ],
    skills: ["Commercial laundry equipment", "Sorting and quality control"]
  },
  warehouse: {
    label: "Warehouse, inventory, or store",
    titles: ["Warehouse Worker", "Inventory Clerk", "Store Clerk", "Stock Clerk"],
    bullets: [
      "Received, checked, and stored incoming supplies",
      "Tracked inventory and recorded counts accurately",
      "Filled orders for about ___ customers per week",
      "Handled cash or account transactions accurately",
      "Kept storage areas organized and safe"
    ],
    skills: ["Inventory control", "Shipping and receiving", "Order filling", "Record keeping"]
  },
  manufacturing: {
    label: "Manufacturing or production shop",
    titles: ["Production Worker", "Machine Operator", "Assembler", "Print Shop Worker", "Sewing Machine Operator",
      "Screen Printer", "Embroidery Machine Operator", "Metal Fabricator", "Furniture Builder", "Upholsterer"],
    bullets: [
      "Operated production equipment to make ___ to quality standards",
      "Met daily production targets of about ___ units",
      "Inspected finished products and corrected defects",
      "Followed shop safety rules and kept the work area clean",
      "Read work orders, measurements, and basic drawings"
    ],
    skills: ["Production equipment", "Quality inspection", "Reading work orders and measurements", "Shop safety"]
  },
  trades: {
    label: "Construction or building trades",
    titles: ["Carpenter", "Welder", "Electrician Helper", "Construction Worker", "Painter", "Mason"],
    bullets: [
      "Built and repaired ___ using carpentry, welding, or masonry skills",
      "Read plans and took accurate measurements",
      "Worked safely on a crew, including on ladders and scaffolds",
      "Completed projects on time and to inspection standards"
    ],
    skills: ["Carpentry", "Welding", "Blueprint reading", "Construction safety"]
  },
  auto: {
    label: "Auto or small engine shop",
    titles: ["Auto Mechanic", "Mechanic Helper", "Small Engine Technician"],
    bullets: [
      "Diagnosed and repaired vehicles and small engines",
      "Performed oil changes, brake work, and other routine service",
      "Kept service records and tracked parts"
    ],
    skills: ["Automotive repair", "Engine diagnostics", "Small engine repair"]
  },
  barber: {
    label: "Barber or hair care",
    titles: ["Barber"],
    bullets: [
      "Provided haircuts and grooming for about ___ clients per week",
      "Sanitized tools and work stations to health standards",
      "Built steady repeat business through reliable, friendly service"
    ],
    skills: ["Haircutting and styling", "Sanitation", "Customer service"]
  },
  tutor: {
    label: "Tutor, teaching aide, or GED aide",
    titles: ["Tutor", "Teaching Assistant", "Literacy Tutor", "Instructor Aide"],
    bullets: [
      "Tutored about ___ adult learners in reading, writing, and math",
      "Helped students prepare for the HiSET or GED exam",
      "Adjusted explanations to each learner's level and pace",
      "Kept attendance and progress records for the instructor"
    ],
    skills: ["Teaching and tutoring", "Explaining ideas clearly", "Record keeping"]
  },
  legal: {
    label: "Law clerk or legal aide",
    titles: ["Law Clerk", "Legal Research Assistant", "Legal Aide"],
    bullets: [
      "Researched case law and statutes using legal research tools",
      "Drafted letters, motions, and other legal documents for review",
      "Helped about ___ people a month understand legal procedures and deadlines",
      "Kept confidential files organized and secure"
    ],
    skills: ["Legal research", "Writing and drafting", "Confidential record keeping", "Typing"]
  },
  office: {
    label: "Clerk, office, or library",
    titles: ["Office Clerk", "Administrative Assistant", "Library Assistant", "Data Entry Clerk"],
    bullets: [
      "Typed, filed, and organized records accurately",
      "Answered questions and directed people to the right resources",
      "Entered data and kept logs and schedules up to date",
      "Checked out, shelved, and tracked library materials"
    ],
    skills: ["Typing", "Filing and record keeping", "Data entry", "Customer service"]
  },
  health: {
    label: "Hospice, health care, or orderly",
    titles: ["Hospice Volunteer", "Patient Care Aide", "Health Care Orderly"],
    bullets: [
      "Provided comfort and companionship to seriously ill and dying patients",
      "Helped patients with daily living, including eating, bathing, and moving",
      "Worked with medical staff and followed care plans",
      "Completed training from nursing and social work staff to care for gravely ill patients",
      "Kept patient information private"
    ],
    skills: ["Patient care", "Compassionate communication", "Infection control"]
  },
  peer: {
    label: "Peer mentor, counselor, or facilitator",
    titles: ["Peer Mentor", "Peer Facilitator", "Program Facilitator", "Re-entry Mentor"],
    bullets: [
      "Mentored about ___ peers through education, treatment, or re-entry programs",
      "Served as a certified mentor in a reentry workforce program, teaching job and life skills",
      "Led group sessions on ___",
      "Helped resolve conflicts calmly and fairly",
      "Worked with staff to plan and run programs"
    ],
    skills: ["Mentoring", "Group facilitation", "Conflict resolution", "Public speaking"]
  },
  club: {
    label: "Club or organization officer",
    titles: ["President", "Vice President", "Secretary", "Treasurer", "Member"],
    bullets: [
      "Served as ___ of the ___ club, which has about ___ members",
      "Planned and ran meetings and events",
      "Kept club records and managed the club budget",
      "Gave prepared speeches and evaluated other members' speeches through Toastmasters",
      "Organized fundraisers for charity and community causes"
    ],
    skills: ["Leadership", "Event planning", "Budgeting", "Public speaking"]
  },
  cpr: {
    label: "CPR or first aid trainer",
    titles: ["CPR Instructor", "First Aid Trainer"],
    bullets: [
      "Taught CPR and first aid to about ___ people, including staff and first responders",
      "Led hands-on practice and checked each learner's skills",
      "Kept training records and scheduled classes"
    ],
    skills: ["CPR and first aid", "Teaching and training", "Public speaking"]
  },
  writing: {
    label: "Writer or editor (magazine, newsletter)",
    titles: ["Writer", "Editor", "Reporter", "Layout Designer"],
    bullets: [
      "Wrote and edited articles for a magazine read by about ___ people",
      "Researched and reported on criminal justice issues",
      "Met publication deadlines every quarter",
      "Interviewed people and checked facts before publishing"
    ],
    skills: ["Writing and editing", "Research", "Interviewing", "Meeting deadlines"]
  },
  sports: {
    label: "Sports official or league organizer",
    titles: ["Sports Official", "Referee", "League Coordinator"],
    bullets: [
      "Officiated league games and applied rules fairly",
      "Scheduled games and kept league records",
      "Resolved disputes calmly between players and teams"
    ],
    skills: ["Conflict resolution", "Scheduling", "Fair decision-making"]
  },
  faith: {
    label: "Faith community leader",
    titles: ["Minister", "Faith Group Leader", "Study Group Leader"],
    bullets: [
      "Led weekly services or study groups for about ___ people",
      "Organized community service projects",
      "Counseled and supported members of the community"
    ],
    skills: ["Leadership", "Public speaking", "Counseling and support"]
  },
  other: { label: "Something else", titles: [], bullets: [], skills: [] }
};

var SKILL_GROUPS = {
  "Working with people": ["Customer service", "Teamwork", "Training new workers", "Mentoring", "Conflict resolution", "Public speaking", "Bilingual (English and Spanish)"],
  "Office and computer": ["Typing", "Data entry", "Microsoft Word", "Microsoft Excel", "Microsoft PowerPoint", "Email", "Filing and record keeping", "Cash handling", "Python programming", "Braille transcription"],
  "Trades and technical": ["Blueprint reading", "Oxy-fuel cutting", "Flux-cored and gas metal arc welding", "Pipe welding", "Rigging", "Site layout and surveying", "HVAC installation and repair", "Refrigerant handling", "Network and fiber optic cabling", "Small engine repair", "Generator repair", "Collision repair"],
  "Safety and equipment": ["Workplace safety", "Forklift operation", "Hand and power tools", "Heavy lifting (50+ lbs)"]
};

var STRENGTHS = [
  "Dependable and on time",
  "Works well on a team",
  "Learns new skills quickly",
  "Committed to safety",
  "Calm under pressure",
  "Trusted to train and mentor others",
  "Careful and detail-oriented",
  "Strong work ethic",
  "Takes direction well"
];

/* Certifications offered in Louisiana prisons, from the state corrections department's
   Catalog of Rehabilitative Services 2024-2025 and its Louisiana State Penitentiary page.
   Sources: docs/louisiana-prison-credentials.md in github.com/olivercrocco/reentry-resume-builder. */
var CERT_GROUPS = [
  { group: "Construction trades (NCCER)",
    note: "If your card shows a level, add it to the name, for example “NCCER Carpentry Level 1.”",
    items: [
      ["NCCER Core", "NCCER"], ["NCCER Carpentry", "NCCER"], ["NCCER Welding", "NCCER"],
      ["NCCER Electrical", "NCCER"], ["NCCER Plumbing", "NCCER"], ["NCCER HVAC", "NCCER"],
      ["NCCER Masonry", "NCCER"], ["NCCER Concrete Finishing", "NCCER"], ["NCCER Painting", "NCCER"],
      ["NCCER Drywall", "NCCER"], ["NCCER Pipefitting", "NCCER"], ["NCCER Heavy Equipment Operations", "NCCER"],
      ["NCCER Rigger", "NCCER"], ["NCCER Signal Person", "NCCER"], ["NCCER Site Layout", "NCCER"],
      ["NCCER Pipeline Technician", "NCCER"], ["NCCER Maritime Pipefitting", "NCCER"],
      ["NCCER Maritime Structural Fitter", "NCCER"], ["NCCER Introduction to Maritime", "NCCER"],
      ["NCCER Fundamentals of Crew Leadership", "NCCER"], ["NCCER Project Supervision", "NCCER"],
      ["NCCER Project Management", "NCCER"], ["NCCER Instructor Certification (ICTP)", "NCCER"]
    ] },
  { group: "Safety",
    items: [
      ["OSHA 10-Hour General Industry", "OSHA"], ["OSHA 10-Hour Construction", "OSHA"], ["OSHA 30-Hour", "OSHA"],
      ["NCCER Field Safety", "NCCER"], ["NCCER Fall Protection", "NCCER"], ["NCCER Safety Technology", "NCCER"],
      ["NCCER Managing Electrical Hazards", "NCCER"], ["CPR and First Aid", ""], ["Forklift Operator", ""]
    ] },
  { group: "Automotive, engines, and equipment",
    items: [
      ["ASE Certification (Automotive)", "Automotive Service Excellence"], ["ASE Certification (Collision Repair)", "Automotive Service Excellence"],
      ["I-CAR Collision Repair", "I-CAR"], ["Outdoor Power Equipment Technician", "EETC"],
      ["Generator Repair", "Electrical Generating Systems Association (EGSA)"],
      ["Truck Driving / CDL Training", ""], ["Ditch Witch Operator", ""], ["Utility Line Locator", ""]
    ] },
  { group: "Heating, cooling, electrical, and cabling",
    items: [
      ["HVAC Excellence Certification", "HVAC Excellence"], ["EPA Section 608 Refrigerant Certification", "U.S. Environmental Protection Agency"],
      ["Cabling Technology", "C-Tech"], ["Fiber Optics Technician", ""], ["Fiber Optics Premise Cabling Technician", ""],
      ["Fiber Optics Splicing Specialist", ""], ["Fiber Optics Testing Specialist", ""], ["Electronic Systems Technology", ""]
    ] },
  { group: "Welding",
    items: [["AWS Certified Welder", "American Welding Society"]] },
  { group: "Food service and agriculture",
    items: [
      ["ServSafe Manager", "National Restaurant Association"], ["ServSafe Food Handler", "National Restaurant Association"],
      ["Culinary Meat Selection & Cookery", "American Meat Science Association"],
      ["Food Safety & Science", "American Meat Science Association"], ["Meat Evaluation", "American Meat Science Association"],
      ["Licensed Horticulturist", "State of Louisiana"], ["Plant Science", "BASF"], ["Turfgrass Science", "SFMA"]
    ] },
  { group: "Computers, office, and logistics",
    items: [
      ["IC3 Digital Literacy", "Certiport"], ["Microsoft Office Specialist: Word", "Microsoft"],
      ["Microsoft Office Specialist: Excel", "Microsoft"], ["Microsoft Office Specialist: PowerPoint", "Microsoft"],
      ["Certified Logistics Associate (CLA)", "MSSC"], ["Certified Logistics Technician (CLT)", "MSSC"],
      ["Business Office Technology", "Express Employment Professionals"], ["Career Preparedness", "Express Employment Professionals"],
      ["Python Computer Coding", ""], ["Personal Financial Literacy", "Center for Financial Responsibility"],
      ["Professional Communications", "Southwest Airlines"]
    ] },
  { group: "Health, personal care, and other",
    items: [
      ["Cosmetology License", "Louisiana State Board of Cosmetology"], ["Barber License", "Louisiana Board of Barber Examiners"],
      ["Medical Lab Assistant", ""], ["Braille Transcription (Unified English Braille)", ""],
      ["Furniture Manufacturing & Restoration", ""], ["Eyeglass Repair", ""], ["Print Ed Certification", ""]
    ] }
];
var CERT_SUGGESTIONS = [];
CERT_GROUPS.forEach(function (g) { g.items.forEach(function (it) { CERT_SUGGESTIONS.push(it[0]); }); });

var EDU_SUGGESTIONS = [
  "High School Equivalency Diploma (HiSET)", "GED", "High School Diploma", "College coursework",
  "Technical Diploma", "Certificate", "Associate Degree", "Associate of Applied Science", "Associate of Arts",
  "Bachelor's Degree", "Bachelor of Arts", "Bachelor of Science", "Master's Degree"
];

/* Schools and colleges that teach inside Louisiana prisons (same sources). */
var PRISON_SCHOOLS = [
  "New Orleans Baptist Theological Seminary", "Ashland University", "Upper Iowa University",
  "Loyola University New Orleans", "Tulane University", "Fletcher Technical Community College",
  "Northshore Technical Community College", "Central Louisiana Technical Community College",
  "Louisiana Delta Community College", "South Louisiana Community College", "Bossier Parish Community College"
];

var EXTRA_KEYWORDS = [
  "customer service", "forklift", "cash handling", "safety", "inventory", "teamwork", "communication",
  "reliable", "dependable", "driver's license", "lifting", "stocking", "cleaning", "food safety",
  "welding", "carpentry", "maintenance", "data entry", "Microsoft Office", "Excel", "scheduling",
  "bilingual", "Spanish", "training", "leadership", "punctual", "attention to detail", "OSHA", "ServSafe",
  "plumbing", "electrical", "HVAC", "repair", "carpentry", "painting", "construction", "landscaping",
  "janitorial", "custodial", "sanitation", "laundry", "cook", "kitchen", "food preparation", "dishwashing",
  "warehouse", "shipping", "receiving", "assembly", "production", "machine operation", "quality",
  "inspection", "mentoring", "tutoring", "typing", "computer", "cashier", "stocking shelves", "lawn care",
  "patient care", "barbering", "welder", "mechanic", "tools"
];

/* ---------- State ---------- */
function newEntry() {
  return { inside: false, type: "", title: "", employer: "", location: "", start: "", end: "", bullets: [] };
}
function newState() {
  return {
    version: 1,
    contact: { name: "", city: "", state: "LA", phone: "", email: "", link: "" },
    goal: { title: "", posting: "" },
    work: [newEntry()],
    volunteer: [],
    skills: [],
    certs: [],
    education: [],
    summaryHelp: { years: "", field: "", strengths: [] },
    summary: "",
    letter: { company: "", contact: "", title: "", source: "", text: "" }
  };
}
function mergeState(loaded) {
  var s = newState();
  if (!loaded || typeof loaded !== "object") return s;
  ["contact", "goal", "summaryHelp", "letter"].forEach(function (k) {
    if (loaded[k] && typeof loaded[k] === "object") {
      Object.keys(s[k]).forEach(function (f) { if (loaded[k][f] !== undefined) s[k][f] = loaded[k][f]; });
    }
  });
  ["work", "volunteer", "certs", "education", "skills"].forEach(function (k) {
    if (Array.isArray(loaded[k])) s[k] = loaded[k];
  });
  if (typeof loaded.summary === "string") s.summary = loaded.summary;
  s.work = s.work.map(function (e) { return Object.assign(newEntry(), e, { bullets: Array.isArray(e.bullets) ? e.bullets : [] }); });
  s.volunteer = s.volunteer.map(function (e) { return Object.assign(newEntry(), e, { bullets: Array.isArray(e.bullets) ? e.bullets : [] }); });
  return s;
}

/* ---------- Helpers ---------- */
function t(v) { return (v === undefined || v === null) ? "" : String(v).trim(); }
function joinParts(parts, sep) { return parts.map(t).filter(Boolean).join(sep); }
function dateRange(e) {
  var a = t(e.start), b = t(e.end);
  if (a && b) return a === b ? a : a + " – " + b;
  if (a) return a + " – Present";
  return b;
}
function entryLine2(e) {
  return joinParts([joinParts([e.employer, e.location], ", "), dateRange(e)], " | ");
}
function eduLine1(ed) {
  var c = t(ed.credential), f = t(ed.field);
  if (c && f) return c + ", " + f;
  return c || f;
}
function eduLine2(ed) {
  return joinParts([joinParts([ed.school, ed.location], ", "), ed.year], " | ");
}
function certLine(c) { return joinParts([c.name, c.org, c.year], ", "); }
function contactLine(s) {
  var c = s.contact;
  return joinParts([joinParts([c.city, c.state], ", "), c.phone, c.email, c.link], " | ");
}
function cleanBullets(list) {
  return (list || []).map(function (b) { return t(b).replace(/\s*\n\s*/g, " "); }).filter(Boolean);
}
function hasEntryContent(e) { return Boolean(t(e.title) || t(e.employer) || cleanBullets(e.bullets).length); }

/* Builds a neutral outline of the resume that every output format reads from. */
function outline(s) {
  var o = [];
  o.push({ kind: "name", text: t(s.contact.name) });
  var cl = contactLine(s);
  if (cl) o.push({ kind: "contact", text: cl });
  if (t(s.summary)) {
    o.push({ kind: "heading", text: "SUMMARY" });
    o.push({ kind: "para", text: t(s.summary) });
  }
  var skills = s.skills.map(t).filter(Boolean);
  if (skills.length) {
    o.push({ kind: "heading", text: "SKILLS" });
    o.push({ kind: "para", text: skills.join(", ") });
  }
  var certs = s.certs.map(certLine).filter(Boolean);
  if (certs.length) {
    o.push({ kind: "heading", text: "CERTIFICATIONS AND TRAINING" });
    certs.forEach(function (c) { o.push({ kind: "bullet", text: c }); });
  }
  function entries(list, heading) {
    var real = list.filter(hasEntryContent);
    if (!real.length) return;
    o.push({ kind: "heading", text: heading });
    real.forEach(function (e, i) {
      if (i > 0) o.push({ kind: "blank" });
      if (t(e.title)) o.push({ kind: "bold", text: t(e.title) });
      var l2 = entryLine2(e);
      if (l2) o.push({ kind: "para", text: l2 });
      cleanBullets(e.bullets).forEach(function (b) { o.push({ kind: "bullet", text: b }); });
    });
  }
  entries(s.work, "WORK EXPERIENCE");
  entries(s.volunteer, "VOLUNTEER AND LEADERSHIP");
  var edu = s.education.filter(function (ed) { return eduLine1(ed) || t(ed.school); });
  if (edu.length) {
    o.push({ kind: "heading", text: "EDUCATION" });
    edu.forEach(function (ed, i) {
      if (i > 0) o.push({ kind: "blank" });
      var l1 = eduLine1(ed);
      if (l1) o.push({ kind: "bold", text: l1 });
      var l2 = eduLine2(ed);
      if (l2) o.push({ kind: "para", text: l2 });
      if (t(ed.detail)) o.push({ kind: "bullet", text: t(ed.detail) });
    });
  }
  return o;
}

/* ---------- Plain text ---------- */
function buildPlainText(s) {
  var lines = [];
  outline(s).forEach(function (item) {
    if (item.kind === "heading") { lines.push(""); lines.push(item.text); }
    else if (item.kind === "blank") lines.push("");
    else if (item.kind === "bullet") lines.push("- " + item.text);
    else lines.push(item.text);
  });
  return lines.join("\n").replace(/^\n+/, "") + "\n";
}

/* ---------- Word (.docx) ---------- */
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
function docxDocumentXml(s) {
  var body = [];
  outline(s).forEach(function (item) {
    switch (item.kind) {
      case "name":
        body.push(wPara(wRun(item.text || " ", { b: true, sz: 32 }), '<w:jc w:val="center"/>'));
        break;
      case "contact":
        body.push(wPara(wRun(item.text), '<w:jc w:val="center"/>'));
        break;
      case "heading":
        body.push(wPara(""));
        body.push(wPara(wRun(item.text, { b: true }), '<w:pStyle w:val="Heading1"/><w:keepNext/>' +
          '<w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="000000"/></w:pBdr>'));
        break;
      case "bold":
        body.push(wPara(wRun(item.text, { b: true }), "<w:keepNext/>"));
        break;
      case "bullet":
        body.push(wPara(wRun(item.text), '<w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr><w:ind w:left="360" w:hanging="360"/>'));
        break;
      case "blank":
        body.push(wPara(""));
        break;
      default:
        body.push(wPara(wRun(item.text)));
    }
  });
  return docxWrap(body.join(""));
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

/* ---------- Cover letter ---------- */
var STRENGTH_SENTENCES = {
  "Dependable and on time": "I am dependable and on time.",
  "Works well on a team": "I work well on a team.",
  "Learns new skills quickly": "I learn new skills quickly.",
  "Committed to safety": "I am committed to safety.",
  "Calm under pressure": "I stay calm under pressure.",
  "Trusted to train and mentor others": "I have been trusted to train and mentor others.",
  "Careful and detail-oriented": "I am careful and detail-oriented.",
  "Strong work ethic": "I have a strong work ethic.",
  "Takes direction well": "I take direction well."
};
function lowerFirst(x) { return x ? x.charAt(0).toLowerCase() + x.slice(1) : x; }
function todayLong() {
  return new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}
function draftLetter(s) {
  var L = s.letter, c = s.contact;
  var job = t(L.title) || t(s.goal.title) || "open";
  var company = t(L.company) || "your company";
  var lines = [];
  lines.push(todayLong(), "");
  lines.push("Dear " + (t(L.contact) || "Hiring Manager") + ",", "");
  var p1 = "I am writing to apply for the " + job + " position at " + company + ".";
  if (t(L.source)) p1 += " I learned about this job through " + t(L.source) + ".";
  lines.push(p1, "");
  var p2 = [];
  var yrs = t(s.summaryHelp.years), field = t(s.summaryHelp.field);
  if (yrs && field) p2.push("I have " + yrs + " years of experience in " + field + ".");
  var recent = s.work.filter(hasEntryContent)[0];
  if (recent) {
    var bl = cleanBullets(recent.bullets).filter(function (b) { return !/_{2,}/.test(b); });
    if (t(recent.title) && bl[0]) p2.push("As a " + t(recent.title) + ", I " + lowerFirst(bl[0]).replace(/\.$/, "") + ".");
    if (bl[1]) p2.push("I also " + lowerFirst(bl[1]).replace(/\.$/, "") + ".");
  }
  var certs = s.certs.map(function (x) { return t(x.name); }).filter(Boolean).slice(0, 3);
  if (certs.length) p2.push("I hold " + joinNatural(certs) + ".");
  if (p2.length) lines.push(p2.join(" "), "");
  var p3 = (s.summaryHelp.strengths || []).map(function (x) { return STRENGTH_SENTENCES[x] || ""; }).filter(Boolean);
  p3.push("I would welcome the chance to talk with you about how I can help your team.");
  lines.push(p3.join(" "), "");
  lines.push("Thank you for your time and consideration.", "");
  lines.push("Sincerely,", "", t(c.name) || "Your Name");
  var cl = joinParts([c.phone, c.email], " | ");
  if (cl) lines.push(cl);
  return lines.join("\n");
}
function letterDocumentXml(s) {
  var body = String(s.letter.text || "").split("\n").map(function (line) {
    return t(line) ? wPara(wRun(line.replace(/\s+$/, ""))) : wPara("");
  });
  return docxWrap(body.join(""));
}
function buildLetterDocxBytes(s) {
  return buildDocxBytes(s, letterDocumentXml(s), "Cover Letter");
}

/* ---------- Progress by step ---------- */
function stepStatus(s) {
  var real = s.work.filter(hasEntryContent);
  var workDone = real.length > 0 && real.every(function (e) {
    var bl = cleanBullets(e.bullets);
    return t(e.title) && bl.length >= 2 && !bl.some(function (b) { return /_{2,}/.test(b); });
  });
  return {
    contact: t(s.contact.name) && (t(s.contact.phone) || t(s.contact.email)) ? "done" : "todo",
    goal: t(s.goal.title) ? "done" : "todo",
    work: workDone ? "done" : "todo",
    skills: s.skills.length >= 4 ? "done" : "todo",
    certs: s.certs.some(function (c) { return t(c.name); }) ? "done" : "optional",
    edu: s.education.some(function (e) { return eduLine1(e) || t(e.school); }) ? "done" : "todo",
    vol: s.volunteer.some(hasEntryContent) ? "done" : "optional",
    summary: t(s.summary) ? "done" : "todo",
    letter: t(s.letter.text) ? "done" : "optional"
  };
}

/* ---------- Example resume (a made-up person) ---------- */
var EXAMPLE_STATE = (function () {
  var s = newState();
  s.contact = { name: "Marcus Example", city: "Baton Rouge", state: "LA", phone: "(225) 555-0123", email: "marcus.example@gmail.com", link: "" };
  s.goal.title = "HVAC Technician";
  s.summary = "15 years of experience in building maintenance and heating and air-conditioning repair. Dependable and on time. Committed to safety. Trusted to train and mentor others. Holds HVAC Excellence Certification, EPA Section 608 Refrigerant Certification, and NCCER Core. Seeking work as an HVAC Technician.";
  s.skills = ["HVAC installation and repair", "Refrigerant handling", "Preventive maintenance", "Basic electrical", "Blueprint reading", "Hand and power tools", "Training new workers"];
  s.certs = [
    { name: "HVAC Excellence Certification", org: "HVAC Excellence", year: "2019" },
    { name: "EPA Section 608 Refrigerant Certification", org: "U.S. Environmental Protection Agency", year: "2019" },
    { name: "NCCER Core", org: "NCCER", year: "2017" }
  ];
  s.work = [
    Object.assign(newEntry(), { inside: true, type: "maintenance", title: "HVAC and Maintenance Technician", employer: "Louisiana Department of Public Safety and Corrections", location: "Angola, LA", start: "2010", end: "2025",
      bullets: ["Installed, serviced, and repaired heating and air-conditioning units across 14 buildings", "Completed about 25 work orders per week", "Carried out preventive maintenance to reduce breakdowns", "Trained 8 new maintenance workers in tool safety and repair procedures"] }),
    Object.assign(newEntry(), { title: "Warehouse Worker", employer: "Building Supply Store", location: "Baton Rouge, LA", start: "1993", end: "1995",
      bullets: ["Received, checked, and stored incoming supplies", "Loaded customer orders safely and on time"] })
  ];
  s.volunteer = [Object.assign(newEntry(), { inside: true, type: "peer", title: "Peer Mentor", employer: "Reentry Workforce Program", start: "2015", end: "2025",
    bullets: ["Mentored about 40 peers through education and re-entry programs", "Led weekly group sessions on job readiness"] })];
  s.education = [{ credential: "High School Equivalency Diploma (HiSET)", field: "", school: "Louisiana Community and Technical College System", location: "", year: "2011", detail: "" }];
  return s;
})();

/* ---------- Example to try (a made-up person) ---------- */
function exampleWork() {
  var s = mergeState(JSON.parse(JSON.stringify(EXAMPLE_STATE)));
  s.goal.posting = "HVAC Technician. We are hiring a dependable HVAC technician to install, service, and repair heating and air-conditioning systems in commercial buildings. Requirements: EPA Section 608 certification, basic electrical and blueprint reading skills, a commitment to safety, and a valid driver's license. Preventive maintenance experience preferred.";
  s.summaryHelp = { years: "15", field: "building maintenance and heating and air-conditioning repair", strengths: ["Dependable and on time", "Committed to safety", "Trusted to train and mentor others"] };
  s.letter = { company: "Gulf Mechanical", contact: "", title: "HVAC Technician", source: "a reentry program", text: "" };
  s.letter.text = draftLetter(s);
  return s;
}

/* ---------- Checks ---------- */
function runChecks(s) {
  var out = [];
  function add(level, text) { out.push({ level: level, text: text }); }
  if (!t(s.contact.name)) add("bad", "Add your name (step: Your contact information).");
  if (!t(s.contact.phone)) add("warn", "No phone number yet. You will need one before you apply. Staff can help.");
  if (!t(s.contact.email)) add("warn", "No email address yet. You will need one before you apply. Staff can help you set one up.");
  if (t(s.contact.email) && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(t(s.contact.email))) add("warn", "Check your email address. It should look like name@example.com.");
  function checkList(list, label) {
    list.forEach(function (e, i) {
      if (!hasEntryContent(e)) return;
      var name = t(e.title) || (label + " " + (i + 1));
      if (!t(e.title)) add("bad", label + " " + (i + 1) + ": add a job title.");
      if (!t(e.employer)) add("warn", name + ": add the employer or organization.");
      if (!t(e.start) && !t(e.end)) add("warn", name + ": add the years you did this.");
      [e.start, e.end].forEach(function (y) {
        var v = t(y);
        if (v && !/^(19|20)\d{2}$/.test(v) && !/^present$/i.test(v)) add("warn", name + ": “" + v + "” should be a year like 2018, or the word Present.");
      });
      var bl = cleanBullets(e.bullets);
      if (!bl.length) add("warn", name + ": add at least two lines about what you did.");
      if (bl.length > 7) add("warn", name + ": " + bl.length + " lines is a lot. Three to six usually reads best.");
    });
  }
  checkList(s.work, "Job");
  checkList(s.volunteer, "Activity");
  if (!s.work.some(hasEntryContent)) add("bad", "Add at least one job in Work history. Jobs you did while incarcerated count.");
  var blanks = [];
  function scan(text, where) { if (/_{2,}/.test(text || "")) blanks.push(where); }
  scan(s.summary, "Summary");
  s.work.concat(s.volunteer).forEach(function (e) {
    cleanBullets(e.bullets).forEach(function (b) { scan(b, t(e.title) || "a job"); });
    scan(e.title, "a job title");
  });
  s.certs.forEach(function (c) { scan(certLine(c), "Certifications"); });
  blanks.filter(function (v, i, a) { return a.indexOf(v) === i; }).forEach(function (w) {
    add("bad", "There is still a blank (___) in " + w + ". Put in a real number you could explain, or take that part out.");
  });
  wordingIssues(s).forEach(function (w) { add("warn", w); });
  if (!t(s.summary)) add("warn", "Add a short summary at the top. The Summary step can write a first draft for you.");
  var sk = s.skills.filter(function (x) { return t(x); }).length;
  if (sk < 4) add("warn", "Pick a few more skills. Six to twelve is a good range.");
  if (sk > 15) add("warn", sk + " skills is a lot. Keep the ones that fit the job you want.");
  var lines = buildPlainText(s).split("\n").length;
  if (lines > 58) add("warn", "Your resume may run longer than one page. Two pages is fine for a long work history.");
  if (!out.some(function (m) { return m.level === "bad"; })) add("good", "Nothing is missing that would stop you from downloading.");
  return out;
}

/* ---------- Wording check ----------
   Words employers may not understand, or that point to prison without describing the work.
   Version 1 list: to be reviewed and extended with staff and clients, who know the local terms. */
var WORDING_RULES = [
  { re: /\binmates?\b/i, tip: "Say “people,” “peers,” or “residents” instead of “inmate.”" },
  { re: /\boffenders?\b/i, tip: "Say “people” or “participants” instead of “offender.”" },
  { re: /\bprisoners?\b/i, tip: "Say “people” or “peers” instead of “prisoner.”" },
  { re: /\bcounsel substitute\b/i, tip: "Employers will not know “counsel substitute.” Try “Legal Aide” or “Legal Research Assistant” and describe the work." },
  { re: /\b(DOC|D\.O\.C\.)\s*(#|no\.?|number)/i, tip: "Leave ID numbers off your resume." },
  { re: /\btier\s*walker\b/i, tip: "Employers will not know “tier walker.” Describe the tasks you did instead." },
  { re: /\bhall\s*man\b|\bhallman\b/i, tip: "Employers will not know “hall man.” Describe the tasks you did, for example cleaning or delivering supplies." },
  { re: /\btrust(y|ee) status\b|\btrusty\b/i, tip: "Employers may not know “trusty.” Say what it meant, for example “Trusted to work with little supervision.”" },
  { re: /\blifers?\b/i, tip: "Leave out “lifer.” Your resume is about your skills and work." },
  { re: /\bCTRP\b/, tip: "Employers will not know “CTRP.” Name the program or the certificate you earned instead." },
  { re: /\b(locked up|behind bars|doing time|state time|cell ?block|lock ?down)\b/i, tip: "Lines about your work do not need to mention prison. Your employer line already says where you worked." },
  { re: /\b(in|while in|at) (prison|the penitentiary|jail)\b|\bincarcerat/i, tip: "Lines about your work do not need to mention prison. Your employer line already says where you worked." }
];
var WEAK_STARTS = [
  { re: /^(I|I'm|I've|My|Me)\b/, tip: "Start with an action word instead of “I” or “My.” For example, “Repaired” instead of “I repaired.”" },
  { re: /^(responsible for|duties (included|were|:)|was responsible)/i, tip: "Start with what you did, not “Responsible for.” For example, “Managed” or “Kept.”" },
  { re: /^(was|were|did)\b/i, tip: "Start with a stronger action word, like “Prepared,” “Built,” or “Trained.”" }
];
function wordingIssues(s) {
  var out = [];
  function excerpt(text) { var v = t(text); return v.length > 50 ? v.slice(0, 47) + "..." : v; }
  function scan(text, where, isLine) {
    var v = t(text);
    if (!v) return;
    var seen = {};
    WORDING_RULES.forEach(function (r) {
      if (r.re.test(v) && !seen[r.tip]) { seen[r.tip] = true; out.push(where + ": “" + excerpt(v) + "”. " + r.tip); }
    });
    if (isLine) {
      for (var i = 0; i < WEAK_STARTS.length; i++) {
        if (WEAK_STARTS[i].re.test(v)) { out.push(where + ": “" + excerpt(v) + "”. " + WEAK_STARTS[i].tip); break; }
      }
      if (v.length > 12 && v === v.toUpperCase() && /[A-Z]/.test(v)) out.push(where + ": “" + excerpt(v) + "”. Use normal capitals, not all capital letters.");
    }
  }
  scan(s.summary, "Summary", false);
  s.work.concat(s.volunteer).forEach(function (e) {
    var where = t(e.title) || "A job";
    scan(e.title, where + " (job title)", false);
    cleanBullets(e.bullets).forEach(function (b) { scan(b, where, true); });
  });
  s.skills.forEach(function (k) { scan(k, "Skills", false); });
  return out;
}

/* ---------- Keyword match ---------- */
function allKeywords() {
  var set = {};
  function addK(k) { set[k.toLowerCase()] = k; }
  Object.keys(JOBS).forEach(function (j) { JOBS[j].skills.forEach(addK); });
  Object.keys(SKILL_GROUPS).forEach(function (g) { SKILL_GROUPS[g].forEach(addK); });
  CERT_SUGGESTIONS.forEach(addK);
  EXTRA_KEYWORDS.forEach(addK);
  return Object.keys(set).map(function (k) { return set[k]; });
}
function keywordMatch(s) {
  var posting = t(s.goal.posting).toLowerCase();
  if (!posting) return null;
  var resume = buildPlainText(s).toLowerCase();
  var found = [];
  allKeywords().forEach(function (k) {
    var kl = k.toLowerCase();
    if (posting.indexOf(kl) !== -1) found.push({ term: k, inResume: resume.indexOf(kl) !== -1 });
  });
  return found;
}

/* ---------- Summary draft ---------- */
function joinNatural(items) {
  if (items.length <= 1) return items.join("");
  if (items.length === 2) return items[0] + " and " + items[1];
  return items.slice(0, -1).join(", ") + ", and " + items[items.length - 1];
}
function draftSummary(s) {
  var h = s.summaryHelp, parts = [];
  var yrs = t(h.years), field = t(h.field);
  if (yrs && field) parts.push(yrs + " years of experience in " + field + ".");
  else if (field) parts.push("Experienced in " + field + ".");
  (h.strengths || []).forEach(function (x) { parts.push(x + "."); });
  var certs = s.certs.map(function (c) { return t(c.name); }).filter(Boolean).slice(0, 3);
  if (certs.length) parts.push("Holds " + joinNatural(certs) + ".");
  var goal = t(s.goal.title);
  if (goal) parts.push("Seeking work as " + (/^[aeiou]/i.test(goal) ? "an " : "a ") + goal + ".");
  return parts.join(" ");
}
