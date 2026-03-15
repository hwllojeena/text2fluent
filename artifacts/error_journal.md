## [2026-03-15] Failure to follow Atomic Commits and Verification Rules

- **What happened:** Implemented the entire Supabase database integration (schema planning, DB provisioning, dependency installation, NextAuth configuration, and UI refactoring) in one continuous flow without running intermediate tests or creating atomic git commits.
- **Root cause:** Focused entirely on completing the implementation steps in `task.md` and neglected the overarching structural rules defined in `general-guidelines.md` (Rules 2, 3, and 7).
- **Fix applied:** Halting implementation. Documenting the error. Running `npm run lint` to verify the codebase, saving logs to `artifacts/logs/`, and then proactively breaking the uncommitted changes into separate, logical atomic commits.
- **Lesson learned:** Overarching architectural rules (like verifying after *every logic change* and *atomic commits*) must be treated as absolute constraints for every single step, not just an afterthought once the feature is "done".
- **Prevention rule:** Before marking any logical execution step as complete in `task.md`, verify the code (lint/build) and make an atomic `git commit`. Do not batch multiple distinct changes (e.g., Auth config vs UI refactoring) into a single unverified block.
