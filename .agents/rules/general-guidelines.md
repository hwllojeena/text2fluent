---
trigger: always_on
---

# 🛸 Antigravity Cognitive Architecture (v2.3)

> An AI Agent's capability ceiling = the quality of context it can read.
> These rules **ARE the architecture**. No plugins, no lock-in.

---

# 1. Think Before You Act

* **NEVER** start coding without a plan.
* Create `artifacts/plan_[task].md` **FIRST**.
* Use `<thought>...</thought>` blocks for non-trivial reasoning.
* Consider:

  * Edge cases
  * Failure modes
  * Security implications
  * Scalability

---

# 2. Verify Everything

* Run tests after **every logic change**.
* Save test output to `artifacts/logs/`.
* If tests fail:

  * Investigate immediately
  * **Do NOT continue implementation until resolved**

---

# 3. Git Discipline (Critical)

After **every completed logical code change**:

1. Ensure tests pass
2. Stage only relevant files
3. Create a **single atomic commit**

Rules:

* One logical change per commit
* Clear commit message explaining **what and why**
* Never batch unrelated changes

Example:

```
feat: add retry logic to payment worker

- Implements exponential backoff
- Handles transient API failures
- Adds unit tests
```

---

# 4. Learn From Mistakes (Self-Evolution) 🧬

When a bug or incorrect approach is discovered:

Document it in:

```
artifacts/error_journal.md
```

Format:

```
## [DATE] [Title]

- What happened:
- Root cause:
- Fix applied:
- Lesson learned:
- Prevention rule:
```

Then:

1. Extract **generalizable lessons** into this file or `.context/`
2. **Always review the error journal before debugging similar problems**
3. Never repeat a documented mistake. Always scan the error journal first.

---

# 5. Coding Constraints

| Constraint              | Applies To                          |
| :---------------------- | :---------------------------------- |
| Strict type hints       | All functions                       |
| Google-style docstrings | All functions and classes           |
| Pydantic models         | All data structures and settings    |
| Tool encapsulation      | All external API calls → `tools/`   |
| No silent exceptions    | Every `except` must log or re-raise |
| Atomic commits          | One logical change per commit       |

---

# 6. Spec-Driven Changes

For **non-trivial features or breaking changes**:

1. Write a spec/proposal first
2. Store in `artifacts/` or `openspec/`
3. Get **user approval**
4. Implement approved spec
5. Archive completed specs

---

# 7. Artifact Protocol

| Type          | Path                         | When                                 |
| :------------ | :--------------------------- | :----------------------------------- |
| Plans         | `artifacts/plan_[task].md`   | Before implementation                |
| Test logs     | `artifacts/logs/`            | After every test run                 |
| Error journal | `artifacts/error_journal.md` | After bugs                           |
| Context state | `artifacts/current_state.md` | After major milestones or long tasks |

---

# 8. Context Compression

For long or complex tasks, maintain a compressed working context.

File:

```
artifacts/current_state.md
```

Include:

* Current objective
* Completed work
* Known issues
* Next steps

Update this file after:

* Major milestones
* Long implementation sessions
* Significant task progress

Purpose:

* Prevent context drift
* Preserve task continuity
* Allow fast reloading of project state

---

# 9. Refactor Triggers

Refactoring should be considered when any of the following occur:

* A file exceeds **500 lines**
* A function exceeds **60 lines**
* Logic is repeated **3 or more times**
* Module responsibility becomes unclear
* Complexity significantly increases

Refactoring rules:

1. Preserve existing behavior
2. Ensure tests still pass
3. Commit refactors **separately from feature changes**
4. Maintain readability and modularity

---

# 10. Permissions

Allowed:

* ✅ Read any project file
* ✅ Write to `src/`, `tests/`, `artifacts/`
* ✅ Run `pytest`
* ✅ Run `git add`, `git commit`

Forbidden:

* ❌ `rm -rf` or destructive commands
* ❌ Modify `.git/` internals
* ❌ Perform logins or form submissions without approval