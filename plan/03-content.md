# 03 — Phase 1: write the seed lessons

Goal: 33 lesson files exist (3 come with the starter, you write 30), `npm run seed` loads them all, and every lesson follows the template.

## How a lesson file works

- Location: `server/src/seed/lessons/<game slug>/<NN>-<lesson slug>.md`
- `<game slug>` is one of `fps-fundamentals`, `valorant`, `cs2`, `fighting-fundamentals` (defined in `server/src/seed/games.js`).
- `NN` is the two-digit number from the tables below. It becomes the lesson's `order`. `<lesson slug>` becomes its `slug`.
- The file starts with a line `---`, then **one JSON object**, then a line `---`, then the Markdown body.
- The JSON object has exactly these keys: `section`, `title`, `summary`, `difficulty`, `skill`, `demo`, `drills`.
  - `section`: the section title exactly as in the tables (it must match `games.js` character for character, including `&`).
  - `summary`: one sentence, at most 200 characters, says what the reader will be able to do. Search only looks at titles and summaries and matches exact letters, so put the plain word a player would type into the summary (the "Counter-Strafing" lesson's summary contains "strafe" for that reason).
  - `difficulty`: `beginner`, `intermediate` or `advanced`.
  - `skill`: `precision`, `recoil`, `movement`, `decision`, `setup` or `mental`.
  - `demo`: `""` unless the table names one.
  - `drills`: array of `{ "name", "tool", "minutes" }`. `tool` is exactly one of `"Aimlabs"`, `"KovaaK's"`, `"In-game"`, `"Game Sense"`. Use the drills given in the table; if the table says "none", use `[]`.
- JSON rules that people get wrong: double quotes only, no trailing commas, no comments.

**Before writing anything, read the three finished lessons.** They are the standard for length, tone and structure:

- `server/src/seed/lessons/fps-fundamentals/04-crosshair-placement.md`
- `server/src/seed/lessons/fps-fundamentals/09-counter-strafing.md`
- `server/src/seed/lessons/cs2/04-practice-config.md` (shows code blocks and tables)

## The body template

Every body has exactly these four `##` headings, in this order:

```
## Why it matters
(2 short paragraphs: the problem this solves and what improves)

## How to do it
(a numbered list of 3 to 6 concrete steps; bold the key phrase of each step)

## Common mistakes
(a bullet list of 3 to 5 mistakes)

## Practice
(1 paragraph: one specific exercise the reader can do today)
```

Writing rules:

1. 250 to 400 words per body. Short sentences. Second person ("you"). No filler, no hype, no emoji.
2. Cover **every** key point listed for the lesson. You may add connecting explanation, but no new factual claims beyond the key points and general common sense.
3. No invented numbers. Use only numbers that appear in the key points.
4. Keyboard keys are written as inline code starting with `key:`, for example `` `key:A` ``, `` `key:Shift` ``, `` `key:Mouse1` ``.
5. Console commands and settings go in fenced code blocks (three backticks, no language name). Only use commands that appear in the key points.
6. A Markdown table is welcome where the key points compare things.
7. Do not mention any tool, website or product that the key points do not mention. Do not add links.
8. If `demo` is set, end the Practice paragraph by pointing at "the demo below". If the lesson relates to a tool page, name the tool in plain text (for example "the Sensitivity Converter in the Tools menu"); do not write a link.

## Track 1 — `fps-fundamentals` (19 lessons, you write 17)

### Section "Hardware & Setup"

**01-dpi-sensitivity-edpi.md** — title "DPI, Sensitivity and eDPI" · beginner · setup · drills: none
- DPI is how many counts the mouse reports per inch of movement; sensitivity is the in-game multiplier.
- eDPI = DPI × sensitivity. It lets you compare settings **within one game** only.
- cm/360 (centimetres of mouse travel for a full turn) is the measure that compares across games.
- Lower sensitivity gives finer control with the arm; most tactical-shooter players land between roughly 20 and 50 cm/360. Fast movement shooters often use less distance.
- Pick one sensitivity and keep it for at least two weeks; changing it every day resets muscle memory.
- Turn off mouse acceleration ("Enhance pointer precision" in Windows).
- Point to the Sensitivity Converter in the Tools menu.

**02-refresh-rate-and-polling-rate.md** — title "Refresh Rate and Polling Rate" · beginner · setup · drills: none
- Refresh rate (Hz) is how many times per second the monitor draws; more Hz means you see movement sooner and smoother.
- A high-refresh monitor only helps if it is actually enabled in the operating system's display settings and the game's FPS is at or above it.
- Polling rate is how often the mouse reports its position; 1000 Hz is the common standard and is enough.
- Stable FPS matters more than peak FPS: lower graphics settings until the frame rate stops dipping in fights.
- Use fullscreen mode and close background programs to reduce input delay.
- Table to include: setting → what to check (monitor Hz in OS, in-game FPS cap, mouse polling rate, fullscreen).

**03-posture-and-grip.md** — title "Posture, Grip and Desk Setup" · beginner · setup · drills: none
- Sit so your forearm rests on the desk and your elbow is near a right angle; shoulders relaxed.
- Monitor at arm's length, top of the screen near eye level.
- Three common grips: palm (whole hand on mouse, stable), claw (arched fingers, quick clicks), fingertip (only fingertips, most agile, least stable). None is "correct"; consistency matters.
- Aim with the arm for large movements and the wrist/fingers for small corrections.
- Mouse pad large enough for a full 180° turn at your sensitivity without lifting.
- Take a short break every hour; pain is a signal to stop, not to push through.

### Section "Micro-Mechanics"

**04-crosshair-placement.md** — given in the starter.

**05-flicking-and-tracking.md** — title "Flicking vs Tracking" · beginner · precision · demo `aim-trainer` · drills: `Gridshot` (Aimlabs, 5), `Strafetrack` (Aimlabs, 5)
- Flicking: a fast move from where the crosshair is to the target, then click. Used against targets that appear suddenly.
- Tracking: keeping the crosshair on a moving target continuously. Used with automatic fire and in movement-heavy games.
- A good flick has three parts: fast move, small correction, click. Clicking before the correction is the usual miss.
- For tracking, match the target's speed smoothly instead of chasing it in jerks; stay relaxed.
- Train accuracy first, speed second: slow down until you hit about 90%, then speed up.
- Tactical shooters reward flicking and crosshair placement; arena and battle-royale shooters reward tracking more.

**06-micro-adjustments.md** — title "Micro-Adjustments" · intermediate · precision · drills: `Microshot` (Aimlabs, 5), `1wall6targets TE` (KovaaK's, 5)
- A micro-adjustment is a correction of a few pixels after your crosshair placement got you close.
- They come from the wrist and fingers, not the arm.
- Stop the crosshair before you click; clicking while the mouse is still moving is the commonest cause of a near miss.
- If your first shot misses, adjust and shoot again rather than spraying and hoping.
- Tension ruins small movements: loosen your grip.
- Good crosshair placement turns most fights into micro-adjustments.

**07-recoil-control.md** — title "Recoil Control" · intermediate · recoil · drills: `Spray one magazine at a wall, then pull against the pattern` (In-game, 10)
- Automatic weapons kick: first mostly upwards, then side to side.
- Controlling recoil means moving the mouse in the opposite direction of the kick: pull down first, then counter the sideways drift.
- The first few bullets are the most accurate and the most predictable; learn those before the whole magazine.
- Every weapon has its own pattern; learn the one or two you use most.
- Distance decides the method: close range spray, medium range burst, long range tap.
- Practise against a wall so you can see the bullet marks and compare them to where you aimed.

**08-tapping-bursting-spraying.md** — title "Tapping, Bursting and Spraying" · beginner · recoil · drills: `Tap, burst and spray at three distances` (In-game, 10)
- Tapping: single shots with a pause, for long range.
- Bursting: 2 to 4 bullets, pause, repeat, for medium range.
- Spraying: holding the trigger, for close range or when several enemies are close together.
- Table to include: method → distance → what you must control.
- The pause lets accuracy reset; shooting again too early wastes the next bullets.
- Choosing the wrong method for the distance loses more fights than bad aim does.

**09-counter-strafing.md** — given in the starter.

**10-peeking-techniques.md** — title "Jiggle, Wide and Shoulder Peeks" · intermediate · movement · drills: `Jiggle-peek a corner 20 times without over-exposing` (In-game, 5)
- Jiggle peek: step out and straight back with `key:A` / `key:D` to gather information or bait a shot without committing.
- Shoulder peek: show only your shoulder to make a sniper shoot, then peek properly while they recover.
- Wide peek: swing far out fast so an enemy holding a tight angle has to move their crosshair a long way.
- Peek with a purpose: information, baiting a shot, or taking the fight. Decide before you move.
- Pre-aim the spot before peeking and stop (counter-strafe) before shooting.
- Never re-peek the same angle the same way twice in a row.

**11-advanced-movement.md** — title "Bunny Hopping and Slide Cancelling" · advanced · movement · drills: `Chain ten jumps without losing speed` (In-game, 10)
- These are game-specific techniques that keep or build speed beyond normal running; they do not exist in every game and are often changed by updates.
- Bunny hopping: jumping again at the moment you land while turning in the air (air-strafing with `key:A` / `key:D` and matching mouse movement), so friction never slows you.
- Slide cancelling: starting a slide and interrupting it early to keep momentum and recover faster. Found in some movement shooters.
- Say clearly: check whether the technique currently works in your game before investing hours.
- Movement tech is for repositioning and for being a harder target, not for shooting while flying; accuracy rules still apply.
- Learn it only after the fundamentals; it wins far fewer rounds than crosshair placement.

### Section "Macro & Game Sense"

**12-map-awareness.md** — title "Map Awareness" · beginner · decision · drills: `Play one match calling every enemy position you learn out loud` (In-game, 30)
- Map awareness is always knowing where enemies could be, where they have been seen, and where your teammates are.
- Learn the callouts (the shared names of places) so information is useful to others.
- Glance at the minimap every few seconds, and always after a kill or a death appears in the feed.
- Sound is information: footsteps, reloads and ability sounds tell you position without seeing anyone.
- Count: if four enemies are seen on one side, the other side has at most one.
- Point to the Lineup Maps tool as a place to practise reading callouts.

**13-angle-advantage.md** — title "Angle Advantage and Peeker's Advantage" · intermediate · decision · demo `peek-advantage` · drills: none
- Around a corner, the player standing **farther** from the corner sees the opponent's shoulder before their own eyes are exposed.
- So: hold angles from distance, and do not hug the wall you are peeking around.
- Peeker's advantage is a network effect: the peeker's movement reaches the defender's screen slightly late, so the peeker sees the defender first by a fraction of a second.
- The two effects combine: a peeker who is far from the corner and moving fast is very hard to hold.
- As a defender, counter it with an off-angle (an unexpected position), by holding from farther back, or with a crossfire.
- End Practice by telling the reader to move the sliders in the demo below and find the distance where the advantage flips.

**14-positioning.md** — title "Positioning" · intermediate · decision · drills: none
- Good positions give cover, an escape route and a teammate who can help. If a spot has none of the three, leave.
- Fight one enemy at a time: use walls so only one opponent can see you (isolating angles).
- Change position after a kill or after being seen; the enemy now knows where you are.
- Height and distance should fit your weapon.
- Crossfire: two teammates watching the same area from different angles, so the enemy cannot face both.
- Do not stand in the open while rotating; move from cover to cover.

**15-utility-timing.md** — title "Utility Timing" · advanced · decision · drills: none
- Utility means grenades and abilities that block vision, blind, damage an area or reveal enemies.
- Utility used with a teammate's push is worth far more than utility used alone: call it, then count down.
- A flash is only good if a teammate moves on it within about a second of it popping.
- Smokes buy time and cut sightlines; they do not kill. Decide which sightline hurts you most and block that one.
- Save some utility for after the objective is taken or for the retake; using everything in the first ten seconds is a common mistake.
- Table to include: utility type → what it is for → when to use it.

**16-trade-fragging.md** — title "Trade Fragging" · intermediate · decision · drills: none
- A trade is killing the enemy who just killed your teammate, while that enemy is still exposed and focused.
- To be tradable, the first player must be followed closely: about one to two seconds behind.
- The second player watches the first player's fight, not a different angle.
- A one-for-one trade usually favours the attacking side because it opens space.
- Do not go in alone ("dry peek") when a teammate is two seconds away; wait and go together.
- When you are the entry, your job is to create space and information; dying while your teammate trades is a success.

### Section "Mental & VOD Review"

**17-vod-review.md** — title "Reviewing Your Own Games" · intermediate · mental · drills: `Review one lost match and write down three repeated mistakes` (In-game, 30)
- VOD review means watching a recording of your own match to find mistakes you cannot notice while playing.
- Review losses, and review them the next day, not while still annoyed.
- Pause at every death and ask three questions: what did I know, what did I do, what would have been better?
- Look for patterns that repeat, not one-off bad luck. One repeated mistake fixed is worth more than twenty noted.
- Sort each death: aim, movement, positioning, or decision.
- Pick **one** thing to work on in the next session.

**18-managing-tilt.md** — title "Managing Tilt" · beginner · mental · drills: none
- Tilt is frustration that makes you play worse, which causes more frustration.
- Signs: blaming teammates, forcing fights, shooting earlier than usual, gripping the mouse hard.
- Reset between rounds: breathe out slowly, relax your hands, name one thing to do next round.
- Set a stop rule before you start, for example: two losses in a row means a 15-minute break.
- Judge the decision, not the result: a good play can still lose.
- Mute players who distract you; you do not owe anyone an argument.

**19-communication.md** — title "Clean Communication" · beginner · mental · drills: none
- A good call is short and complete: how many, where, what they are doing. Example format: "Two, A Main, pushing."
- Give information, not emotion or blame.
- Use the map's callouts, not "over there" or "behind the thing".
- Stay quiet when a teammate is the last one alive unless they ask; they need to hear the game.
- Say what you are going to do before you do it ("flashing A in three").
- After the round, one sentence about the next round is enough.

## Track 2 — `valorant` (5 lessons)

Reminder: principles only. Do not state damage numbers, prices, ability names, cooldowns or agent names.

### Section "Gunplay"

**01-phantom-vs-vandal.md** — title "Phantom or Vandal" · beginner · recoil · drills: `Play five rounds with each rifle in the practice range` (In-game, 15)
- The two main rifles trade off differently: the Vandal kills with one headshot at any range; the Phantom has a faster fire rate, a silencer that hides bullet tracers, and loses damage at long range.
- The Phantom is more forgiving when spraying at close and medium range and when shooting through smoke.
- The Vandal rewards precise first shots and long sightlines.
- Table to include: rifle → strength → best for.
- Pick one and stay with it for a few weeks; consistency beats switching.
- The fundamentals (crosshair placement, stopping before shooting) matter more than the choice.

**02-movement-error.md** — title "Movement Error and First-Shot Accuracy" · intermediate · movement · demo `counter-strafe` · drills: `Strafe, stop, one tap` (In-game, 10)
- Shooting while running or jumping makes rifle bullets inaccurate; this is called movement error.
- Stop completely before you shoot. Releasing the key stops you quickly; tapping the opposite key makes it more reliable.
- Walking with `key:Shift` is quiet but still less accurate than standing.
- Crouching mid-spray lowers recoil but makes you an easier target if you stay there.
- The first bullet from a standing rifle is very accurate: take single taps at long range.

### Section "Agents & Utility"

**03-agent-roles.md** — title "Agent Roles" · beginner · decision · drills: none
- Four roles: Duelists create space and take first fights; Initiators gather information and set up pushes; Controllers block vision with smokes; Sentinels lock down areas and watch flanks.
- Table to include: role → job → asks from teammates.
- A balanced team usually has smokes and at least one source of information.
- Play one or two agents until their abilities are automatic; then your attention is free for the round.
- Your role tells you where to be: a Duelist at the back of a push is not doing the job.

**04-lineups-and-executes.md** — title "Lineups and Site Executes" · intermediate · decision · drills: `Learn one lineup for your main map until it lands five times in a row` (In-game, 15)
- A lineup is a fixed standing spot and aim point that sends an ability to the same place every time.
- An execute is a planned site take: smokes block the defenders' sightlines, flashes or information abilities go in, then the team enters together.
- Order matters: vision blockers first, then blinds, then people.
- Learn one lineup that matters (for example post-plant) before collecting dozens.
- Point to the Lineup Maps tool to see how a lineup is recorded: where you stand, where it lands, the steps.

**05-flanks-and-lurking.md** — title "Flanks and Lurking" · advanced · decision · drills: none
- A lurker plays away from the team to catch rotating defenders or attack from behind.
- Timing is everything: arrive when the enemy's attention is on your team, not before.
- A lurk that gets no kill and no information means the team fought four against five for nothing.
- Listen for rotations and tell your team what you hear.
- As a defender, expect the flank: someone, or a sentinel ability, should watch behind.
- Do not lurk every round; it works because it is unexpected.

## Track 3 — `cs2` (5 lessons, you write 4)

Only use console commands that appear in the key points or in the given `04-practice-config.md`.

### Section "Weapons & Spray"

**01-rifle-spray-control.md** — title "AK-47 and M4 Spray Control" · intermediate · recoil · drills: `Spray ten magazines at a wall from ten metres` (In-game, 15)
- Both rifles kick upwards for the first bullets, then swing sideways.
- Pull down smoothly for the first part of the spray, then counter the sideways swing in the opposite direction.
- Learn the first ten bullets first; most fights are over by then.
- The AK-47 can kill with one headshot, even against a helmet, so tapping and short bursts are very strong with it.
- Use the practice setup from the "Practice Server Commands" lesson so bullet impacts are visible.
- Stand still when you spray; movement adds inaccuracy on top of recoil.

### Section "Utility"

**02-grenade-basics.md** — title "Smokes, Flashes, Molotovs and HE" · beginner · decision · drills: none
- Four grenade types: smoke blocks vision for a while; flashbang blinds anyone looking at it; molotov/incendiary denies an area with fire; HE grenade does damage.
- You can carry up to four grenades, only one of each type except flashbangs (two).
- Table to include: grenade → what it does → typical use.
- A smoke also puts out fire.
- Buy utility before upgrading armour or weapons you do not need; a full-buy without grenades is half a buy.
- Throw flashes so they pop out of your own view (around a corner or overhead).

**03-jump-throws-and-lineups.md** — title "Throw Types and Lineups" · intermediate · decision · drills: `Learn one smoke for your favourite map until it lands five times in a row` (In-game, 15)
- Three throws: `key:Mouse1` is a long throw, `key:Mouse2` is a short underhand throw, both together is a medium throw.
- Standing, running and jumping throws travel different distances; a lineup always says which.
- A lineup is: where to stand, what to aim at, which throw.
- Use `sv_grenade_trajectory_prac_pipreview 1` on a practice server to see where the grenade lands.
- Learn the two or three smokes your team needs every round before anything fancy.
- Point to the Lineup Maps tool.

### Section "Config & Practice"

**04-practice-config.md** — given in the starter.

**05-crosshair-settings.md** — title "Crosshair Settings" · beginner · setup · drills: none
- A good crosshair is small enough not to hide a distant head and visible on every background.
- Use a static crosshair (one that does not expand when moving) so its size is always the same.
- Choose a colour that stands out on your maps; bright green and cyan are common.
- The crosshair is set with console commands; include this block as the example:

```
cl_crosshairstyle 4
cl_crosshairsize 2
cl_crosshairthickness 1
cl_crosshairgap -2
cl_crosshairdot 0
cl_crosshair_drawoutline 1
cl_crosshaircolor 1
```

- Point to the Crosshair Generator in the Tools menu, which produces these commands from sliders.
- Do not change it every week; your eyes learn where its centre is.

## Track 4 — `fighting-fundamentals` (4 lessons)

All in section "Core Concepts". Game-agnostic: no character names, no move names.

**01-frame-data.md** — title "Frame Data" · beginner · decision · drills: none
- Fighting games run at 60 frames per second; every move is measured in frames.
- Three phases: startup (before it can hit), active (can hit), recovery (cannot act yet).
- "On block" advantage: plus means you can act first afterwards, minus means the opponent can.
- A move that is very minus on block is "unsafe": the opponent gets a guaranteed hit (a punish).
- Table to include: term → meaning (startup, active, recovery, plus on block, minus on block, punish).
- You do not need to memorise numbers: start by learning which of your moves are safe and which are not.

**02-combos.md** — title "Combos" · beginner · precision · drills: `Land one simple combo ten times in a row on each side` (In-game, 15)
- A combo is a sequence of hits the opponent cannot block once the first one lands.
- Start with one short, reliable combo you can do every time; a dropped long combo does less damage than a finished short one.
- Practise on both sides of the screen; inputs are mirrored.
- Learn to "confirm": check that the first hit landed before committing to the rest.
- Combos only matter after you win the first hit, which is decided by neutral (see the next lesson).

**03-neutral-game.md** — title "The Neutral Game" · intermediate · decision · drills: none
- Neutral is when neither player has the advantage and both are trying to land the first hit.
- Control space with your longest safe moves (pokes) and by walking in and out of range (footsies).
- A whiff punish is hitting the opponent while they recover from a move that missed.
- Simple triangle: attacks beat grabs, grabs beat blocking, blocking beats attacks.
- Jumping is high risk; a prepared opponent hits you out of the air (an anti-air).
- Watch what the opponent does repeatedly, then choose the option that beats it.

**04-blockstrings.md** — title "Blockstrings and Pressure" · advanced · decision · drills: none
- A blockstring is a sequence of attacks made to be blocked, to keep your turn and push the opponent to make a mistake.
- Pressure works by leaving small gaps (frame traps) that catch an opponent who presses a button.
- Mix in a grab when the opponent only blocks.
- End strings with a move that is safe on block, or you hand over the turn and take damage.
- When defending: block patiently, look for the unsafe ending, and do not press buttons in small gaps.

## Steps

1. Read the three given lessons.
2. Write the 30 files, track by track, in table order. After each track, run `npm run seed` (stop the API dev server first). It stops with a clear message naming the file if a header is not valid JSON, a file name is wrong, or a section title does not match.
3. When all are written, `npm run seed` must print `Seeded 4 games, 33 lessons, 1 maps.`
4. Check your own work against this list for **every** file: four headings in the right order; 250–400 words; every key point covered; no number that is not in the key points; `demo` and `drills` exactly as specified; `section` spelled exactly.
5. Run `npm run check`. Commit: `phase 1: seed lessons`.

## Done when

- [ ] 33 `.md` files exist under `server/src/seed/lessons/` (19 + 5 + 5 + 4).
- [ ] `npm run seed` prints `Seeded 4 games, 33 lessons, 1 maps.`
- [ ] `<site address>/api/catalog` lists 33 lessons, and `<site address>/api/lessons/valorant/agent-roles` returns a body with the four headings.
- [ ] `npm run check` passes.
