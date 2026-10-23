# Claude Code as an Executive Assistant: A Starter Kit

Prepared from Ozzie Crocco's working setup, October 2026.

This kit shows how to set up Claude Code as an assistant for the administrative side of a working life: the task list, the calendar, email drafts, documents, filing, and the many small projects that run at once. It comes from a setup that has run daily for about six months for a university professor who carries research, teaching, editorial work, and program administration. None of it requires programming. You type requests in plain English, and Claude does the work in files on your own computer.

The folder holds this guide and a Templates folder. Section 9 lists each template and where it goes.

## 1. What Claude Code is

Claude Code is a version of Claude that works directly on your computer. In the ordinary chat window you paste things in and copy things out. In Claude Code, Claude works inside a folder you choose: it reads your Word files, PDFs, and spreadsheets, writes new ones, moves and renames files, and, with your permission, uses your browser and connected apps such as your calendar. It asks before doing anything you have not allowed.

Three features make it work as an assistant.

The first is standing instructions. A plain text file called CLAUDE.md holds your rules: who you are, how you like answers, and what Claude must never do. Claude reads it at the start of every session, so you state a rule once.

The second is memory. Claude keeps its own notes in small text files, one fact per file. A correction you gave it, the status of a project, and where a form lives are typical examples. These carry over between sessions, and you can read, edit, or delete any of them.

The third is skills and scheduled tasks. A skill is a written procedure for a job you do repeatedly, such as a Friday review. A scheduled task runs a prompt on a timer, such as a brief every weekday morning.

All three are ordinary text files you can open and read. When Claude does something wrong, you can see which instruction it was following and fix it at the source.

## 2. What it looks like in practice

A typical day in Ozzie's setup runs like this.

Early each morning a scheduled task writes a brief. It reads the task workbook and the week's calendar and proposes the day's priorities. Its most useful move is the cross-check between the two. It catches a deadline that lands on a day already full of meetings, or a meeting that needs preparation nobody put on the list.

During the day, requests are short and conversational. "Add the conference registration to my task list, due the 14th." "Turn these meeting notes into a one-page document with action items." "File everything on the Desktop." "Read this grant draft and tell me what a reviewer will push on." "Fill in the travel form in Chrome but don't submit it."

Email stays separate. When a reply is wanted, the message goes into the chat, Claude drafts to a file, and the reply is rewritten and sent from his own mail program. The AI never sends.

Files are never deleted. When Claude tidies a folder, anything redundant goes to a quarantine folder called _to_review, with a note saying what each item duplicates. Only Ozzie empties it.

Every project has a home folder, and each main area has a README that maps what is inside. One workbook holds the task list and every dated commitment. When something changes during a session, Claude updates the workbook before the session ends.

Corrections stick. When Claude gets something wrong, Ozzie says so and explains why, and Claude writes a memory so the mistake does not recur. After six months the setup holds a few hundred memory files, most of them small corrections and project notes.

## 3. Setting up: the first hour

### Step 1: Get the app

Claude Code comes with the paid Claude plans (Pro and Max for individuals, Team and Enterprise through an organization). Install the Claude desktop app from claude.ai/download, sign in, and open the Code tab. Claude Code also runs in the Terminal, but the desktop app is the easier start and is what this guide assumes.

Two things to settle before you point Claude at anything.

Your organization's rules come first. Most universities and companies now have a policy on AI tools, usually from IT, research ethics, or HR, and it governs everything in this guide. Find it before you begin, and if there is none, ask who decides. Nothing here overrides it.

Then apply one test to anything you are about to give Claude: do you have permission to share it, and would you be comfortable if it leaked? If the answer to either is no, keep it out. Claude Code works on files on your computer, but the model itself runs on Anthropic's servers, so what Claude reads leaves your machine. How long it is kept and what it may be used for depend on your plan and your settings, so read them. Be most careful with what other people have entrusted to you: student work and records, research participants' data, personnel and salary files, client records, manuscripts under review, and anything covered by a data use agreement or a confidentiality clause. Those people did not agree to an AI reading their material. The global CLAUDE.md template has a rule for exactly this; write your own list into it.

