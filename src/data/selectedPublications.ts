/**
 * SELECTED PUBLICATIONS: curated, not a CV dump.
 * Grouped by the three research streams (same titles as RESEARCH_THEMES), with
 * Southeast Asia first and largest, plus a short AI and scholarly practice group.
 * The full record lives on Google Scholar, ORCID, and the CV.
 *
 * Lives here (not in publications.astro) so the publications page and the
 * site search index read the same list.
 */

export interface SelectedPub {
  citation: string;
  venue: string;
  url: string;
  note?: string;
  award?: string;
  awardUrl?: string;
}

export const selected: Record<string, SelectedPub[]> = {
  "Building Human Capability in Southeast Asia": [
    {
      citation:
        "Crocco, O. S., & Tkachenko, O. (2022). Regional human resource development: The case of Southeast Asia and ASEAN.",
      venue: "Human Resource Development International, 25(1), 40–58",
      url: "https://doi.org/10.1080/13678868.2020.1858261",
      award: "Monica M. Lee Research Excellence Award (AHRD)",
      awardUrl: "https://ahrd.org/awards/",
      note: "Argues for treating Southeast Asia as a distinct regional context for HRD, sitting between national HRD and global HRD scholarship.",
    },
    {
      citation:
        "Tkachenko, O., Crocco, O. S., Nguyen, L. A., & Jonathan, V. (2022). Regional human resource development in ASEAN: An institutional theory perspective.",
      venue: "Human Resource Development Review, 21(2), 225–248",
      url: "https://doi.org/10.1177/15344843221083190",
      note: "An institutional-theory framework for understanding the regulative, normative, and cultural-cognitive forces shaping HRD across ASEAN's member states.",
    },
    {
      citation:
        "Crocco, O. S., Aroonsri, P., & Isna, N. (2025). Communicating a vision for human resource development in Southeast Asia: A thematic analysis of the speeches of ASEAN secretaries-general.",
      venue: "Human Resource Development International, 28(4), 543–566",
      url: "https://doi.org/10.1080/13678868.2024.2441089",
      award: "HRD Cutting Edge Award (AHRD), conference version",
      awardUrl: "https://ahrd.org/awards/",
      note: "What ASEAN's own leaders say HRD is for, and what that vision implies for organizations operating in the region.",
    },
    {
      citation:
        "Crocco, O. S., & Rockett, A. (2026). Leading learning amidst conflict: A qualitative study of leaders of training and education organizations in post-coup Myanmar.",
      venue: "New Horizons in Adult Education and Human Resource Development, online first",
      url: "https://doi.org/10.1177/19394225261464253",
      award: "EJTD Best International Paper (UFHRD), conference version",
      note: "Six community-based leaders in rural Myanmar describe how they keep adult training going after the 2021 coup, drawing on relationships, community legitimacy, and perseverance.",
    },
    {
      citation:
        "Crocco, O. S., & Cseh, M. (2021). Learning, development, and change in a community-based enterprise in Myanmar.",
      venue: "European Journal of Training and Development, 45(4/5), 436–448",
      url: "https://doi.org/10.1108/EJTD-12-2019-0198",
      award: "Outstanding Paper (Emerald)",
      // Emerald's own page now redirects to its homepage, so this is the archived copy.
      awardUrl:
        "https://web.archive.org/web/20250517115026/https://www.emeraldgrouppublishing.com/journal/ejtd/european-journal-training-and-development-literati-award-winners-2022-0",
      note: "A field study with a community-based enterprise in Myanmar, and the fieldwork behind much of my later regional work.",
    },
    {
      citation:
        "Nguyen, L. A., Crocco, O. S., Tkachenko, O., & Jonathan, V. (2022). Crisis leadership during COVID-19: The response of ASEAN and EU regional leaders.",
      venue: "Human Resource Development International, 25(3), 381–399",
      url: "https://doi.org/10.1080/13678868.2022.2071096",
      note: "A comparative analysis of how regional leaders in ASEAN and the EU responded to the pandemic.",
    },
    {
      citation:
        "Crocco, O. S., & Aroonsri, P. (2026). Supporting coastal community resilience through leadership development and training in Thailand.",
      venue: "Journal of Tropical Futures: Sustainable Business, Governance, and Development, 3(1), 39–47",
      url: "https://doi.org/10.1177/27538931251400235",
      note: "Explores who provides leadership development and training for coastal resilience in Thailand, and argues that human and workforce development belongs at the center of coastal protection.",
    },
    {
      citation:
        "Crocco, O. S., & Sukanya Chaemchoy. (2024). Higher education in Thailand.",
      venue: "In L. P. Symaco (Ed.), Higher education in Southeast Asia (pp. 119–137). Emerald",
      url: "https://doi.org/10.1108/S1479-367920240000049009",
      note: "A chapter on Thai higher education in a comparative volume on higher education across Southeast Asia.",
    },
  ],
  "Global Leadership & Adult Learning": [
    {
      citation:
        "Cseh, M., Crocco, O. S., Engel, L., & Follman, J. (2025). Preparing a globally competent workforce: A mixed methods study of an innovative co-curricular university program.",
      venue: "Advances in Developing Human Resources, 27(1), 5–26",
      url: "https://doi.org/10.1177/15234223241296186",
      note: "A mixed methods study of a co-curricular program that develops global competence among American and international graduate students through mutual intercultural learning.",
    },
    {
      citation:
        "Al-Asfour, A., Crocco, O. S., & Shield, S. W. (2024). Leading tribal colleges and universities: Perspectives on the skills and experiences needed to lead Indigenous higher education.",
      venue: "Higher Education Quarterly, 78(4), e12535",
      url: "https://doi.org/10.1111/hequ.12535",
      note: "Interviews with 11 Tribal College and University presidents on what the role asks of them, from building a vision the Tribal community supports to finding mentors.",
    },
    {
      citation:
        "Bachman, J., Henry, R., Jackson, C., Mitchell, T., & Crocco, O. S. (2023). Must it be lonely at the top? Developing leader well-being in organizations.",
      venue: "Advances in Developing Human Resources, 25(2), 73–94",
      url: "https://doi.org/10.1177/15234223231153765",
      note: "An integrative review of what shapes leader well-being at five levels, from the individual to the wider environment.",
    },
  ],
  "The Changing Nature of Work": [
    {
      citation:
        "Aroonsri, P., & Crocco, O. S. (2024). Workplace learning and information exchange among gig workers: Crowdsourcing and the social media advantage.",
      venue: "Journal of Workplace Learning, 36(1), 77–95",
      url: "https://doi.org/10.1108/JWL-03-2023-0049",
      note: "How gig workers in Thailand learn through informal networks and platform-mediated knowledge exchange.",
    },
    {
      citation:
        "Hajjami, O., & Crocco, O. S. (2024). Evolving approaches to employee engagement: Comparing antecedents in remote work and traditional workplaces.",
      venue: "European Journal of Training and Development, 48(3/4), 375–392",
      url: "https://doi.org/10.1108/EJTD-10-2022-0103",
      note: "A review of 27 articles that identifies 18 antecedents of engagement in remote work and compares them with those in traditional workplaces.",
    },
    {
      citation:
        "Thomas, N. J., Baral, R., Crocco, O. S., & Mohanan, S. (2023). A framework for gamification in the metaverse era: How designers envision gameful experience.",
      venue: "Technological Forecasting & Social Change, 193, Article 122544",
      url: "https://doi.org/10.1016/j.techfore.2023.122544",
      note: "Interviews with experienced gamification designers, mapped onto four kinds of gameful experience: nudge, flow, alternate reality, and hedonic.",
    },
  ],
  "AI and scholarly practice": [
    {
      citation:
        "Crocco, O. S., Mohd Rasdi, R., & Garavan, T. N. (2026). Responsible AI in non-empirical research: Guidance for authors, reviewers, and editors in HRD.",
      venue: "Human Resource Development Review, online first",
      url: "https://doi.org/10.1177/15344843261445531",
      note: "Sorts AI use into legitimate, contested, and illegitimate applications across six research touchpoints, and sets eight reporting expectations for non-empirical submissions.",
    },
    {
      citation:
        "Crocco, O. S., Ghosh, R., Kim, S., & Egan, T. (2026). Developing judgment: Responsible AI use for peer reviewers.",
      venue: "Human Resource Development Quarterly, 37(3), 219–225",
      url: "https://doi.org/10.1002/hrdq.70030",
      note: "Guidance for peer reviewers on three points where AI can enter review: transmitting the manuscript, expressing the report, and forming the judgment, which must stay the reviewer's own.",
    },
  ],
};


