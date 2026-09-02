# Universal Agents — Project-Agnostic Dispatch

A portable set of AI coding agents that work in **any** project, not just the
repository they were born in. Copy this `.github/agents/` folder into any codebase —
including one you share with a friend — and every agent adapts to that project
automatically.

## How it works

The old `.github/agents/` were coupled to one stack (PGAutoPilot, pnpm
Turborepo, React/Vite, PostgreSQL). These are rewritten to be **self-adapting**:

1. **Project Probe** — every agent first detects the project's real stack from
   config files (`package.json`, lockfiles, `tsconfig.json`, framework
   configs) instead of assuming one.
2. **Context Contract** — a short, fillable block at the top of each agent. If
   present, it overrides auto-detection; if absent, the agent probes.
3. **Universal methodology** — the strong, reusable parts (debugging phases,
   bug classification, verification priority, reframing audit) are preserved
   intact because they are stack-agnostic.

## The agents

| Agent | File | When to use |
| --- | --- | --- |
| Senior Code Architect | `agents/code-architect.agent.md` | Build, refactor, debug, review, fix type errors. Default agent. |
| Bug Hunter | `agents/bug-hunter.agent.md` | Read-only audit for real bugs. Produces a prioritized report. |
| Security Auditor | `agents/security-auditor.agent.md` | Read-only audit for security vulnerabilities. Produces a prioritized report. |
| Performance Optimizer | `agents/performance-optimizer.agent.md` | Find/fix slowness: slow queries, N+1, re-renders, bundle size, memory leaks. Evidence-based. |
| Test Writer | `agents/test-writer.agent.md` | Write/expand unit, integration, and e2e tests; add regression tests for bug fixes. |
| Codebase Scout | `agents/codebase-scout.agent.md` | Fast read-only Q&A: where is X, how does Y work, what depends on Z. Shared foundation for other agents. |
| Migration / Data Agent | `agents/migration-data-agent.agent.md` | Schema migrations, seeding, backfills, dedupe, referential-integrity repair. Safety-first, Prisma/Postgres-strong. |
| Tooling Assistant | `agents/tooling-assistant.agent.md` | Audits the toolchain, finds under-used/missing tools, recommends or applies DX/CI/package improvements. |
| Roadmap & Changelog Agent | `agents/roadmap-changelog-agent.agent.md` | Turn stated goals into a roadmap + docs; write feature docs, changelogs, versions, release notes. |
| QA Verifier | `agents/qa-verifier.agent.md` | Verify a change (typecheck, lint, test, build). Last gate. |
| Implementation Planner | `agents/implementation-planner.agent.md` | Plan medium/large tasks before writing code. |
| Intent Reframer | `agents/intent-reframer.agent.md` | Turn a garbled/ambiguous request into precise intent. |
| Code Comment Guardian | `agents/code-comment-guardian.agent.md` | Zero-comment default; the only writer of comments. |
| Deployer | `agents/deployer.agent.md` | Release/publish to npm, GitHub, or any target. |
| SEO Auditor | `agents/seo-auditor.agent.md` | Audit technical SEO and search visibility. |
| Apple UI Expert | `agents/apple-ui-expert.agent.md` | Design or review any UI to Apple's design discipline. |
| Accessibility Auditor | `agents/accessibility-auditor.agent.md` | Read-only audit for WCAG/a11y issues. Produces a prioritized report. |

## Shared universal rules

The `instructions/` folder holds stack-independent guardrails that every agent
follows. They auto-apply to all source files:

| Rule | File |
| --- | --- |
| Comments: zero-comment default; only the Comment Guardian writes them | `instructions/comment-standards.instructions.md` |
| Icons: never modify an existing icon | `instructions/icon-protection.instructions.md` |
| Codebase navigation: probe/graph-first, then file browsing | `instructions/codebase-navigation.instructions.md` |
| Package installs: workspace-scoped, root for tooling only | `instructions/workspace-packages.instructions.md` |

## Pipeline

- Bugs: **Bug Hunter** (report) → **Code Architect** (root-cause fix) → **QA Verifier** (verify).
- Security: **Security Auditor** (report) → **Code Architect** (root-cause fix) → **QA Verifier** (verify).
- Any non-trivial change runs **QA Verifier** before it is considered done.
- Ambiguous requests route through **Intent Reframer** first.

## Adopting these agents in a new project

1. Copy this `.github/agents/` folder (agents) and the `.github/instructions/` folder (instructions) into the new project root.
2. Copy the unified dispatcher `AGENTS.md` into the project root (it routes any
   prompt to the right agent, skills, and instructions). Use the one shipped in
   `.github/AGENTS.md.dispatcher` as the template if you want a standalone copy.
3. Optionally open the top of each agent file you plan to use and fill in the
   `PROJECT CONTEXT` block to override auto-detection.
4. Copy the relevant `.github/skills/*` if the project will use domain skills.
5. That's it. The `AGENTS.md` reads each prompt, classifies it, and routes to the
   matching agent + skills automatically.