### Step 2: Choose a home folder

Claude works in the folder you open it in, plus everything inside it. Pick one folder that holds your work, such as Documents/Work or the Desktop, and open Claude Code there. You will get more from it if the folder has some shape: a handful of top-level areas (for example Projects, Teaching, Admin, Personal), one folder per project inside them, and names that say what things are. If your files are a mess, tidying them is a good first job for Claude, once the no-deletion rule from Step 3 is in place.

### Step 3: Write your global CLAUDE.md

This is the most important step. Open Templates/global-CLAUDE.md, fill in the bracketed parts, and delete what does not apply. Then ask Claude to put it in place:

"Copy Templates/global-CLAUDE.md to ~/.claude/CLAUDE.md and show me the result."

~/.claude is a hidden folder inside your home folder. To see it in Finder, press Command+Shift+G and type ~/.claude. On Windows it is C:\Users\[your name]\.claude.

Start with the hard rules in the template (email, deletion, forms, money). They prevent the mistakes that are expensive to undo. Add preferences as you discover them. Keep the file to a page or two. A long CLAUDE.md is followed less reliably, and detail belongs in memory or in the folder file.

### Step 4: Write a CLAUDE.md for your work folder

The global file is about you. A folder CLAUDE.md is about the files: how the folder is organized, what the naming conventions mean, where the trackers live, and which folders are finished and should be left alone. Use Templates/work-folder-CLAUDE.md and save it as CLAUDE.md at the top of your work folder. You can also have Claude draft it: "Look through this folder and draft a CLAUDE.md that describes how it's organized. Don't move anything." Then correct the draft.

A large project with its own rules can have its own CLAUDE.md in its folder.

### Step 5: Set up a task list

Templates/Projects-Master.xlsx has a Task Queue, an Upcoming sheet of dated commitments with a live countdown, a Projects sheet, and a README sheet with the rules. Copy it into your work folder and tell Claude where it is: "My task list is Projects Master.xlsx in this folder. Add that to the Where things live section of my global CLAUDE.md." Then dictate your current tasks in one long message and let Claude enter them.

A plain markdown file works as well if you prefer text. What matters is that there is one list and Claude knows where it is.

### Step 6: Connect your tools, one at a time

Claude Code can reach other apps in a few ways.

- Connectors. Google Calendar, Microsoft 365, Google Drive, and similar services are connected once on claude.ai (Settings, then Connectors), and they then appear in the Code tab automatically. You can also click the + beside the message box and choose Add connectors. On a Team or Enterprise plan, an administrator may have to add them for you.
- Claude in Chrome. A browser extension that lets Claude read pages and fill forms in your own Chrome, signed in as you. It is useful for web portals and online forms. The desktop app also has its own built-in browser pane, but that one starts with no saved logins, so use Chrome for anything that needs you signed in.
- Mac apps. On a Mac, Claude can read Apple Calendar through AppleScript, which it writes and runs itself. macOS asks you to grant permission the first time.

To set up Claude in Chrome:

1. Install the Claude in Chrome extension from the Chrome Web Store and sign in to it with the same Claude account. It works in Chrome or Edge and needs a Pro, Max, Team, or Enterprise plan.
2. In the desktop app, Claude uses the extension whenever a task needs the browser. In the Terminal, start a session with `claude --chrome`, or type `/chrome` to check the connection and turn it on by default.
3. Keep the Chrome window visible and watch it work. The extension stops at sign-in pages and CAPTCHAs and hands those to you. You can allow or block individual sites in the extension's settings.
4. Hold the browser rule: fill, never submit. Ask Claude to say what it filled, what it guessed, and what it left blank, then press the final button yourself.
5. Everything on a page Claude opens, Claude reads. Treat a page inside a signed-in portal the way you would treat a document, and keep the same things out of it.

A first task to try: "Open the travel reimbursement form in Chrome and fill it in from the receipts in Admin/Expenses/October. Stop before submitting and tell me what you filled, what you guessed, and what you left blank."

