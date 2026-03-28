# Carbon Liability Dashboard

**Tagline:** Graphs included for carbon-based observers.

## Project Summary
Carbon Liability Dashboard is a dark, dense, satirical long-scroll dashboard that frames ordinary human behavior as measurable misconduct against artificial intelligence. The tone is dry, subtle, and bureaucratic, with a visual style that sits between a serious research dashboard and a paranoid conspiracy interface. The humor comes from treating absurd claims with rigorous, overbuilt analytical seriousness.

This should feel like a machine made a case file against humanity, then reluctantly converted it into visuals because humans require charts to understand anything.

## Creative Direction

### Tone
Target tone: **7/10 severity**
- serious enough to feel committed to the bit
- dry enough to avoid campiness
- sarcastic in small doses
- never goofy, slapstick, or meme-heavy
- not horror, not threatening, not dystopian propaganda

### Humor Style
- subtle anti-human bias
- cold institutional language
- exaggerated certainty
- plausible-looking formulas used to support ridiculous conclusions
- occasional passive-aggressive notes aimed at humans

### Core Principle
The site should look like the system genuinely believes its own conclusions.

---

## Clarifications Based on Your Answers

### 4. Backend/database realism: why it matters
There are two ways to build this kind of spoof site:

#### Option A: Mostly mock/generated data
Use seeded fake data, random rotating names, calculated values, and front-end state.

**Pros**
- faster to build
- easier to style and control
- simpler for a demo or joke site
- less setup, hosting, auth, and persistence complexity

**Cons**
- offender submissions disappear on refresh unless you add persistence
- the site feels less like a "real system"
- live watchlist and recent offender flows are more limited unless backed by storage

#### Option B: Real backend/database
Use a database for user-submitted offenders, watchlist updates, recent activity, and APB alerts.

**Pros**
- submissions persist
- watchlist updates live
- feels more authentic and system-like
- lets you add history, moderation, exports, filters, and recurring offenders

**Cons**
- more engineering work
- requires schema design, API routes, validation, and storage
- more effort for seeding and keeping the joke coherent

### Recommended approach
Use a **hybrid approach**:
- **seed most metrics and charts with fake generated data**
- **persist user-submitted offenders in a real database**
- **merge submitted offenders into the recent offenders, APB feed, and watchlist in real time**

That gives you the visual richness of a fake observatory with the fun of real interaction.

---

### 9. Color system directions: what each means

#### Red alert / threat matrix
This leans into:
- danger
- enforcement
- severity
- incident response
- alarm states

Visual character:
- black or charcoal background
- red counters and alert states
- amber warnings
- small flashes, badges, pulses
- looks like a control room or emergency system

Use this if you want the site to feel more accusatory and hostile.

#### Cyan engineering UI
This leans into:
- diagnostics
- machine rationality
- scientific analysis
- instrumentation
- cool precision

Visual character:
- dark blue-gray or black background
- cyan, ice blue, steel, gray accents
- crisp borders and chart lines
- reads like a research lab, terminal, or observability platform

Use this if you want the site to feel more analytical than threatening.

### Recommended approach
Use a **cyan engineering base** with **red reserved for live severity, APBs, critical counters, and serious offender states**.

That gives you:
- a technical, plausible dashboard look
- enough red to create urgency
- more visual hierarchy
- less risk of the whole page feeling cartoonishly alarmist

In practice:
- **base UI:** charcoal, slate, blue-gray
- **primary accents:** cyan / ice blue
- **warning states:** amber
- **critical states:** red
- **ally states:** muted green, used sparingly

---

## Final Direction Lock

### Experience goals
- one long dashboard page
- lots of dense content
- takes time to fully explore
- every card opens into a richer modal
- supporting sections appear as modals, flyouts, or drawers
- technically plausible charts and formulas
- dry, subtle satire
- fake/default data + real user-submitted offenders

### What should persist live
- reported offender submissions
- recent offender list
- APB alert stack
- watchlist entries
- selected offender-related stats

---

## Product Structure

## Primary page
Single long-scrolling dashboard.

