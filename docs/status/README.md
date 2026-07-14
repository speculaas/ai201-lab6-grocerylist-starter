# AI201 Project 6 (CineLog) — workstream board

Personal study board for the Project 6 homework thread: Mermaid overview + expand/collapse branch cards.

**Hosted from this GroceryList starter repo for github.io convenience** — content is about **CineLog Project 6**, not the GroceryList lab API. See repo-root [`WORKSTREAM_BOARD.md`](../../WORKSTREAM_BOARD.md).

**Interaction:** click a gitGraph commit to open the matching milestone on the right; click a card to highlight the graph. Titles in `mermaid` must match `branches[].nodes[].title` (or a branch label).

**Not** repository commit history — conceptual workstreams only.

## Run locally

`fetch()` needs HTTP; opening `index.html` as `file://` will not load `data/workstream.json`.

```bash
cd docs/status   # from ai201-lab6-grocerylist-starter root
python3 -m http.server 8766
```

Open [http://127.0.0.1:8766/](http://127.0.0.1:8766/)

## Edit content

Update `data/workstream.json`:

- `mermaid` — overview gitGraph (study labels)
- `branches[]` — cards (`status`: `done` | `open` | `blocked`)

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
