# GroceryList — AI201 Lab 6 Starter

A shared grocery list API where members create lists, add items, and track what's been purchased.

## What the app does

- **Lists** — users create named grocery lists (private or shared)
- **Items** — add items to a list with optional quantity, unit, and category
- **Purchasing** — mark individual items as purchased during a shopping trip

## How requests flow

The app follows a typical Flask pattern: routes handle HTTP, services hold business logic, and models talk to the database.

```mermaid
flowchart LR
    Client[Client] --> Route[routes/lists.py]
    Route --> Service[services/list_service.py]
    Service --> Model[models.py]
    Model --> Database["(Database)"]
    App[app.py] --> Route
    App --> Extensions[extensions.py]
    Seed[seed_data.py] --> Database
```

## Setup

```bash
python -m venv .venv
source .venv/bin/activate      # Mac/Linux
# or: .venv\Scripts\activate   # Windows

pip install -r requirements.txt

python seed_data.py    # populate the database
python app.py          # start the server (runs at http://127.0.0.1:5000)
```

The seed script prints user IDs and list IDs — save them. You'll use them throughout the lab.

## API

| Method | Endpoint                               | Description                        |
|--------|----------------------------------------|------------------------------------|
| GET    | `/lists/`                              | List all grocery lists             |
| POST   | `/lists/`                              | Create a new list                  |
| GET    | `/lists/<list_id>/items`               | Get items for a list               |
| POST   | `/lists/<list_id>/items`               | Add an item to a list              |
| PATCH  | `/lists/<list_id>/items/<item_id>`     | Mark an item as purchased          |

## Codebase structure

Four zones: app setup → models → routes/services → PR review files.

```mermaid
flowchart TD
    A[Grocery List Starter Repo] --> B[app.py]
    A --> C[extensions.py]
    A --> D[models.py]
    A --> E[seed_data.py]
    A --> F[README.md]
    A --> G[requirements.txt]
    A --> H[review_template.md]
    A --> I[try_prs.py]
    A --> J[routes/]
    J --> J1[routes/lists.py]
    A --> K[services/]
    K --> K1[services/list_service.py]
    A --> L[prs/]
    L --> L1[pr1_bulk_purchase.py]
    L --> L2[pr1_description.md]
    L --> L3[pr2_list_stats.py]
    L --> L4[pr2_description.md]
```

```plaintext
app.py                  Flask application factory
extensions.py           Shared Flask extensions (e.g. SQLAlchemy)
models.py               SQLAlchemy models: User, GroceryList, Item
routes/
  lists.py              All list and item routes
services/
  list_service.py       Business logic for lists and items
seed_data.py            Database seed script
try_prs.py              Test server that adds both PR endpoints alongside the base app
prs/
  pr1_description.md    PR #1 description (bulk purchase feature)
  pr1_bulk_purchase.py  PR #1 proposed code
  pr2_description.md    PR #2 description (list stats feature)
  pr2_list_stats.py     PR #2 proposed code
review_template.md      Template for your code review notes
```

## PR review workflow

This lab includes two proposed PRs under `prs/`. Read the description before inspecting the code — it states what the PR intends; the code shows what it actually changes.

### Review process

```mermaid
flowchart TD
    A[Start Review] --> B[Read README.md]
    B --> C[Understand current app structure]
    C --> D[Read review_template.md]
    D --> E[Open PR description]
    E --> F[Inspect PR code file]
    F --> G[Compare PR behavior to existing service/model logic]
    G --> H[Test or mentally trace behavior]
    H --> I[Identify correctness, edge cases, and maintainability issues]
    I --> J[Write review comments]
    J --> K[Submit completed review]
```

### How PR files relate to the app

```mermaid
flowchart TD
    A[PR Review Materials] --> B[PR 1: Bulk Purchase]
    A --> C[PR 2: List Stats]
    B --> B1[prs/pr1_description.md]
    B --> B2[prs/pr1_bulk_purchase.py]
    C --> C1[prs/pr2_description.md]
    C --> C2[prs/pr2_list_stats.py]
    B2 --> D[Compare against existing app logic]
    C2 --> D
    D --> E[routes/lists.py]
    D --> F[services/list_service.py]
    D --> G[models.py]
    E --> H[Review feedback]
    F --> H
    G --> H
```

### Code review checklist

Keep this open next to your editor while reviewing.

```mermaid
mindmap
  root((Code Review Checklist))
    Correctness
      Does the code do what the PR description claims?
      Are all relevant cases handled?
      Are errors handled clearly?
    Integration
      Does it match existing route/service/model patterns?
      Does it reuse existing helpers?
      Does it break current behavior?
    Data Model
      Does it read/write the correct fields?
      Are database changes safe?
      Are relationships respected?
    Edge Cases
      Empty list
      Missing item
      Invalid quantity
      Already purchased item
      Duplicate item
    Maintainability
      Is the code simple?
      Are names clear?
      Is logic duplicated?
      Would future developers understand it?
    Testing
      What behavior should be tested?
      What regression could happen?
```

### Read less, understand more

Do not read every file equally. Build a map first, then trace one specific behavior.

```mermaid
flowchart TD
    A[Too much text/code] --> B[Create file map]
    B --> C[Identify important files]
    C --> D[Trace one user action]
    D --> E[Summarize each file in one sentence]
    E --> F[Inspect PR diff]
    F --> G["Ask: what behavior changed?"]
    G --> H["Ask: what could break?"]
    H --> I[Write review notes]
```

## Running example requests

```bash
# List all grocery lists
curl http://127.0.0.1:5000/lists/

# Get items for a list (replace LIST_ID with ID from seed output)
curl http://127.0.0.1:5000/lists/LIST_ID/items

# Add an item
curl -X POST http://127.0.0.1:5000/lists/LIST_ID/items \
  -H "Content-Type: application/json" \
  -d '{"name": "Eggs", "quantity": 12, "unit": "count", "category": "dairy", "added_by": "USER_ID"}'

# Mark an item as purchased
curl -X PATCH http://127.0.0.1:5000/lists/LIST_ID/items/ITEM_ID \
  -H "Content-Type: application/json" \
  -d '{"user_id": "USER_ID"}'
```

### Windows / PowerShell notes

The examples above use Mac/Linux shell syntax. On Windows:

- Use `curl.exe`, not `curl` — in PowerShell, `curl` is an alias for `Invoke-WebRequest`, which truncates the response output.
- Run each command as a **single line** — the trailing `\` line continuations above are Mac/Linux syntax and cause errors if pasted into PowerShell. Make sure to keep a space before each flag (` -H `, ` -d `) when joining lines.
- Escape the inner double quotes in JSON bodies with backslashes:

```powershell
curl.exe -X PATCH http://127.0.0.1:5000/lists/LIST_ID/items/ITEM_ID -H "Content-Type: application/json" -d '{\"user_id\": \"USER_ID\"}'
```

(Git Bash users can run the Mac/Linux commands as written.)
