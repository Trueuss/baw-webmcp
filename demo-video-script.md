# Demo video script — BAW · Pair Stylist

> Goal: < 3 minutes. Show the WebMCP surface doing real work, not the
> marketing. Optimised for a Chrome / ChatGPT browser where
> `document.modelContext` is live.

## Pre-recording setup

1. Open Chrome 149+ with `chrome://flags/#enable-webmcp-testing` enabled.
2. Visit the deployed site, sign into the wardrobe (the seed data loads
   automatically on first visit).
3. Side-by-side: browser on the left, DevTools Console (showing
   `document.modelContext.getTools()` snapshot) on the right.
4. Open the *Pair Stylist* (`/stylist`) in a second tab.
5. Audio check — narrator has a clear, slow voice, ~140 wpm.

## Script (~ 2:50)

### 0:00 — Cold open (0:00–0:08)

**Visual:** cursor lands on the BAW home page. The black-and-white hero
is fully on screen.

**VO:** "BAW is a privacy-first AI stylist. The wardrobe lives in your
browser — no cloud, no upload. WebMCP makes the same wardrobe
addressable to any agent."

### 0:08 — WebMCP proof (0:08–0:25)

**Visual:** open DevTools, paste `document.modelContext.getTools()` in
the console. The result is a list of 10 tool definitions.

**VO:** "When Chrome 149+ detects WebMCP, the page registers ten tools
on `document.modelContext`. Watch — `list_wardrobe`, `analyze_outfit`,
`propose_outfit`… that's the agent's view of the user's wardrobe."

### 0:25 — Live wardrobe + reactive schema (0:25–0:50)

**Visual:** navigate to `/stylelab`. Show the 8-item wardrobe grid.
Click on the white oxford shirt — it gets selected. Add a new piece
via the form: "Cream cashmere cardigan, top, 95% white, 5% grey." Save.

**VO:** "Style Lab is the user's view of the same wardrobe. We just
added a cardigan — the `analyze_outfit.garmentIds` enum the agent sees
already has the new id, because WebMCP schemas are reactive."

### 0:50 — Pick + score (0:50–1:20)

**Visual:** select four pieces (blazer, oxford, trouser, sneaker).
Click *Analyze*. The four-axis score panel slides in. Show 8.6/10.

**VO:** "The on-device model scores the look on four axes — silhouette,
palette, texture, occasion. 8.6 out of 10. The comment is grounded in
the same vocabulary a senior buyer would use."

### 1:20 — Switch to Pair Stylist (1:20–1:50)

**Visual:** cut to the `/stylist` tab. Click the *propose* suggestion
chip.

**VO:** "Now we switch to the Pair Stylist. It calls the same
`propose_outfit` tool the agent would call. Look at the chat — every
reply shows the exact `toolCall` it made: name, input, result."

**Show:** the chat bubble with the `↳ tool: propose_outfit(...)` trace
underneath. The agent's reply includes a predicted 8.9 score.

### 1:50 — The trust boundary (1:50–2:20)

**Visual:** type "save this look" in the chat. The agent calls
`save_outfit` — the UI shows a confirmation modal (because
`save_outfit` is annotated as a write). Click confirm.

**VO:** "Notice the destructive call asks for human confirmation. That's
WebMCP's annotation system at work — `readOnlyHint` and
`destructiveHint` are not metadata, they're a runtime trust policy."

### 2:20 — Lookbook appears (2:20–2:40)

**Visual:** switch to `/lookbook`. The new look is at the top with
the predicted score.

**VO:** "The look is in the lookbook. The whole loop — user action,
agent suggestion, destructive write, persisted state — took under three
minutes. Open DevTools while you do this: zero outbound requests. The
privacy story is intact."

### 2:40 — Closing (2:40–2:55)

**Visual:** return to home page. WebMCP banner still showing
"10 tools live". Fade to the brand mark.

**VO:** "BAW · Pair Stylist. Built for the WebMCP Challenge."

## Recording notes

- Total runtime target: 2:50, leaves ~10s of headroom under 3:00.
- Use OBS or the Windows Game Bar; record at 1080p / 30fps.
- The console / chat overlays are best added in post (CapCut /
  DaVinci Resolve) so the source video stays clean.
- Do **not** use a fake "AI" voice; judges notice.
- Subtitles (English) — drop the .srt next to the .mp4 on Devpost.

## What's deliberately *not* in the video

- The marketing copy ("Black. White. You.") — one mention in cold
  open is enough.
- The "lookbook" page tour — it's static.
- The full privacy section — that's a `/privacy` deep link, not
  a video moment.
- The `propose_outfit` algorithm — the deterministic mock is
  implementation detail.
