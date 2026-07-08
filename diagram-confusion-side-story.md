# Side story: how the diagram work got confused

Lecture notes for this repo. Documents a mix-up while adding load-reducing Mermaid diagrams in July 2026.

## What happened

Three related tracks shared one theme (use diagrams to lower cognitive load) but are **different assignments**:

| Track | Spec | Repo / doc | Your role |
|-------|------|------------|-----------|
| **GroceryList Tinker 6** | `tinker.txt` | `ai201-lab6-grocerylist-starter` (this repo) | Review two AI-generated PRs |
| **CineLog Project 6** | `projects.txt` | `ai201-project6-cinelog-starter` (homework) | Respond to six review comments as contributor |
| **Common theme** | — | Both | Mermaid maps, workflows, checklists |

**The mistake:** `tinker.txt` was briefly identical to `projects.txt` (CineLog homework pasted into both). Turn 8 in Copilot then treated the whole conversation as CineLog. Cursor added CineLog workflow diagrams to the wrong context, trimmed the GroceryList README, and created `cinelog-orientation.md`.

**The fix:** Updated `tinker.txt` confirms **Tinker 6 = GroceryList**. GroceryList diagrams were restored to this README. CineLog orientation stayed in `cinelog-orientation.md`. `projects.txt` remains the separate homework spec.

## Conceptual timeline (`gitGraph`)

*Not literal Git history — a memory aid for how ideas branched and reconverged.*

```mermaid
gitGraph
    commit id: "Common theme: reduce cognitive load with diagrams"
    branch grocery_tinker
    checkout grocery_tinker
    commit id: "Turn 7: GroceryList lab diagrams"
    commit id: "Repo map, request flow, PR review workflow"
    checkout main
    branch cinelog_homework
    checkout cinelog_homework
    commit id: "CineLog homework spec (projects.txt)"
    commit id: "Six comments, rebase, pr-response.md"
    checkout grocery_tinker
    merge cinelog_homework id: "Mistake: CineLog content treated as Tinker context"
    commit id: "Confusion noticed: tinker vs projects"
    checkout grocery_tinker
    commit id: "Updated tinker.txt confirms GroceryList"
    commit id: "Restore GroceryList README diagrams"
    checkout cinelog_homework
    commit id: "CineLog orientation kept separate"
```

## Conceptual map (`flowchart`)

Clearer than `gitGraph` for *what belongs where*:

```mermaid
flowchart TD
    A[Common theme] --> A1[Use Mermaid diagrams to reduce cognitive load]
    A --> A2[Turn long specs into maps, workflows, and checklists]
    A --> B[GroceryList / Tinker 6]
    A --> C[CineLog / Homework Project]
    B --> B1[Review two AI-generated PRs]
    B1 --> B2[PR 1: Bulk Purchase]
    B1 --> B3[PR 2: List Stats]
    B --> B4[README: repo map, request flow, PR review, checklist]
    C --> C1[Address six review comments]
    C --> C2[Rebase feature/watchlist]
    C --> C3[Rewrite commit history]
    C --> C4[Write pr-response.md]
    C --> D[Mistakenly treated as Tinker context]
    D --> E[Confusion recognized]
    E --> F[GroceryList content restored to lab README]
    E --> G[CineLog content kept in cinelog-orientation.md]
```

## What lives where (after separation)

### This repo (GroceryList lecture notes + lab)

- Request/data flow
- Repo structure
- Tinker milestone workflow
- PR description as contract
- AI-generated bug pattern mindmap
- PR review workflow
- PR files relationship
- Code review checklist mindmap
- Read less, understand more

### CineLog homework (`cinelog-orientation.md` in notes folder)

- Six review comments map
- `pr-response.md` structure mindmap
- Rebase / Git workflow
- Interactive rebase / commit cleanup

## Lesson

> Use **flowchart** to explain conceptual confusion. Use **gitGraph** only as a labeled “history of ideas,” not as literal repo history.

Source: Copilot turns 10–11, Cursor session correcting the mix-up.
