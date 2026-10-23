# Memory files: what good ones look like

You do not need to create memory files yourself. Claude writes them, either because you ask ("remember that...") or because it notices something worth keeping. This file shows what good ones look like, so you know what to ask for and what to prune.

They live in a hidden folder, ~/.claude/projects/<your work folder>/memory/. In Finder, press Command+Shift+G and type ~/.claude/projects to find it. Each is a short text file holding one fact, and an index file called MEMORY.md lists them all, one line each. Claude reads the index at the start of every session and opens a memory when its topic comes up.

Four kinds are useful.

- user: who you are and how you like to work.
- feedback: corrections and confirmed preferences, with the reason.
- project: the state of a piece of work, with dates.
- reference: where something lives outside your files (a portal, a policy, a contact).

The reason matters most in feedback memories. A rule without its reason gets applied mechanically; a rule with its reason gets applied sensibly to cases you did not foresee.

Prune once a month. Delete memories that are finished or wrong, and ask Claude to merge duplicates ("go through my memory files, merge duplicates, and flag anything that looks out of date").

## Example index (MEMORY.md)

```
# Memory index

## Working with [Name]
- [Short answers](short-answers.md): lead with the answer, no option surveys
- [Task list stays flat](task-list-flat.md): one ranked list, never sorted by topic
- [Prints from Word](prints-from-word.md): reading copies single-spaced, printed from Word

## Projects
- [Q4 board report](board-report-q4.md): due 14 Nov; draft in Admin/Board

## Reference
- [Expense reimbursement](expense-reimbursement.md): portal, policy number, receipt rules
```

## Example: a feedback memory

```
---
name: task-list-flat
description: Keep the Task Queue one flat ranked list across all areas; never re-sort it by topic.
metadata:
  type: feedback
---

The Task Queue in Projects Master.xlsx stays a single flat list in priority order,
across every area of work. Do not sort or group it by topic, client, or project.

Why: a topic-sorted version was tried in July and abandoned. Sorting by topic made it
easy to tunnel on whichever area felt urgent while other projects fell away unnoticed.

How to apply: add new tasks at the rank I give, or ask where they go. When an item
is waiting on someone else, move it to the WAITING band and name who has it. When
something is finished, take it off the list rather than marking it done.
```

## Example: a user memory

```
---
name: prints-from-word
description: Prints reading copies from Word, single-spaced; prefers Word to Google Docs for anything long.
metadata:
  type: user
---

Reads long documents on paper. Reading copies are printed single-spaced from Word,
even when the working draft is double-spaced. Prefers Word to Google Docs for anything
longer than a page, because tracked changes and comments are easier to review there.
```

## Example: a project memory

```
---
name: board-report-q4
description: Q4 board report, due 14 Nov 2026; draft in Admin/Board; finance figures still owed by Jordan.
metadata:
  type: project
---

The Q4 board report is due to the board secretary on 14 November 2026. The working
draft is Admin/Board/Q4 Board Report v2.docx. Sections 1 to 3 are drafted. Section 4
waits on the finance figures, which Jordan Reyes promised by 7 November.

Why: the report goes out under my name and the board reads it closely.

How to apply: if the figures have not arrived by 7 November, put a nudge draft for
Jordan in the morning brief. Do not fill section 4 with estimates.
```

## Example: a reference memory

```
---
name: expense-reimbursement
description: Where and how to file expense reimbursements; receipt rules and the policy that governs them.
metadata:
  type: reference
---

Reimbursements are filed in the [portal name] portal (fill the form, never submit; I
submit). The governing policy is [policy name and number]. Itemized receipts are
required over $75. Claims are due within 60 days of the trip. Scanned receipts go in
Admin/Expenses/<year>/<trip>/.
```