/** The pieces of a venue string, so the journal name and volume can be set in italics. */
export type VenueParts =
  | { kind: "journal"; journal: string; volume: string; issue: string; pages: string }
  | { kind: "online-first"; journal: string }
  | { kind: "chapter"; editors: string; book: string; pages: string; publisher: string }
  | { kind: "other"; text: string };

export function venueParts(venue: string): VenueParts {
  const chapter = venue.match(/^In (.+?), (.+?) \((pp\. [^)]+)\)\. (.+)$/);
  if (chapter) {
    return { kind: "chapter", editors: chapter[1], book: chapter[2], pages: chapter[3], publisher: chapter[4] };
  }
  const online = venue.match(/^(.+), online first$/);
  if (online) return { kind: "online-first", journal: online[1] };
  // The journal name may itself contain commas, so split at the first ", <digits>".
  const journal = venue.match(/^(.+?), (\d+)(\([^)]+\))?, (.+)$/);
  if (journal) {
    return { kind: "journal", journal: journal[1], volume: journal[2], issue: journal[3] ?? "", pages: journal[4] };
  }
  return { kind: "other", text: venue };
}

/** The journal or book a piece appeared in, as a plain name. */
export function venueName(venue: string): string {
  const v = venueParts(venue);
  if (v.kind === "chapter") return v.book;
  if (v.kind === "other") return v.text;
  return v.journal;
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * The full APA 7 reference, as plain text and as HTML with the italics, so a
 * paste into Word or Google Docs keeps the journal name and volume italic.
 */
export function apaReference(p: SelectedPub): { text: string; html: string } {
  const v = venueParts(p.venue);
  let text: string;
  let html: string;
  switch (v.kind) {
    case "journal":
      text = `${v.journal}, ${v.volume}${v.issue}, ${v.pages}.`;
      html = `<i>${esc(v.journal)}</i>, <i>${esc(v.volume)}</i>${esc(v.issue)}, ${esc(v.pages)}.`;
      break;
    case "online-first":
      text = `${v.journal}. Advance online publication.`;
      html = `<i>${esc(v.journal)}</i>. Advance online publication.`;
      break;
    case "chapter":
      text = `In ${v.editors}, ${v.book} (${v.pages}). ${v.publisher}.`;
      html = `In ${esc(v.editors)}, <i>${esc(v.book)}</i> (${esc(v.pages)}). ${esc(v.publisher)}.`;
      break;
    default:
      text = `${v.text}.`;
      html = `<i>${esc(v.text)}</i>.`;
  }
  return {
    text: `${p.citation} ${text} ${p.url}`,
    html: `${esc(p.citation)} ${html} <a href="${esc(p.url)}">${esc(p.url)}</a>`,
  };
}

/** Short tab labels and URL ids for each stream, in page order. */
const STREAM_META: Record<string, { id: string; short: string }> = {
  "Building Human Capability in Southeast Asia": { id: "southeast-asia", short: "Southeast Asia" },
  "Global Leadership & Adult Learning": { id: "leadership", short: "Leadership & Adult Learning" },
  "The Changing Nature of Work": { id: "work", short: "Changing Nature of Work" },
  "AI and scholarly practice": { id: "ai", short: "AI & Scholarly Practice" },
};

/** The streams as the interactive publications list takes them. Same output at build time and in the browser. */
export function buildStreams() {
  return Object.entries(selected).map(([title, pubs]) => {
    const meta = STREAM_META[title] ?? { id: title.toLowerCase().replace(/[^a-z]+/g, "-"), short: title };
    return {
      id: meta.id,
      short: meta.short,
      title,
      pubs: pubs.map((p) => {
        const ref = apaReference(p);
        return { ...p, apaText: ref.text, apaHtml: ref.html };
      }),
    };
  });
}
