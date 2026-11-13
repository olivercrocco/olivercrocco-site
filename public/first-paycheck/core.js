/* ---------- 2026 tax figures ----------
   Federal: IRS IR-2025-103 (Rev. Proc. 2025-32). Standard deduction and brackets for 2026.
   Head of household brackets above 12% are taken as equal to single, which only matters above about $105,000.
   Social Security 6.2% up to $184,500 and Medicare 1.45%.
   Louisiana: flat 3% income tax from 2025 (2024 tax reform);
   2026 withholding standard deduction $12,875 single, $25,750 married filing jointly or head of household
   (Louisiana Department of Revenue, 2026 withholding tables). */
var TAX = {
  year: 2026,
  fedStd: { single: 16100, hoh: 24150, mfj: 32200 },
  fedBrackets: {
    single: [[12400, 0.10], [50400, 0.12], [105700, 0.22], [201775, 0.24], [256225, 0.32], [640600, 0.35], [Infinity, 0.37]],
    hoh:    [[17700, 0.10], [67450, 0.12], [105700, 0.22], [201775, 0.24], [256225, 0.32], [640600, 0.35], [Infinity, 0.37]],
    mfj:    [[24800, 0.10], [100800, 0.12], [211400, 0.22], [403550, 0.24], [512450, 0.32], [768700, 0.35], [Infinity, 0.37]]
  },
  ssRate: 0.062, ssBase: 184500, medRate: 0.0145,
  laRate: 0.03,
  laStd: { single: 12875, hoh: 25750, mfj: 25750 }
};
var SCHEDULES = {
  weekly: { label: "Every week", n: 52 },
  biweekly: { label: "Every two weeks", n: 26 },
  semimonthly: { label: "Twice a month", n: 24 },
  monthly: { label: "Once a month", n: 12 }
};
var FREQ = { month: { label: "per month", f: 1 }, week: { label: "per week", f: 52 / 12 }, biweek: { label: "every two weeks", f: 26 / 12 } };

var COST_GROUPS = [
  { id: "required", label: "Payments you are required to make", color: "#c0392b",
    note: "Keep these current first. Falling behind can cause trouble with your supervision.",
    items: [
      ["supervision", "Parole supervision fee", "Ask your parole officer what you owe."],
      ["restitution", "Restitution", ""],
      ["court", "Court costs and fines", ""],
      ["childsupport", "Child support", "If it is taken out of your paycheck, still list it here."],
      ["programs", "Drug tests, classes, or treatment fees", ""]
    ] },
  { id: "basics", label: "Basics", color: "#1d437e",
    items: [
      ["housing", "Rent or housing", "Include what you pay family or a reentry house."],
      ["food", "Food", ""],
      ["phone", "Phone", ""],
      ["transport", "Getting to work", "Bus pass, gas, or rides."],
      ["utilities", "Lights, water, and gas", ""],
      ["personal", "Hygiene and personal care", ""],
      ["work", "Work clothes, boots, or tools", ""]
    ] },
  { id: "other", label: "Other", color: "#28b6c3",
    items: [
      ["family", "Helping family", ""],
      ["debts", "Other debts", ""],
      ["savings", "Savings", "Even a small amount each paycheck adds up."],
      ["otherCost", "Anything else", ""]
    ] }
];

function newState() {
  var costs = {};
  COST_GROUPS.forEach(function (g) { g.items.forEach(function (it) { costs[it[0]] = { amt: "", freq: "month" }; }); });
  return { version: 1, pay: { rate: "", hours: "40", ot: "", schedule: "biweekly", status: "single" }, costs: costs };
}
function mergeState(x) {
  var s = newState();
  if (!x || typeof x !== "object") return s;
  if (x.pay) Object.keys(s.pay).forEach(function (k) { if (x.pay[k] !== undefined) s.pay[k] = String(x.pay[k]); });
  if (x.costs) Object.keys(s.costs).forEach(function (k) {
    var c = x.costs[k];
    if (c && typeof c === "object") { s.costs[k].amt = String(c.amt || ""); if (FREQ[c.freq]) s.costs[k].freq = c.freq; }
  });
  if (!SCHEDULES[s.pay.schedule]) s.pay.schedule = "biweekly";
  if (!TAX.fedStd[s.pay.status]) s.pay.status = "single";
  return s;
}
function num(v) {
  var n = parseFloat(String(v === undefined || v === null ? "" : v).replace(/[$,\s]/g, ""));
  return isFinite(n) && n > 0 ? n : 0;
}
function round2(x) { return Math.round(x * 100) / 100; }
function money(x, cents) {
  return (x < 0 ? "-" : "") + "$" + Math.abs(x).toLocaleString("en-US", { minimumFractionDigits: cents === false ? 0 : 2, maximumFractionDigits: cents === false ? 0 : 2 });
}

