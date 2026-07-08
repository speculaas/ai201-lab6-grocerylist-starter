# Lecture notes — Module 2 Lesson 6: Git and Collaboration

AI201 Week 6 lecture companion for this repo. Source: **Su26 AI201 — Module 2 Lesson 6 — Git and Collaboration [S1c]** slide text, plus Mermaid diagrams from Copilot turn 12.

The lecture covers merge vs rebase, conflict resolution, code review, conventional commits, CI/CD logs, and connects to the **GroceryList Tinker** activity in this repo. The **CineLog** homework project applies the same Git/review skills separately.

## Lecture arc (from slides)

| Segment | Topic |
|---------|--------|
| Git fundamentals | Merge vs rebase, history shapes, rule of thumb |
| Conflicts | Markers, wrong approach, resolve by intent |
| Commands | `git rebase`, `git status`, `--continue`, `--abort` |
| Review | PR description as contract |
| Hygiene | Conventional commits, interactive rebase, commit often |
| Automation | CI/CD — find the **first** failure |
| Tinker | GroceryList — review two AI-generated PRs |
| Project preview | CineLog — six comments, rebase, rewrite history |

---

## Mermaid diagrams

### 1. Merge vs rebase concept map

Both integrate changes from one branch into another; they differ in **how** and in **history shape**.

```mermaid
flowchart LR
    A[Need to bring changes from one branch into another] --> B{Which command?}
    B --> C[git merge]
    C --> C1[Creates a new merge commit]
    C --> C2[Preserves exact branch history]
    C --> C3[Good for shared branches]
    C --> C4[Tradeoff: honest but noisy]
    B --> D[git rebase]
    D --> D1[Replays your commits on top of target branch]
    D --> D2[Creates linear history]
    D --> D3[Good for personal feature branches]
    D --> D4[Tradeoff: clean but rewrites history]
```

### 2. Rule of thumb — merge or rebase?

```mermaid
flowchart TD
    A[Need to update branch] --> B{Is this branch shared with others?}
    B -- Yes --> C[Use merge]
    C --> C1[Preserve shared history]
    C --> C2[Avoid rewriting commits others depend on]
    B -- No, personal feature branch --> D{Preparing for PR?}
    D -- Yes --> E[Use rebase]
    E --> E1[Cleaner linear history for reviewer]
    D -- No --> F[Either may work, but understand tradeoff]
    G[Warning] --> H[Never rebase a branch other people are working on]
```

### 3. Conflict resolution by intent

Do not pick whichever side looks newer. Name each side's goal, then combine.

```mermaid
flowchart TD
    A[Merge/Rebase conflict appears] --> B[Read both sides]
    B --> C[Name intent of your branch]
    B --> D[Name intent of incoming branch]
    C --> E[Write combined resolution]
    D --> E
    E --> F{Does result preserve both valid goals?}
    F -- Yes --> G[Run tests]
    F -- No --> H[Revisit intent before editing more]
    G --> I[Continue merge/rebase]
```

### 4. Rebase command flow

```mermaid
flowchart TD
    A[Start rebase] --> B[git rebase target-branch]
    B --> C{Conflict?}
    C -- No --> D[Rebase completes]
    C -- Yes --> E[git status]
    E --> F[Open conflicted files]
    F --> G[Resolve by intent]
    G --> H[Stage resolved files]
    H --> I[git rebase --continue]
    I --> J{More conflicts?}
    J -- Yes --> E
    J -- No --> D
    E --> K[Too stuck?]
    K --> L[git rebase --abort]
    L --> M[Return to pre-rebase state]
```

### 5. Code review as contract

Matches the lecture's three steps and the tinker lab mindset.

```mermaid
flowchart TD
    A[Read PR description] --> B[Extract expected behavior]
    B --> C[Map each requirement to code lines]
    C --> D[Check literally]
    D --> E{Does code satisfy requirement as written?}
    E -- Yes --> F[Requirement satisfied]
    E -- No --> G[Write actionable review comment]
    G --> H[State the spec]
    G --> I[Point to the code]
    G --> J[Explain mismatch]
    G --> K[Suggest concrete fix]
```

### 6. CI/CD output debugging

```mermaid
flowchart TD
    A[CI/CD fails] --> B[Open log]
    B --> C[Find the first failure]
    C --> D{Failure type?}
    D --> E[Linting failure]
    E --> E1[Formatting or style issue]
    E --> E2[Usually quick fix]
    D --> F[Test failure]
    F --> F1[Behavior broke]
    F --> F2[Needs deeper diagnosis]
    D --> G[Build failure]
    G --> G1[Dependency or config issue]
    G --> G2[May cause cascading errors]
    C --> H[Ignore later cascading noise until first error is understood]
```