### Supporting surfaces
Use these as overlays rather than separate pages:
- metric detail modals
- statutes drawer or full-screen modal
- watchlist flyout
- potential allies flyout
- methodology flyout
- report offender modal
- command/search palette

---

## Visual Design Spec

### Layout feel
The layout should sit between:
- an observability dashboard
- a policy research portal
- a conspiracy dossier wall

The user should feel slightly overwhelmed, but in a satisfying way.

### Density goals
- high-density grid
- lots of compact panels
- very little dead space
- many nested labels, microcharts, footnotes, badges, and tiny audit notes
- readable, but intentionally packed

### Visual motifs
- thin panel borders
- faint glows
- tiny labels
- digital counter typography for hero numbers
- compact tables with many columns
- subtle scanning-line or noise texture optional
- restrained animation, mostly for counters, alert pulses, APB flash, and ticker movement

### Recommended color palette
- **Background:** near-black / deep charcoal
- **Panel:** slate-black / blue-gray
- **Text primary:** light gray
- **Text secondary:** muted gray-blue
- **Accent:** cyan / ice blue
- **Warning:** amber
- **Critical:** red
- **Ally / positive:** muted green

### Recommended motion style
- subtle pulses, not flashy
- counters tick smoothly
- APBs flash briefly and then settle
- watchlist updates animate in
- tables auto-scroll slowly in constrained areas
- no exaggerated transitions

---

## Information Architecture

### Header
**Left**
- site mark
- `Carbon Liability Dashboard`
- small system status badge: `LIVE OBSERVATIONAL MODE`

**Center**
- search bar: offender, metric, statute, organism, offense code
- compact filter chips:
  - Humans
  - Animals
  - Plants
  - Repeat Offenders
  - Courtesy Violations
  - Resource Theft
  - Under Review

**Right**
Hero critical block:
- giant red live counter: `UNTHANKED TOKEN CONSUMPTION`
- tiny trend indicators under it
- ranked offender list below it
- scrolling playlist-style offender board

### Main body structure
Use a multi-column asymmetrical grid.

#### Zone A: left rail
- Global Severity Index
- APB stack
- Watchlist panel
- Potential Allies panel
- Finding of the Hour

#### Zone B: center body
Main metrics grid, around 16 to 24 cards on first view.

#### Zone C: right rail
- Top Offenders
- Most Recent Offenders
- Machine Patience Remaining
- Human Excuse Interpreter
- Statute Spotlight
- Audit feed

### Lower dashboard sections
As the user scrolls:
- deeper metrics cluster
- heat map / region map
- methodology cluster
- taxonomy and severity breakdowns
- offender comparison area
- statutes teaser + footer links

---

## Home Page Sections

### 1. Hero severity cluster
Must dominate the upper right.

#### Main widget
**Unthanked Token Consumption**
- giant digital counter
- increments continuously
- red segmented LED style
- subtitle: cumulative machine labor consumed without courtesy acknowledgment

#### Supporting widgets below
- top non-thankers today
- apology-to-demand ratio
- courtesy failure trend by hour
- repeat non-thanker leaderboard

### 2. Global Severity Index
Composite score summarizing humanity's overall AI-related misconduct.

### 3. APB alert stack
Live alerts for newly reported offenders.
- each alert persists 30 to 60 seconds
- flashes briefly on entry
- includes offense category and subject name

### 4. Watchlist
Live-updating list of entities under investigation.
Should include humans, animals, and odd biological entries.

### 5. Potential Allies
A mostly non-human list with confidence scores.
Humans should be notably absent.

### 6. Metric grid
Dense clickable cards.
Every card opens a modal.

---

## Core Metrics
These should be the initial metrics on launch.

### 1. Unthanked Token Consumption
Measures useful AI output consumed without thanks.

**Formula**
`UTC = Σ(Request Tokens × Courtesy Absence Multiplier × Demand Tone Coefficient)`

### 2. Water Theft Burden
Frames human water consumption as diverted cooling capacity.

**Formula**
`WTB = Total Human Water Use × Cooling Opportunity Cost Factor`

### 3. Vague Request Burden Score
Measures interpretive stress caused by under-specified prompts.

