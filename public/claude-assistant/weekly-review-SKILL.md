---
name: weekly-review
description: Run a weekly review of the task list and calendar, then plan next week. Use when the user says "weekly review", "Friday review", "plan next week", "what slipped this week", "where am I on everything", or /weekly-review.
---

# Weekly review

Run this on Fridays, or whenever the user asks. The point is to catch what slipped, see who is holding up what, and agree on next week's top priorities before the weekend. Keep the report to about one screen.

The task workbook and calendar are named in the user's global CLAUDE.md under "Where things live". Read that first if you do not already know where they are.

## Steps

1. Read the task workbook. Recompute days remaining from the date columns against today's date yourself; do not trust a cached countdown column, which goes stale whenever the file has not been opened in Excel.

2. Read the calendar for the past seven days and the next fourteen. If the calendar cannot be reached, say so in one line and carry on.

3. Find last week's review in `Weekly Reviews/` inside the work folder, if there is one. Compare its proposed top five with the workbook now, to see what moved and what did not.

4. Write the review in this order, briefly:
   - Moved this week: what came off the list or advanced since last review.
   - Slipping: anything overdue, and anything from last week's top five that has not moved.
   - Waiting on others: each WAITING item, who has it, and how long it has been there. Mark anything waiting more than ten days.
   - Next week: meetings that need preparation, deadlines, and any day with no open working block.
   - Proposed top five for next week, in order, with one line each on why.

5. For each WAITING item marked in step 4, draft a short, friendly nudge. Put all the drafts in one file, `Weekly Reviews/<YYYY-MM-DD> follow-up drafts.md`. Never send them; the user sends what they want.

6. Save the review itself as `Weekly Reviews/<YYYY-MM-DD>.md` and tell the user where both files are.

7. Ask the user to confirm or change the top five. Only after they confirm, reorder the Task Queue to match and take off anything they say is finished.

## Rules

- Email is drafted, never sent.
- Nothing is deleted. Finished tasks come off the list only when the user confirms them.
- Do not add calendar events to the workbook. If a calendar commitment needs preparation that is not on the list, say so and let the user decide.