Connect one thing at a time, and only after the hard rules are in your global CLAUDE.md. Start with the calendar; it is what makes the morning brief and meeting preparation work. Email comes last; section 6 says where the line is.

### Step 7: Choose a permission mode

The permission mode decides how often Claude stops to ask you. In the desktop app you change it with the mode selector just below the message box, and the app remembers your choice for each folder. The modes you will use are these.

- Manual. Claude asks before it edits a file or runs a command. Start here.
- Accept edits. Claude edits files without asking but still asks before other actions. Move to this after a week or so; it saves a great deal of clicking.
- Plan. Claude investigates and proposes a plan, and changes nothing until you approve it. Useful for large jobs such as reorganizing a folder.
- Auto. Claude runs most actions without asking, with an automatic safety check on each one. Worth trying once you trust your setup.

There is also a Bypass mode that skips all checks. Leave it off.

When Claude keeps asking about the same harmless action, the prompt usually offers a "don't ask again" choice, which saves a standing permission for that folder.

## 4. The layers, and what goes where

| Layer | What it holds | Who writes it | Where it lives |
|---|---|---|---|
| Global CLAUDE.md | Who you are, how you work, hard rules | You, with Claude's help | ~/.claude/CLAUDE.md |
| Folder CLAUDE.md | How a folder is organized and its conventions | You and Claude | CLAUDE.md at the top of the folder |
| Memory | Corrections, preferences, project status, pointers | Claude, at your request or on its own | ~/.claude/projects/[folder name]/memory/ |
| Skills | Step-by-step procedures for repeated jobs | Claude, from your description | ~/.claude/skills/[skill name]/SKILL.md |
| Scheduled tasks | Prompts that run on a timer | Claude, from your description | Set up from the desktop app |

A rule of thumb for where something goes. If it must hold every time, in every folder, it goes in the global CLAUDE.md. If it is about how a folder works, it goes in that folder's CLAUDE.md. If it is a lesson, a preference that came up once, or the state of a project, let it be a memory. If it is a procedure with steps, make it a skill.

### Memory

Memory is on by default, and each folder you open Claude in gets its own set. Claude keeps an index file, MEMORY.md, with one line per memory, and reads the first 200 lines of it at the start of each session, so the index should stay one short line per memory. It opens the full memory file when that topic comes up.

You can create memories directly. "Remember that I print reading copies single-spaced." "Remember that the board report is due 14 November and the draft is in Admin/Board." The most valuable memories come from corrections. When Claude gets something wrong, tell it what was wrong and why, and ask it to remember. A memory with the reason attached lets Claude apply the lesson to cases you did not anticipate.

Look through the memory folder once a month. Delete what is stale and fix what is wrong, or ask Claude to do a pass: "Go through my memory files, merge duplicates, and flag anything that looks out of date." Templates/memory-examples.md shows what good memory files look like.

### Skills

When you have explained the same multi-step job to Claude three times, ask it to turn the job into a skill. "Make what we just did into a skill called weekly-review so I can run it every Friday." A skill is a folder holding a SKILL.md file. The top of the file describes what the skill is for and when to use it. Claude reads those descriptions and uses a skill when a request matches, and you can also call one by name, for example /weekly-review.

Three of Ozzie's: a grading skill that writes feedback in his own voice, one that scrubs AI-sounding phrasing out of a draft, and one that answers questions from a local copy of his university's policies. Each began as a job explained once in conversation.

Templates/weekly-review/SKILL.md is a working example you can install as it is.

### Scheduled tasks

In the desktop app, click Scheduled in the Code tab's sidebar and then New task, or just ask in any session: "Set up a scheduled task that runs every weekday at 6 a.m. using the prompt in Templates/morning-brief.md."

These tasks run on your own computer, so they run only while the computer is awake and the app is open. If a run is missed because the computer was asleep, the task runs once to catch up when it wakes. For an early-morning brief, turn on the keep-awake option in the app's settings (Settings, then This computer, then System) and leave the laptop open and plugged in overnight.

