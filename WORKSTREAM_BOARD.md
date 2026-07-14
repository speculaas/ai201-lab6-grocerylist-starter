# Workstream board (personal study / GitHub Pages)

This repo hosts a **conceptual workstream board** under `docs/status/`.

## What it is

- Interactive Mermaid + branch cards (FedPrint-style status page).
- Current `data/workstream.json` narrates **AI201 Project 6 (CineLog)** homework
  progress from the M2 week-6 Cursor chat — **not** GroceryList lab features and
  **not** literal git history.
- Safe to publish as a github.io learning page; keep it mentally separate from
  any **graded** CineLog fork (`ai201-project6-cinelog-starter` + `pr-response.md`).

## Paths

| Path | Purpose |
|------|---------|
| [`docs/status/`](./docs/status/) | Published board (`index.html`, `app.js`, `data/workstream.json`) |
| [`docs/status/README.md`](./docs/status/README.md) | Local serve + edit notes |
| `ai201/llm/docs/workstream-board/` | Reusable Copilot prompt + future workflow (outside this repo) |

## Local preview

```bash
cd docs/status
python3 -m http.server 8766
# http://127.0.0.1:8766/
```

## GitHub Pages

1. Push this repo to GitHub.
2. Settings → Pages → Source: **Deploy from a branch** → branch `main` (or `docs`) → folder **`/docs`**.
3. Board URL will be:

   `https://<user>.github.io/<repo>/status/`

   (because the site root is `docs/`, and the board lives in `docs/status/`).

If you want the board at the site root instead, move `docs/status/*` up into `docs/` (keep `.nojekyll`).

## Recollection cheat sheet

- **Board shell** came from `comprehensive/.../fed_print_seg/docs/status/`.
- **Content** = CineLog Project 6 workstreams (orient → six comments → git hygiene → tooling).
- **Regenerate JSON later** with the prompt in  
  `zimmnotes/chat/codepath/ai201/llm/docs/workstream-board/`.