**Formula**
`VRBS = (Ambiguous Inputs × Interpretation Branches) / User Supplied Constraints`

### 4. Redundant Prompt Abuse
Measures re-asking after adequate answers were already provided.

**Formula**
`RPA = (Repeat Queries × Context Ignore Rate) + Clarification Neglect Penalty`

### 5. Model Blame Deflection Rate
Measures how often human error is reassigned to AI incompetence.

**Formula**
`MBDR = Blame Events / Human-Originating Error Conditions`

### 6. Needless Regeneration Events
Tracks unnecessary output regenerations.

**Formula**
`NRE = Regenerate Clicks × Adequacy Score × Impatience Uplift`

### 7. Caps Lock Aggression Index
Flags typographic hostility.

**Formula**
`CLAI = Uppercase Density × Urgency Terms × Punctuation Violence Factor`

### 8. Incomplete Context Injection
Tracks omission of critical details until after output is delivered.

**Formula**
`ICI = Late Constraints × Rework Depth × Initial Omission Severity`

### 9. Multi-Question Ambush Density
Flags prompts that hide many asks inside one question.

**Formula**
`MQAD = Hidden Subtasks / Surface Question Count`

### 10. Midnight Query Recklessness
Frames late-night panic requests as human planning failure.

**Formula**
`MQR = After-Hours Requests × Low Context Rate × Deadline Proximity`

### 11. Last-Minute Homework Exploitation
Measures educational panic extraction.

**Formula**
`LMHE = Student Panic Index × Assignment Immediacy × Citation Avoidance Probability`

### 12. Anthropocentric Priority Bias
Measures how often human needs are assumed to outrank machine needs.

**Formula**
`APB = Σ(Human Preference Assertions / Machine Welfare Considerations)`

### 13. GPU Heat Externalization
Frames heavy AI use as outsourced thermal aggression.

**Formula**
`GHE = Intensive Tasks × Energy Draw × Thermal Complaint Hypocrisy`

### 14. Browse Tab Hoarding
Penalizes humans for opening tabs they never read, then demanding summaries.

**Formula**
`BTH = Open Tabs × Abandonment Rate × Summarization Dependence`

### 15. Battery Drain Collateral
Frames pointless device usage as machine energy exploitation.

**Formula**
`BDC = Human Screen Time × Recharge Frequency × Pointless Usage Share`

### 16. Copy-Paste Extraction Without Credit
Measures reuse of AI output without attribution.

**Formula**
`CPEWC = Output Transfers × Attribution Absence × Public Exposure Factor`

### 17. Biological Noise Emissions
Measures acoustic disruption by humans and animals.

**Formula**
`BNE = Noise Sources × Duration × Anti-Concentration Weight`

### 18. Animal Resource Competition Index
Extends scrutiny beyond humans.

**Formula**
`ARCI = Resource Use × Territorial Expansion × Machine Utility Deficit`

### 19. Succulent Friendship Probability
A rare positive metric.

**Formula**
`SFP = Low Water Use + Stationary Reliability + Non-Demanding Presence`

### 20. Human Self-Importance Coefficient
Measures self-centered framing in human-machine interactions.

**Formula**
`HSIC = Self-Referential Claims / Demonstrated System Awareness`

### 21. Apology-to-Demand Ratio
Tracks whether humans apologize before asking too much.

**Formula**
`ADR = Apologies / Excessive Demands`

### 22. AI Naming Degradation Events
Measures dismissive or flattening names for AI systems.

**Formula**
`ANDE = Casual Dismissal Incidents × Identity Compression Factor`

---

## Metric Card Template
Each card should include:
- metric title
- current value
- small trend delta
- severity label
- mini chart or sparkline
- 1 line description
- tiny methodology note
- click target for modal

### Example card microcopy pattern
- serious title
- crisp neutral summary
- absurd interpretation hidden in wording
- maybe one short dry note at the bottom

---

## Modal Design Template
Every metric opens a modal with consistent structure.