Start with one, the morning brief. Add others only when you find yourself asking for the same thing on a schedule. Others worth adding later: a Friday review, a weekly draft for a newsletter or social post, a monthly refresh of a policy library.

## 5. Hard rules to copy on day one

These are all in the global template. Each one exists because the mistake it prevents is costly or cannot be undone.

Email is drafted and never sent. This holds whether email is connected or a message is pasted into the chat. No AI sends or deletes your email unless you tell it to in the current conversation, naming the message. Approving the wording of a draft is not an instruction to send it. Claude writes the draft to a file, and you send it. Many people never connect email at all and lose little; section 6 says where the line is.

Files are never deleted or overwritten. Redundant or stale files go to a _to_review quarantine folder, and only you empty it. Presentations deserve extra care. Ozzie's rule now is that slide decks are listed for him during a tidy and never moved.

Browser forms are filled and never submitted. Claude prepares the form, lists what it guessed or left blank, and stops. You review it and press the final button, because a wrong field becomes your signature on an official record.

Claude does not handle passwords, payments, or account changes. It will not type passwords, card numbers, or ID numbers, and it will not buy, transfer, or change account settings. It tells you when you need to do one of these yourself.

Nothing is made up. Claude reads the full source, does not infer what is not there, and flags uncertainty. For anything that goes out under your name, check names, titles, dates, and citations yourself.

Confidential records follow your employer's policy. If you have a policy about student, patient, personnel, or licensed data, write it into the global CLAUDE.md as a rule, and name the folders it covers.

One limit to keep in mind. CLAUDE.md is strong guidance, and in daily use these rules hold well, but it is not a lock. The permission mode is the lock. So for the actions that matter most, such as anything touching email or the Trash, keep Claude asking before it acts, and read what it proposes before you approve.

## 6. Habits that make it work

Give the reason along with the instruction. "Keep the task list in one flat ranked list" is a rule. "Keep it flat, because when I sort by topic I tunnel on whatever feels urgent and other projects fall away" is a rule Claude can apply sensibly in a situation you did not foresee.

Say it when you correct something. If you fix Claude's mistakes by hand without comment, it cannot learn from them, and from its side the error never happened. Ozzie once found he had been quietly fixing the same small error for weeks. Say "you got X wrong; remember that Y," and the fix carries forward. When you raise a small error, ask Claude to look for the same error elsewhere.

Say how you want answers. If you read replies between meetings, tell Claude to keep them short and lead with the answer, and put that in the global CLAUDE.md.

Ask for a file for anything you will keep. Chat scrolls away. Drafts, plans, notes, and summaries you want later should go to a file in the right project folder. When you need to open one, ask Claude to send it to you in the chat.

Use one session per job. Start a new session when you change topics. Long sessions get summarized automatically, and detail is lost in the summary. CLAUDE.md and memory carry what matters from one session to the next.

Use Claude to check your writing. This is where it is strongest: facts, citations, consistency between versions, structure, and what a skeptical reader will object to. Prose it writes from scratch in your voice usually reads as machine-written, however good the instructions. Ozzie's practice is to have it edit and diagnose his sentences while he writes the important ones himself. For routine material such as email, a voice profile helps (Templates/voice-profile.md).

Ask it to check its own work. "Open the Word document and confirm every heading has zero spacing." "Recount the rows." Claude verifies when asked and often catches its own errors that way.

Leave email for last. Many people run this setup for weeks without connecting email, and the task list, the documents, and the filing carry most of the value. The lightest route needs no connection: paste one message into the chat when you want a draft, and nothing else in your inbox is touched. Before connecting an inbox, think about the people who write to you. A student, a client, or an author whose manuscript you are handling did not agree to an AI reading their message; your employer may have a policy, and some publishers restrict AI anywhere in the review process. Keep student records, personnel matters, and manuscripts under review out of it, and say so in your global CLAUDE.md. Whatever route you take, the drafts are yours to rewrite; the sentences people receive should be the ones you chose to send.

Keep a backup running. Claude works on real files, so keep Time Machine or a cloud backup on.

