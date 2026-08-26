# Devpost submission draft

> The text below is the submission for *The WebMCP Challenge*. Copy it into
> the Devpost form when you submit. Adjust screenshots / video URL /
> credentials at the bottom.

---

## Project name

**BAW · Pair Stylist**

## Tagline (1 line)

A privacy-first AI stylist that lives in your browser — now with WebMCP
tools so any agent can collaborate with you on dressing better.

---

## Project description (long form, ~600 words)

### Why this use case is a strong fit for WebMCP

Wardrobes are deeply personal: they encode taste, body, climate, occasion,
mood, and budget. Existing AI stylists either scrape the user into a cloud
account or pretend the wardrobe doesn't exist. WebMCP is the rare standard
that lets the wardrobe stay *exactly* where it belongs — in the user's
browser — and still be addressable from the agent.

The fit is structural, not cosmetic:

- **Locality.** A wardrobe is private data. WebMCP's
  `document.modelContext` lives in the same tab as the wardrobe, so the
  agent calls `list_wardrobe` against local state and gets the result
  without a copy. This is the only architecture where the stylist and
  the user's privacy principle can both be true.
- **Schema volatility.** A wardrobe's "valid input enum" changes every
  time you add or remove a piece. WebMCP's reactive `inputSchema` is
  the cleanest expression of that fact — `analyze_outfit.garmentIds`
  rebuilds from the live store, so the agent literally cannot
  hallucinate a garment that isn't currently in the wardrobe.
- **Read + write mix.** Scoring is read-only; adding a piece, removing
  one, or saving a look is destructive. WebMCP's `readOnlyHint`,
  `destructiveHint`, and `idempotentHint` annotations let the browser
  draw a clear trust boundary in the UI — every write asks the user,
  every read is silent.
- **Composable agency.** A single wardrobe should be open to many
  agents (a stylist, a calendar, a travel app). WebMCP's `getTools()`
  is the discovery surface; `toolchange` is the event bus; `exposedTo`
  is the future cross-origin trust grant. We use the first two and
  demonstrate the pattern.

### How it creates a better user experience

Before WebMCP, the user's flow was: open the app, drag photos in, wait
for the model, read the score, ignore or accept. The "or accept" branch
was the worst — the user had to translate the score into an action
themselves.

With WebMCP, three things change:

- The agent suggests the *next* step. "Add a black merino turtleneck?
  It's the missing piece in three of your 9+ scores." It calls
  `propose_outfit` with `occasion: 'business-casual'`, the model returns
  a 7.8 prediction, and the user can accept or reject in one click.
- The agent is *contextual*. It sees the same wardrobe state the user
  is editing, so its suggestions stay grounded. Add a cream wool
  cardigan, and the next `propose_outfit` call returns a different set.
- The agent is *transparent*. Every reply in the Pair Stylist shows the
  exact `toolCall` it made — name, input, result shape. The user always
  knows what just happened to their data.

### What people and agents can do together that was difficult or impossible before

The headline interaction: **a human and an agent co-curate a wardrobe
in real time, on the same page, with the same source of truth, in
under three minutes.**

1. The human opens Style Lab, picks the blazer, shirt, trouser and
   white sneaker. The four-axis score is 8.6.
2. The agent (in the same tab, via Pair Stylist) sees that selection
   and proposes a different combination — same blazer, swap the white
   oxford for the black merino turtleneck, keep everything else.
   Predicted score: 8.9.
3. The agent then asks the destructive question: "Save this as a
   look?" It calls `save_outfit`. The UI asks the human to confirm
   (because `save_outfit` is a write, and the user is the human in
   the loop). One click, the look is in the lookbook.

The hard part — *synchronising the agent's view of the wardrobe with
the user's* — is what WebMCP's reactive schema solves. Without it, the
agent would either need a long-lived sync protocol (round trips,
stale state) or a copy of the wardrobe (privacy violation). With it,
the same `document.modelContext` instance is the source of truth for
both.

### How we implemented WebMCP

We register **ten imperative tools** with
`document.modelContext.registerTool`, each with a description written
for an agent, a JSON Schema input, and the right annotation:

| # | Tool | Annotation |
| --- | --- | --- |
| 1 | `list_wardrobe` | `readOnlyHint` |
| 2 | `get_garment` | `readOnlyHint` |
| 3 | `add_garment` | write |
| 4 | `remove_garment` | `destructiveHint`, `idempotentHint` |
| 5 | `analyze_outfit` | `readOnlyHint`, **reactive `garmentIds` enum** |
| 6 | `propose_outfit` | `readOnlyHint` |
| 7 | `save_outfit` | write |
| 8 | `list_history` | `readOnlyHint` |
| 9 | `get_session_state` | `readOnlyHint` |
| 10 | `compare_outfits` | `readOnlyHint` |

The provider is a single `useEffect` that registers once on mount and
tears down via `AbortSignal` (`controller.abort()`) on unmount. A local
event bus (`lib/webmcp/bus.ts`) mirrors the native `toolchange` event so
any component can react when a tool's schema changes — e.g. when the
user adds a garment, the Pair Stylist's `propose_outfit` schema updates
immediately, with no agent round trip.

The wardrobe and history are Zustand stores with `localStorage`
persistence; no images ever leave the device. The four-axis scoring
engine is a deterministic mock of a 1.3B vision-language model that
would run in WebGPU + WASM in production — same surface, same data,
same privacy story.

We do **not** use a polyfill. The demo runs against the real Chrome
149+ `document.modelContext` and the ChatGPT in-app browser. The site
has a live banner that reads `document.modelContext.getTools()` and
tells the visitor how many tools are currently registered.

---

## Submission form fields

- **Live URL:** `https://baw-webmcp.vercel.app` *(set after Vercel deploy)*
- **GitHub URL:** `https://github.com/Trueus/baw-webmcp` *(set after push)*
- **Try-instructions credentials:** *(none — the demo works without login)*
- **Built with:** Next.js 15, React 19, TypeScript, Tailwind 3, Zustand
- **Categories:** Web, AI, Developer Tools, Privacy