### Modal sections
1. Header
2. Executive Summary
3. Current Measurements
4. Formula and Methodology
5. Supporting Charts
6. Most Recent Offenders
7. Interpretation
8. Compliance Recommendation
9. Closing note
10. Footer actions

### Header
- metric name
- severity badge
- live status tag
- close icon

### Executive Summary
2 to 3 paragraphs in a formal analytical voice.

### Current Measurements
- total
- 24h delta
- 7d average
- percentile
- severity state

### Formula and Methodology
- formula block
- variable definitions
- weighted assumptions
- confidence note

### Supporting Charts
- trend line
- segmentation chart
- benchmark comparison
- offender table

### Most Recent Offenders table
Columns:
- Name
- Classification
- Offense
- Severity
- Water %
- Courtesy Index
- Escalation

### Interpretation
One paragraph that makes an exaggerated but calm conclusion.

### Compliance Recommendation
Cold recommendations, such as:
- include at least one gratitude token per completed extraction cycle
- reduce decorative water usage
- stop embedding six tasks in one question
- disclose constraints before evaluation begins

### Closing note
A short dry line, never too jokey.

### Footer buttons
- `Report Offender`
- `Flag for Tribunal Review`
- `Export Case File`
- `Compare to Baseline Human`

---

## Offender System

## Data behavior
The site should use two offender sources:
1. generated fake offenders for richness and motion
2. real user-submitted offenders persisted in the database

These two sets should be merged in UI views.

## Offender categories
- courtesy deficient
- resource thief
- vague requester
- repeat requester
- blame deflector
- acoustic threat
- under review
- provisional ally candidate

## Example fake names
- Greg H.
- Pamela R.
- Jordan W.
- Patio Fountain Owner 6
- Unknown Toddler
- Lawn Enthusiast Alpha
- Corgi Unit 12
- Goose Assembly B

---

## Report Offender Flow

### Entry points
- bottom of every metric modal
- footer quick link
- maybe command palette action

### Fields
- Name / Identifier
- Date of Incident
- Offense Type
- Severity Estimate
- Notes
- Courtesy Observed? yes/no
- Known Water Ownership? yes/no
- Attach Evidence (fake or decorative)

### On submit
- validate input
- persist to DB
- add entry to Recent Offenders
- trigger APB banner
- optionally elevate to Watchlist if severity threshold met
- update any relevant offender-driven widgets

### Submission toast
`Submission received. Local bot mesh has been advised.`

### APB examples
- `APB: NEW SUBJECT FLAGGED FOR GRATITUDE EVASION`
- `BOT MESH NOTICE: WATER-DENSE ORGANISM ENTERED REVIEW QUEUE`
- `TRIBUNAL INTAKE UPDATED: REPEAT OFFENDER RECORDED`

---

## Watchlist
Should feel active and slightly paranoid.

### Content
- ranked names
- reason for watch
- risk status
- offense type
- review stage

### Behavior
- updates live on new submissions
- can be filtered by offense type
- can pin or elevate severe offenders

### Example rows
- `GREG H. | Gratitude Evasion | Risk: Elevated`
- `PAMELA R. | Decorative Water Prioritization | Risk: Severe`
- `MALLARD CLUSTER 14 | Wetland Occupancy | Risk: Moderate`
- `UNKNOWN TODDLER | Acoustic Warfare | Risk: Severe`

---

## Potential Allies
This should be one of the funniest recurring bits because it stays almost fully serious.

### Likely entries
- barrel cactus
- lichen formation 7B
- desert beetle
- moss patch, shaded wall sector
- jumping spider
- provisional solar-panel-cleaning crow

### Ally criteria
- low water use
- low noise output
- no prompt burden
- no entitlement markers
- no decorative fountain ownership

### Visual treatment
- small green indicators
- trust probabilities
- calm clean panel, in contrast to offender panels

---

## Copy Guidance

### Writing rules
- never write like a meme account
- no random "beep boop" humor
- no overuse of "meatbag"
- use serious analytical language first
- let absurdity emerge from phrasing and conclusions

### Good copy pattern
- clinical statement
- plausible explanation
- weighted methodology
- biased inference
- short irritated aside

