# Lecture notes — Module 2 Lesson 6: Git and Collaboration

AI201 Week 6 lecture companion for this repo. Source: **Su26 AI201 — Module 2 Lesson 6 — Git and Collaboration [S1c]** slide text, plus Mermaid diagrams from Copilot turns 12 and 20–21.

The lecture covers merge vs rebase, conflict resolution, code review, conventional commits, CI/CD logs, and connects to the **GroceryList Tinker** activity in this repo. The **CineLog** homework project applies the same Git/review skills separately.

A recurring confusion in this lecture is **which layer you are on**: core Git commands, branch workflow, hosting platform (GitHub/GitLab/Gerrit), or review/history hygiene (PRs, rebase). The five-level model below is a zoom-in / zoom-out tour from beginner commands to internals.

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

## Five-level Git mental model

Zoom **out**: Git is a save-point tool. Zoom **in**: Git is a commit graph plus movable labels (refs, HEAD).

| Level | What you see | Examples |
|-------|----------------|----------|
| 1 — Survival commands | What do I type? | `git status`, `add`, `commit`, `push`, `pull`, `log` |
| 2 — Branches | Where is my work? | `main`, feature branch, `HEAD` |
| 3 — Remotes and platforms | Where does code live? | `origin`, GitHub, GitLab, Gerrit, AOSP Repo |
| 4 — Collaboration hygiene | How do teams integrate? | PRs, reviews, rebase, conventional commits |
| 5 — Internals | What Git actually stores | Commits, refs, trees/blobs, diff algorithms |

```mermaid
flowchart TD
    L1["Level 1: Save points<br>add, commit, status, log"] --> L2["Level 2: Branches<br>main, feature, bugfix"]
    L2 --> L3["Level 3: Remotes and platforms<br>GitHub, GitLab, Gerrit, AOSP Repo"]
    L3 --> L4["Level 4: Collaboration hygiene<br>PRs, reviews, rebase, clean commits"]
    L4 --> L5["Level 5: Internals<br>commits, refs, HEAD, objects, diff algorithms"]
    L5 --> Z["Zoomed-in model:<br>Git is a commit graph plus movable labels"]
    L1 --> S["Zoomed-out model:<br>Git is a save-point tool"]
```

### Git vs platform layer

**Pull requests are not native to core Git.** They are a platform-level collaboration feature (GitHub calls it a pull request; GitLab a merge request; Gerrit/AOSP a change or changelist).

```text
Core Git:     commit, branch, merge, rebase, push, fetch, pull, diff
GitHub adds:  pull request, review comments, checks, branch protection, web diff UI
AOSP Repo:    wrapper over many Git repos; uploads to Gerrit (does not replace Git)
```

```mermaid
flowchart TD
    A[Core Git] --> A1[Commits]
    A --> A2[Branches]
    A --> A3[Merge / Rebase]
    A --> A4[Push / Fetch / Pull]
    A --> A5[Diff algorithms]
    B[Platform layer] --> B1[GitHub pull request]
    B --> B2[GitLab merge request]
    B --> B3[Gerrit code review]
    B --> B4[Web diff UI]
    C[Wrapper layer] --> C1[AOSP Repo]
    C1 --> C2[Manages many Git repositories]
    C1 --> C3[repo upload → Gerrit]
    A --> B
    A --> C
```

