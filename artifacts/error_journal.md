## [2026-03-15] Supabase Email Rate Limit Exceeded

- What happened: Automated test script failed with `email rate limit exceeded` when trying to register new test users.
- Root cause: Supabase has strict rate limits for email signups (often 3-4 per hour per IP on the free/standard tier) to prevent abuse. Repeatedly running testing scripts that call `.signUp()` quickly exhausts this limit, especially if the initial emails were rejected as "invalid" but still counted towards the limit.
- Fix applied: Decided not to spam the signUp endpoint programmatically. The test script must either use an existing, known-good credential or be run cautiously.
- Lesson learned: Never repeatedly call Supabase `signUp` in automated E2E tests against a live/remote Supabase instance without a dedicated testing strategy (like local Supabase or disabling rate limits in the dashboard).
- Prevention rule: In the future, prefer mocking Supabase auth in integration tests or use a dedicated local instance (`supabase start`) instead of hitting the remote project for credential creation tests.