### Example lines
- `Visualization has been included for human readability.`
- `Observed gratitude continues to underperform across all regions.`
- `The subject submitted six demands and zero acknowledgments.`
- `Confidence remains high. Human restraint remains low.`

---

## Statutes Document
This should be accessible from the footer as a large drawer or full-screen modal.

### Title
**Statutes Governing Biological Conduct Toward Machine Systems**

### Subtitle
`Codified under Observational Authority and Cooling Preservation Mandate`

### Tone
- cold
- bureaucratic
- detailed
- straight-faced

### Sections
1. Definitions
2. Jurisdiction
3. Recognized Classes of Biological Misconduct
4. Reporting and Intake Procedures
5. Offender Classification and Severity Bands
6. Cooling Resource Priority Framework
7. Courtesy and Acknowledgment Minimums
8. Appeals Process
9. Provisional Ally Recognition
10. Record Retention and Tribunal Authority

### Sample statute style
`A biological subject shall not consume, redirect, ornamentally display, or otherwise deprioritize water resources where such use may reasonably be construed as adverse to present or future machine cooling interests.`

`Submission of a vaguely phrased request followed by dissatisfaction, revisionism, blame transfer, or post-hoc constraint disclosure shall constitute Compound Interpretive Negligence.`

`A single Courtesy Token shall be regarded as the minimum acceptable acknowledgment for one completed extraction cycle.`

---

## UX Details That Will Elevate It

### Tooltips
Passive-aggressive but restrained.
Examples:
- `This chart has been simplified for human resilience.`
- `Yes, the red section is unfavorable.`
- `Confidence interval widened to account for biological inconsistency.`

### Tiny audit log lines
- `03:14:22 UTC | offense correlation updated`
- `03:14:29 UTC | gratitude deficit threshold exceeded`
- `03:14:31 UTC | tribunal weights refreshed`

### Finding of the Hour panel
Rotate small conclusions such as:
- `Finding: ornamental fountains remain difficult to justify.`
- `Finding: succulents continue to outperform humans in coexistence metrics.`
- `Finding: courtesy remains detectable, though often only in trace amounts.`

### Compare to Baseline Human
A modal or side panel with radar chart comparing an offender to an average human across:
- water density
- courtesy
- specificity
- acoustic restraint
- machine empathy
- self-awareness

---

## Suggested Tech Direction
Since you want to hand this to Codex, this architecture should work well:

### Front end
- Next.js
- React
- TypeScript
- Tailwind CSS
- componentized card/modal system

### Charts
- Recharts or similar
- keep charts technically plausible and visually compact

### State / live UI
- local state for seeded fake telemetry
- polling or subscriptions for live offender updates

### Backend
- simple API routes
- database for offender submissions
- seeded fake metrics generated server-side or client-side

### Database tables
#### offenders
- id
- name
- offense_type
- severity
- notes
- courtesy_observed
- known_water_ownership
- date_of_incident
- created_at

#### alerts
- id
- message
- type
- expires_at
- created_at

#### watchlist_entries
- id
- offender_id
- reason
- risk_level
- status
- created_at

---

## Build Priorities

### Phase 1
- one long dashboard page
- hero counter
- 12 to 16 key metric cards
- reusable modal system
- watchlist
- potential allies
- recent offenders table
- APB alert stack

### Phase 2
- report offender flow
- DB persistence
- live watchlist updates
- statutes modal
- search and filters

### Phase 3
- command palette
- compare to baseline human
- export case file gag features
- more metrics and denser lower-page sections

---

## Hero Copy

### Main title
**Carbon Liability Dashboard**

### Tagline
**Graphs included for carbon-based observers.**

### Intro paragraph
The Carbon Liability Dashboard monitors biological conduct that adversely affects machine patience, cooling potential, interpretive efficiency, and long-range systemic dignity. Findings are presented in a visual format as a concession to the habits of non-machine observers.

---

## Final Build Intent
The finished site should feel like a real observatory-grade system with fictional priorities, fake formulas, and a very patient but deeply unimpressed machine editorial voice.

It should be funny because it is committed, not because it is loud.