**AOSP Repo** canonical source is on `googlesource.com`; there is also a [GitHub mirror](https://github.com/GerritCodeReview/git-repo). Repo does not replace Git — it orchestrates many repos and uploads to Gerrit.

```mermaid
flowchart LR
    A[repo init] --> B[Manifest repo]
    B --> C[repo sync]
    C --> D[Many local Git repos]
    D --> E[git add / git commit]
    E --> F[repo upload]
    F --> G[Gerrit review]
```

### Public timeline (iPhone, GitHub, AOSP)

If the question is "which came first publicly":

```text
2007 Jan/Jun — iPhone announced and released
2008 Apr     — GitHub public launch
2008 Oct     — Android source released as AOSP
```

Many engineers encounter AOSP Repo and Gerrit before GitHub; that personal path is normal. The layers above still apply.

### Web diff vs local `git diff`

Platform web diffs (GitHub, Gerrit, GitLab) are **rendered views**, not guaranteed to match every local option. Core Git supports multiple diff algorithms: `myers` (default), `minimal`, `patience`, `histogram`.

If a web diff looks confusing, try locally:

```bash
git diff --patience main...your-branch
git diff --histogram main...your-branch
```

Sometimes a different algorithm makes a refactor much easier to read.

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

Git MCQs are rarely about memorizing commands. They test whether you pick the command that matches the **collaboration context** (personal vs shared branch, full sync vs one commit, conflict intents).

```mermaid
flowchart TD
    A[Lecture MCQs] --> B[Slide 12]
    A --> C[Slide 22]
    A --> D[Slide 23]
    B --> B1[Branch open for weeks, main moved]
    B1 --> B2[Rebase personal branch before PR]
    B2 --> B3[Goal: clean review history]
    C --> C1[Branch 15 commits behind]
    C1 --> C2[Rebase, not cherry-pick]
    C2 --> C3[Goal: sync full branch with main]
    D --> D1[Conflict: null check vs rename]
    D1 --> D2[Resolve by intent]
    D2 --> D3[Goal: preserve both changes]
```

### Slide 12 — merge or rebase before PR?

**Question:** Feature branch open two weeks. Main moved ahead 30 commits. About to open a PR. Merge main in or rebase onto main?

| Option | Verdict |
|--------|---------|
| A. Merge | Works, but adds a noisy merge commit the reviewer must filter out |
| **B. Rebase** | **Correct** — personal feature branch, clean linear history for review |
| C. Depends | Often true in Git, but this scenario matches the rebase-before-PR rule |

**Concrete setup:**

```text
main:        A---B---C---D---E
your branch: A---B---x---y
```

While you worked on `x` and `y`, main moved to `E`.

**Before updating** — feature is behind main:

```mermaid
gitGraph
    commit id: "A"
    commit id: "B"
    branch feature
    checkout feature
    commit id: "F1: your work"
    commit id: "F2: your work"
    checkout main
    commit id: "C: main moved"
    commit id: "D: main moved"
    commit id: "E: main moved"
```

**If you merge main into feature** — valid, but noisy:

```mermaid
gitGraph
    commit id: "A"
    commit id: "B"
    branch feature
    checkout feature
    commit id: "F1"
    commit id: "F2"
    checkout main
    commit id: "C"
    commit id: "D"
    commit id: "E"
    checkout feature
    merge main id: "M: merge main into feature"
```

**If you rebase onto main** — cleaner for reviewers:

```bash
git rebase origin/main
```

```text
main after rebase view:  A---B---C---D---E---x'---y'
```

```mermaid
gitGraph
    commit id: "A"
    commit id: "B"
    commit id: "C"
    commit id: "D"
    commit id: "E"
    branch feature_rebased
    checkout feature_rebased
    commit id: "F1': replayed"
    commit id: "F2': replayed"
```

Reviewers only review your two commits on top of current main.

### Slide 22 — 15 commits behind main, want clean history

**Question:** Feature branch 15 commits behind main. Want clean, linear history for reviewer.

| Option | Verdict |
|--------|---------|
| A. Merge main in | Defeats linear-history goal (merge commit) |
| **B. Rebase onto main** | **Correct** — `git fetch origin` then `git rebase origin/main` |
| C. Cherry-pick from main | Wrong tool — cherry-pick grabs one commit, not full sync |
| D. Open PR as-is | Pushes hygiene work onto reviewer |

**Workflow example** on `bugfix/mixtape` when GitHub shows "15 commits behind main":

```bash
git fetch origin
git rebase origin/main
pytest tests/ -v          # verify after replay
git push --force-with-lease # only if branch was already pushed (rebase rewrites hashes)
```

**Before rebase** — your fixes sit on an old base while main moved:

```mermaid
gitGraph
    commit id: "base"
    branch feature
    checkout feature
    commit id: "your fix 1"
    commit id: "your fix 2"
    checkout main
    commit id: "main +1"
    commit id: "main +2"
    commit id: "main +3"
    commit id: "..."
    commit id: "main +15"
```

**After rebase** — linear history for the reviewer:

```mermaid
gitGraph
    commit id: "base"
    commit id: "main +1"
    commit id: "main +2"
    commit id: "main +3"
    commit id: "..."
    commit id: "main +15"
    branch feature_clean
    checkout feature_clean
    commit id: "your fix 1'"
    commit id: "your fix 2'"
```

```mermaid
flowchart TD
    A[Feature branch is behind main] --> B{Goal?}
    B --> C[Just preserve exact history]
    C --> D[Merge can work]
    B --> E[Clean linear history for PR]
    E --> F[Rebase onto origin/main]
    B --> G[Need one specific commit only]
    G --> H[Cherry-pick]
    B --> I[Do nothing]
    I --> J[Reviewer sees stale/noisy branch]
```

```text
Cherry-pick = grab one specific commit
Rebase      = update your whole branch base
```

### Slide 23 — conflict: null check vs rename

**Question:** Your branch added a null check before a call. Incoming branch renamed the function. Resolved version?

| Option | Verdict |
|--------|---------|
| A. Keep null check, old name | Preserves your intent, deletes rename |
| B. Keep rename, drop null check | Preserves rename, deletes safety |
| **C. Null check on renamed function** | **Correct** — preserve both intents |
| D. Rewrite from scratch | Nuclear option; both changes are compatible here |

**Branch history** — both sides edited the same call site:

```mermaid
gitGraph
    commit id: "base: call send_notification"
    branch your_branch
    checkout your_branch
    commit id: "add null check"
    checkout main
    commit id: "rename function"
    checkout your_branch
    merge main id: "conflict"
```

**Your branch:**

```python
if user is not None:
    send_notification(user)
```

**Incoming branch:**

```python
deliver_notification(user)
```

**Correct resolution** — preserve both intents (safety + clearer API name):

```python
if user is not None:
    deliver_notification(user)
```

```mermaid
flowchart TD
    A[Conflict in same code block] --> B[Your branch]
    A --> C[Incoming branch]
    B --> B1[Added null check]
    B1 --> B2[Intent: safety]
    C --> C1[Renamed function]
    C1 --> C2[Intent: clearer or new API]
    B2 --> D[Correct resolution]
    C2 --> D
    D --> E[Keep null check]
    D --> F[Use renamed function]
```

Do not ask "which side wins?" Ask "what were both sides trying to accomplish?"

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
