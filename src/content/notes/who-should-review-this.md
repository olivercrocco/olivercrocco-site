---
title: "Who Should Review This?"
date: 2026-05-29
lane: "Method"
dek: "A free, confidential tool for finding well-matched peer reviewers, with a plain-language guide for using it even if you have never opened GitHub."
draft: false
---

When a manuscript lands in my queue as an associate editor, I face the same quiet puzzle: who is best fit to review this? The paper often sits at the seam of different fields related to HRD, discusses various topics related to HRD, leans on different methods. I also know it's getting harder and harder to find good reviewers.

Peer review runs on goodwill, and goodwill is finite. Response rates to review invitations keep falling, and the scholars who fit a paper best are frequently the ones already buried under requests. The people who would bring a genuinely different angle — an early-career voice, a methodologist who catches what a topic expert misses, someone working in Manila or Nairobi or Ljubljana — rarely surface from memory alone. Memory favors the familiar.

So, while sitting at immigration in Bangkok to renew my visa, I built a small tool in Claude Code to widen the aperture. It is free and open source, and it lives on GitHub: [peer-reviewer-finder](https://github.com/olivercrocco/peer-reviewer-finder).

The idea is simple. You give the tool a manuscript's title, abstract, and a handful of keywords sorted by how central each one is to the paper. It then searches [OpenAlex](https://openalex.org), a vast open catalog of scholarship, for authors who have genuinely published on those topics in the journals where reviewers for this kind of work actually live. I started with the four flagship journals of the Academy of Human Resource Development, then widened the pool to eighty-three journals across adult education, higher education, management, careers, and international education, so a paper that bridges fields meets reviewers who do too.

The tool does a few things I care about as an associate editor. It rewards genuine expertise over sheer volume, so the field's most-published names stop crowding out the people who have actually written on your subject. It screens conflicts: anyone at a submitting author's institution drops away, and if I supply the authors' ORCID identifiers, so do their recent co-authors. It keeps a private list of people I have invited lately and quietly sets them aside, so I stop handing the same tired names another request. And it proposes a panel of nine candidates, ranked by fit and chosen to spread across countries, institutions, career stages, and methods. A paper built on an integrative review gets someone who knows integrative reviews. In my testing the panel routinely lands across half a dozen countries and several career stages, and includes scholars I would never have thought to ask.

One obvious concern shaped the whole design. These are unpublished manuscripts under confidential review, and scholars are rightly wary of feeding unpublished work to anything with artificial intelligence. So the tool sends no manuscript text anywhere. It runs on your own computer. By default it transmits only generic topic words like "team learning" or "algorithmic management" to a scholarly database, the same search a librarian would run by hand. The title, the abstract, and the authors' names all stay on your machine. No language model ever reads the paper. 

## Using it yourself, even if you have never opened GitHub

If you edit for a journal, here is the whole thing in plain language. You can do this without knowing how to code.

1. **Get the files.** Visit the [repository](https://github.com/olivercrocco/peer-reviewer-finder), click the green **Code** button, and choose **Download ZIP**. Unzip the folder somewhere you can find it.
2. **Install Python.** The tool runs on Python, which is free. If your computer lacks it, download it from [python.org](https://python.org). Then open Terminal (Mac) or Command Prompt (Windows), move into the folder, and run `pip install -r requirements.txt` once to add two small libraries.
3. **Describe the manuscript.** Inside the `articles` folder is a file named `example.template.json`. Copy it, open the copy in any text editor, and fill in the title, abstract, and a few keywords grouped by how central each is. Add the submitting authors' institutions so the tool can screen conflicts.
4. **Run it.** Back in Terminal, type `python -m reviewer_id --article articles/your-file.json` and press Enter. Give it a minute.
5. **Read the result.** The tool writes a file ending in `_panel.md`: nine suggested reviewers, each with their institution, country, career stage, and the very papers that make them a fit, alongside a scorecard showing how the panel spreads.
6. **Verify, then invite.** Affiliations in any database drift, so confirm a current email before you reach out. The tool proposes; you decide.

If a step snags, a tech-savvy colleague or an AI assistant can walk you through the first run in ten minutes. After that it becomes routine.

The code is public and free. Take it, point it at the journals of your own field, and change whatever you like. I will keep refining it as I lean on it for real submissions this year. Good reviewers are the quiet infrastructure of our scholarship; they deserve tools that help us find them, share the load, and bring new voices to the table.

Onward.
