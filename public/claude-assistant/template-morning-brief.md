# Morning brief: scheduled task prompt

Notes for you (delete this section when you finish): this is the prompt for a daily brief that runs on a schedule. Fill in the brackets, then ask Claude in the desktop app: "Set up a scheduled task called morning-brief that runs every weekday at [6:00 a.m.] using the prompt in Templates/morning-brief.md." (You can also click Scheduled in the Code tab's sidebar and then New task.) Run it once by hand first and adjust until the brief is useful.

A task scheduled in the desktop app runs only while your computer is awake and the app is open. If the computer was asleep at the scheduled time, the task runs once to catch up when it wakes. For an early brief, turn on the keep-awake option (Settings, then This computer, then System) and leave the laptop open and plugged in.

Email is not part of this brief unless you add it. Most people run the brief on the task list and the calendar alone, and the cross-check between those two is where the value is. If you decide later that you want an email step, the optional step at the bottom shows how to add it.

## The prompt (everything below this line)

Produce my morning brief. Work in [~/Documents/Work]. Do these steps, then stop and wait for me.

1. Read the task workbook at [~/Documents/Work/Projects Master.xlsx]. Use the Upcoming sheet and the Task Queue sheet. Recompute days remaining from the dates against today's date yourself; do not trust the cached Days column. Pull anything overdue, anything due in the next 14 days, and the top of the NOW band.

2. Read my calendar for today and the next seven days [through the Google Calendar connector / from Apple Calendar / in Outlook on the web in Chrome]. If it cannot be reached, say so in one line and carry on.

3. Cross-check the two sources against each other. This is the most useful part. Name:
   - any deadline that lands on a day already heavily booked;
   - any meeting that needs preparation that is not on the task list;
   - any day this week with no open working block.

4. Write the brief, short enough to read in two minutes, in this order:
   - Today, in time order, with start and end times.
   - Deadlines in the next 14 days.
   - Cross-check flags from step 3.
   - Proposed top three for today.

5. Stop. Do not change the workbook or the calendar until I reply.

## Optional email step (not included until you add it)

Decide first whether your work allows it. A student, a client, or an author whose manuscript you are handling did not agree to an AI reading their message, and your employer or a publisher may have a policy. If you go ahead, insert the paragraph below as a new step 3, renumber the rest, and add "Email that needs me, one line each" to the brief's order. Start with senders and subject lines only; widen it later if you trust what it does.

Look at email received in the last [24] hours [in which account]. Read only senders, subject lines, and times; open a message only if the subject alone does not tell you whether it needs me. Skip anything from [the people or matters your rules file lists as confidential]. Never send, reply, move, flag, or delete anything.
