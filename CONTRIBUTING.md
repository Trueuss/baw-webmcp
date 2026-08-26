# Contributing

BAW · Pair Stylist is a single-developer submission for the
[WebMCP Challenge](https://webmcp.devpost.com/). Issues, PRs and feedback
are welcome on the public repository.

## Local setup

```bash
git clone https://github.com/Trueuss/baw-webmcp.git
cd baw-webmcp
npm install
npm run dev        # http://localhost:3000
```

Node.js 20 or newer is required.

## Verifying WebMCP

The page is WebMCP-only in a real browser. To exercise the tools:

1. Chrome 149+: open `chrome://flags/#enable-webmcp-testing`, enable, restart.
2. Open any BAW page. The WebMCP banner in the nav should read
   "12 tools live".
3. Open DevTools and run `await document.modelContext.getTools()` to see
   the 12 definitions.

Alternatively, open the page from `chatgpt.com` (WebMCP is on by default
in the in-app browser) and ask ChatGPT to interact with the wardrobe.

## Pull requests

- Keep changes scoped. One feature / fix per PR.
- Run `npm run lint` and `npm run typecheck` before pushing.
- For new WebMCP tools, add a description written for an agent (when
  to call, what it returns, what to do next), a precise JSON Schema
  input, and the right annotation. Document it under
  `lib/webmcp/docs.ts` so the `/tools` page stays in sync.
- For UI changes, attach before / after screenshots in the PR.

## Project layout

```
app/                  Next.js App Router
  (marketing)/        Public BAW marketing pages
  stylelab/           Interactive wardrobe + on-device scoring
  stylist/            Pair Stylist — chat UI driving 10 WebMCP tools
  tools/              /tools — agent-facing reference for every tool
  opengraph-image.tsx Dynamic OpenGraph card
  icon.tsx            Dynamic favicon
components/           Presentational + interactive building blocks
lib/
  webmcp/             12 registerTool() definitions, provider, bus, docs
  store/              Zustand stores (wardrobe + history)
  mock/               Deterministic on-device scoring engine
public/
  preview/            BAW design-time screenshots
  demo/               High-DPR screenshots of the running app
scripts/
  snap.cjs            Puppeteer-based screenshot tool
```

## License

MIT — see [LICENSE](./LICENSE). By submitting a PR you agree your
contribution is MIT-licensed.