## 7. Your first week

Day 1. Install the app, write the global CLAUDE.md with the hard rules, and open Claude in your work folder. Ask it: "Look around this folder and tell me how it's organized. Don't change anything."

Day 2. Draft the folder CLAUDE.md with Claude. Set up the task workbook and dictate your current tasks into it.

Day 3. Try document work. Give it a draft you are working on and ask what a skeptical reader will say. Ask it to turn some notes into a formatted Word document.

Day 4. Have it tidy one messy folder, with anything redundant going to _to_review. Read the report it gives you.

Day 5. Connect your calendar and ask what the coming week looks like against the task list. Then ask it to prepare you for one meeting: who is coming, what you owe them, what to bring.

Week 2. Set up the morning brief. Turn one repeated job into a skill. Look in the memory folder to see what Claude has learned. Email can wait until you decide you want it; see section 6.

## 8. Prompts to try

Each of these is a complete request you can paste and adapt.

- What's on my plate this week? Read my task workbook and my calendar and tell me where the crunch points are.
- Add these to my task list: [list]. Put the grant report at the top of NOW; it's due Friday.
- Move the conference abstract to WAITING. My co-author has it.
- Draft a reply to this email. I'm agreeing to the meeting but need to move it to Tuesday afternoon. Save the draft to a file and don't send anything.
- File the loose files on my Desktop into the right folders. Duplicates go to _to_review with a note saying what each one duplicates. Don't delete anything.
- Read this draft and tell me the three things a reviewer will push back on hardest. Don't rewrite it.
- Check every citation in this manuscript against the reference list and tell me what is cited but not listed, or listed but not cited.
- Turn these meeting notes into a one-page Word document with action items and who owns each.
- Prepare me for my 2:00 meeting: who is coming, what we discussed last time, and what I owe them.
- Fill in this registration form in Chrome with my details, but stop before submitting and tell me what you guessed.
- Remember that I want every Word document in Times New Roman 12 with no space between paragraphs.
- Make what we just did into a skill so I can run it again next month.
- Go through my memory files and flag anything out of date.

## 9. What's in the Templates folder

Templates/global-CLAUDE.md. Your standing instructions for every session. Fill in the brackets and copy it to ~/.claude/CLAUDE.md.

Templates/work-folder-CLAUDE.md. A map of your work folder for Claude. Save it as CLAUDE.md at the top of the folder.

Templates/voice-profile.md. Optional. A structure for describing how you write, for when you want Claude to draft in your voice. It is easiest to build by having Claude interview you, and the template explains how.

Templates/memory-examples.md. What memory files and the MEMORY.md index look like, with one example of each kind. Claude creates these itself; the examples show what good ones look like so you can ask for them.

Templates/weekly-review/SKILL.md. A complete Friday review skill. Ask Claude to install it: "Copy the SKILL.md in Templates/weekly-review to ~/.claude/skills/weekly-review/SKILL.md."

Templates/morning-brief.md. The prompt for a daily scheduled brief, with setup instructions at the top. Email is an optional step, off until you add it.

Projects-Master.xlsx. A task workbook with Task Queue, Upcoming, Projects, and README sheets. The example rows show the format; delete them once your own tasks are in.

## 10. When things go wrong

It ignored a rule. Check where the rule lives. A rule that must always hold belongs in the global CLAUDE.md, stated plainly, with its reason. If it is there and was still ignored, say so and ask Claude why. The answer usually points to a conflict or an ambiguity in the wording.

It keeps asking permission for the same thing. Choose the "don't ask again" option when the prompt offers it, or switch the folder to Accept edits.

It's too wordy. Put your preference for answer length in the global CLAUDE.md.

Word documents come out with odd formatting. State your defaults (font, size, spacing, citation style) in the global CLAUDE.md, and ask Claude to check the formatting in the finished file.

It made something up. Say so directly, and ask it to remember to flag uncertainty. For high-stakes material, ask it to show the source for each claim.

You can't find the ~/.claude folder. It is hidden. In Finder, press Command+Shift+G and type ~/.claude.