### 7. Interactive rebase mental model

`git rebase <branch>` updates where your branch starts. `git rebase -i HEAD~N` rewrites commit messages and structure.

```mermaid
flowchart LR
    A[wip] --> B[fixed rename]
    B --> C[address feedback]
    C --> D[interactive rebase]
    D --> E[feat: add watchlist endpoint]
```

### 8. Master lecture map

```mermaid
flowchart LR
    A[Git and Collaboration] --> B[Branch integration]
    A --> C[Conflict resolution]
    A --> D[Review quality]
    A --> E[Commit hygiene]
    A --> F[Automation feedback]
    A --> G[Tinker: GroceryList]
    B --> B1[Merge]
    B --> B2[Rebase]
    B --> B3[Cherry-pick]
    C --> C1[Read both sides]
    C --> C2[Resolve by intent]
    C --> C3[Use rebase continue or abort]
    D --> D1[PR description as contract]
    D --> D2[Map requirements to code]
    D --> D3[Write actionable comments]
    E --> E1[Conventional commits]
    E --> E2[Interactive rebase]
    E --> E3[Commit often as save points]
    F --> F1[Lint failure]
    F --> F2[Test failure]
    F --> F3[Build failure]
    F --> F4[Find first failure]
    G --> G1[Two AI-generated PRs]
    G --> G2[Review beyond happy path]
    G --> G3[Find edge cases and semantic mismatches]
```

### 9. Slide 12 — rebase before PR (conceptual `gitGraph`)

*Illustrates why rebase replays your work on latest `main` before opening a PR.*

```mermaid
gitGraph
    commit id: "main A"
    commit id: "main B"
    branch feature
    checkout feature
    commit id: "your work 1"
    commit id: "your work 2"
    checkout main
    commit id: "main C"
    commit id: "main D"
    checkout feature
    commit id: "replay your work on latest main"
```

---

## Multiple-choice slides (detailed)

### Slide 12 — merge or rebase before PR?

**Question:** Feature branch open two weeks. Main moved ahead 30 commits. About to open a PR. Merge main in or rebase onto main?

| Option | Verdict |
|--------|---------|
| A. Merge | Works, but adds a noisy merge commit the reviewer must filter out |
| **B. Rebase** | **Correct** — personal feature branch, clean linear history for review |
| C. Depends | Often true in Git, but this scenario matches the rebase-before-PR rule |

### Slide 22 — 15 commits behind main, want clean history

**Question:** Feature branch 15 commits behind main. Want clean, linear history for reviewer.

| Option | Verdict |
|--------|---------|
| A. Merge main in | Defeats linear-history goal (merge commit) |
| **B. Rebase onto main** | **Correct** — `git fetch origin` then `git rebase origin/main` |
| C. Cherry-pick from main | Wrong tool — cherry-pick grabs one commit, not full sync |
| D. Open PR as-is | Pushes hygiene work onto reviewer |

### Slide 23 — conflict: null check vs rename

**Question:** Your branch added a null check before a call. Incoming branch renamed the function. Resolved version?

| Option | Verdict |
|--------|---------|
| A. Keep null check, old name | Preserves your intent, deletes rename |
| B. Keep rename, drop null check | Preserves rename, deletes safety |
| **C. Null check on renamed function** | **Correct** — preserve both intents |
| D. Rewrite from scratch | Nuclear option; both changes are compatible here |

**Example resolution:**

```python
if value is not None:
    renamed_function(value)
```

---

## Quick reference (from slides)

### Merge vs rebase

```text
merge  = preserves actual branch history
rebase = replays your commits onto a new base
```

### Conflict markers

```text
<<<<<<< HEAD          your branch
=======
>>>>>>> branch-name   incoming branch
```

### Conventional commit prefixes

```text
feat:   new feature
fix:    bug fix
chore:  maintenance, deps, config
docs:   documentation only
test:   adding or updating tests
```

### Commit often (especially with AI agents)

A commit is a **save point**. Small commits are easier to review, bisect, and revert. When an agent breaks a working state, `git reset --hard` to a known-good commit beats asking the agent to unwind its own mess.

### Cherry-pick (narrow tool)

`git cherry-pick <hash>` applies **one** commit from another branch. Use for hotfixes or borrowing a single change — not for syncing your whole branch with `main`.

---

## Related notes in this repo

- [`README.md`](README.md) — lab setup, API, tinker-specific review diagrams
- [`diagram-confusion-side-story.md`](diagram-confusion-side-story.md) — how GroceryList vs CineLog diagram work got mixed up
