# AI201 Project 6 (CineLog) — workstream board

Personal study board for the Project 6 homework thread: Mermaid overview + expand/collapse branch cards.

**Hosted from this GroceryList starter repo for github.io convenience** — content is about **CineLog Project 6**, not the GroceryList lab API. See repo-root [`WORKSTREAM_BOARD.md`](../../WORKSTREAM_BOARD.md).

**Interaction:** click a gitGraph commit to open the matching milestone on the right; click a card to highlight the graph. Titles in `mermaid` must match `branches[].nodes[].title` (or a branch label). Header search scans **nodes across all boards** and temporarily replaces the right column with hits; Back restores the branch cards.

**Not** repository commit history — conceptual workstreams only.

## Run locally

`fetch()` needs HTTP; opening `index.html` as `file://` will not load the board manifest and workstream JSON.

```bash
cd docs/status   # from ai201-lab6-grocerylist-starter root
python3 -m http.server 8766
```

Open [http://127.0.0.1:8766/](http://127.0.0.1:8766/)

## Edit content

Each board uses the same structure as `data/workstream.json`:

- `mermaid` — overview gitGraph (study labels)
- `branches[]` — cards (`status`: `done` | `open` | `blocked`)

To add another board:

1. Add a same-schema JSON file under `data/`.
2. Register its unique `id`, filename, and display `label` in `data/boards.json`.
3. Open `?board=<id>` to link directly to it.

The header selector is populated from `data/boards.json`; no build step is required for GitHub Pages.

## Reusable Copilot prompt & workflow

Not in this repo — keep LLM prompts with other AI201 tooling:

`../../../../llm/docs/workstream-board/`  
(from `zimmnotes/chat/codepath/ai201/`: `llm/docs/workstream-board/`)

## Copy board assets from FedPrint template

```bash
SRC="/Users/watney/git/comprehensive/erise_dream/fed_print_seg/docs/status"
DEST="/Users/watney/git/zimmnotes/chat/codepath/ai201/m2/w6/ai201-lab6-grocerylist-starter/docs/status"

mkdir -p "$DEST/data"
cp -v "$SRC/app.js" "$SRC/styles.css" "$SRC/index.html" "$SRC/.nojekyll" "$DEST/"
```