/* Federal income tax on a year of wages, after the standard deduction. */
function federalTax(annual, status) {
  var taxable = Math.max(0, annual - TAX.fedStd[status]);
  var tax = 0, lower = 0;
  TAX.fedBrackets[status].forEach(function (b) {
    if (taxable > lower) tax += (Math.min(taxable, b[0]) - lower) * b[1];
    lower = b[0];
  });
  return tax;
}
function louisianaTax(annual, status) {
  return Math.max(0, annual - TAX.laStd[status]) * TAX.laRate;
}
/* Everything about one person's pay, per year, per paycheck, and per month. */
function payBreakdown(s) {
  var rate = num(s.pay.rate), hours = num(s.pay.hours), ot = num(s.pay.ot);
  var weekly = rate * hours + rate * 1.5 * ot;
  var annual = weekly * 52;
  var n = SCHEDULES[s.pay.schedule].n;
  var lines = {
    gross: annual,
    federal: federalTax(annual, s.pay.status),
    ss: Math.min(annual, TAX.ssBase) * TAX.ssRate,
    medicare: annual * TAX.medRate,
    louisiana: louisianaTax(annual, s.pay.status)
  };
  lines.net = lines.gross - lines.federal - lines.ss - lines.medicare - lines.louisiana;
  function per(div) {
    var o = {};
    Object.keys(lines).forEach(function (k) { o[k] = round2(lines[k] / div); });
    o.net = round2(o.gross - o.federal - o.ss - o.medicare - o.louisiana);
    return o;
  }
  return {
    rate: rate, hours: hours, ot: ot, weeklyGross: weekly, periods: n,
    year: per(1), check: per(n), month: per(12),
    takeHomeHourly: (hours + ot) > 0 ? lines.net / 52 / (hours + ot) : 0,
    valid: rate > 0 && (hours + ot) > 0
  };
}
function monthlyCost(c) { return num(c.amt) * FREQ[c.freq || "month"].f; }
function budget(s) {
  var pb = payBreakdown(s);
  var groups = COST_GROUPS.map(function (g) {
    var total = 0;
    g.items.forEach(function (it) { total += monthlyCost(s.costs[it[0]]); });
    return { id: g.id, label: g.label, color: g.color, total: round2(total) };
  });
  var costs = groups.reduce(function (a, g) { return a + g.total; }, 0);
  var income = pb.month.net;
  return { pay: pb, groups: groups, costs: round2(costs), income: income, left: round2(income - costs),
    hoursToCover: pb.takeHomeHourly > 0 ? costs / pb.takeHomeHourly / (52 / 12) : 0 };
}
/* ---------- Example to try (made-up numbers) ---------- */
function exampleWork() {
  var s = newState();
  s.pay = { rate: "16.50", hours: "40", ot: "", schedule: "biweekly", status: "single" };
  var c = { supervision: "60", restitution: "50", programs: "20", housing: "650", food: "350", phone: "45", utilities: "120", personal: "40", work: "30", savings: "50" };
  Object.keys(c).forEach(function (k) { s.costs[k] = { amt: c[k], freq: "month" }; });
  s.costs.transport = { amt: "25", freq: "week" };
  return s;
}

function planText(s) {
  var b = budget(s), p = b.pay, L = [];
  L.push("MY FIRST PAYCHECK PLAN (estimate, " + TAX.year + " taxes)");
  L.push("");
  L.push("Pay: " + money(p.rate) + " an hour, " + (p.hours || 0) + " hours a week" + (p.ot ? " plus " + p.ot + " overtime hours" : "") + ", paid " + SCHEDULES[s.pay.schedule].label.toLowerCase() + ".");
  L.push("Each paycheck: about " + money(p.check.gross) + " before taxes, " + money(p.check.net) + " take-home.");
  L.push("Each month: about " + money(p.month.net) + " take-home.");
  L.push("");
  L.push("Monthly costs:");
  COST_GROUPS.forEach(function (g) {
    g.items.forEach(function (it) {
      var m = monthlyCost(s.costs[it[0]]);
      if (m > 0) L.push("  " + it[1] + ": " + money(m));
    });
  });
  L.push("  Total: " + money(b.costs));
  L.push("");
  L.push(b.left >= 0 ? "Left over each month: " + money(b.left) : "Short each month: " + money(-b.left));
  return L.join("\n");
}
