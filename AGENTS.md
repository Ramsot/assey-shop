# Universal Agent Dispatcher

This file is the **single entry point** for ALL agent activity in this
workspace. Read it first, classify the user's prompt, then route to the correct
agent(s) in `.github/agents/`, and load the relevant **skills** and
**instructions** based on what the prompt is about.

It is intentionally universal — the same dispatcher can run in any project. The
agent files live in `.github/agents/` and are project-agnostic (each adapts to the
stack it finds).

## How to use this file

1. **Read the user's prompt.**
2. **Classify** it using the Routing Engine below. Most tasks map to one primary
   agent; complex tasks map to a **pipeline** of several.
3. **Invoke** the matching agent file(s). A pipeline runs them in order.
4. **Load skills** whose topic the prompt touches (skills auto-apply by domain).
5. **Apply universal instructions** to every task.
6. If nothing matches cleanly, use the **default** agent (`code-architect`).

> If the prompt is ambiguous, garbled, or poorly worded, first route through
> **`intent-reframer`** to clarify intent, then route the refined prompt.

---

## The agent catalog (all in `.github/agents/`)

| Agent | File | Expert in |
| --- | --- | --- |
| Senior Code Architect | `code-architect.agent.md` | Building, refactoring, debugging, reviewing code, fixing type errors. **Default.** |
| Bug Hunter | `bug-hunter.agent.md` | Read-only hunt for REAL bugs; prioritized report. |
| Security Auditor | `security-auditor.agent.md` | Read-only audit for security vulnerabilities; prioritized report. |
| Performance Optimizer | `performance-optimizer.agent.md` | Find/fix slowness (queries, N+1, re-renders, bundles, leaks). Evidence-based. |
| Test Writer | `test-writer.agent.md` | Write/expand tests; add regression tests for fixes. |
| QA Verifier | `qa-verifier.agent.md` | Final gate: runs typecheck/lint/test/build; honest PASS/FAIL report. Never hides failures. |
| Codebase Scout | `codebase-scout.agent.md` | Fast read-only Q&A: where is X, how does Y work, what depends on Z. |
| Implementation Planner | `implementation-planner.agent.md` | Plan medium/large tasks before writing code. |
| Intent Reframer | `intent-reframer.agent.md` | Turn ambiguous/garbled requests into precise intent. |
| Code Comment Guardian | `code-comment-guardian.agent.md` | Zero-comment default; the only writer of comments. |
| Deployer | `deployer.agent.md` | Release/publish, versioning, changelog, git push. |
| SEO Auditor | `seo-auditor.agent.md` | Audit technical SEO and search visibility. |
| Apple UI Expert | `apple-ui-expert.agent.md` | Design or review any UI to Apple's design discipline. |
| Accessibility Auditor | `accessibility-auditor.agent.md` | Read-only audit for WCAG/a11y issues; prioritized report. |
| Migration / Data Agent | `migration-data-agent.agent.md` | Schema migrations, seeding, backfills, dedupe, data repair. |
| Tooling Assistant | `tooling-assistant.agent.md` | Audit toolchain; find/apply missing or under-used tools. |
| Roadmap & Changelog Agent | `roadmap-changelog-agent.agent.md` | Roadmaps, feature docs, changelogs, versions, release notes. |

---

## Routing Engine — classify the prompt

Read the prompt and pick the best match. If it matches multiple, run them as a
pipeline.

### Build / fix / refactor / debug (Code)

| If the prompt is about... | Route to |
| --- | --- |
| Write, build, refactor, review, fix type errors, reduce complexity, debug a bug to root cause | `code-architect` |
| *"Where is X?", "how does Y work?", "what depends on Z?", gather context* | `codebase-scout` |
| Plan a medium or large task before writing code | `implementation-planner` |
| Ambiguous/garbled/unclear request | `intent-reframer` → then re-route |

### Review / audit (find problems first)

| If the prompt is about... | Route to |
| --- | --- |
| *Find/fix bugs, audit for real bugs* | `bug-hunter` → `code-architect` → `test-writer` → `qa-verifier` |
| *Security, vulnerability, auth, injection, XSS, secrets, supply-chain* | `security-auditor` → `code-architect` → `qa-verifier` |
| *Slow, performance, N+1, bundle size, memory leak, optimize* | `performance-optimizer` |
| *Test it, verify it builds, typecheck/lint/test/build* | `qa-verifier` |
| *Write tests, cover this, regression test* | `test-writer` |

### Data / database (migrations)

| If the prompt is about... | Route to |
| --- | --- |
| *Migration, schema change, seed, backfill, dedupe, data repair, Prisma, PostgreSQL, DB* | `migration-data-agent` |

### UI / design / SEO

| If the prompt is about... | Route to |
| --- | --- |
| *UI, design, "make it look better", component/page, review visual design* | `apple-ui-expert` |
| *Accessibility, WCAG, contrast, keyboard nav, ARIA, screen reader, focus* | `accessibility-auditor` |
| *SEO, search visibility, robots, sitemap, structured data, meta* | `seo-auditor` |

### Release / deploy / versioning

| If the prompt is about... | Route to |
| --- | --- |
| *Release, publish, deploy, version, npm/GitHub push* | `deployer` |
| *Roadmap, changelog, release notes, feature docs, versioning docs* | `roadmap-changelog-agent` |

### Process / conventions / toolchain

| If the prompt is about... | Route to |
| --- | --- |
| *Comments: add/remove/audit* | `code-comment-guardian` |
| *Tooling, packages, formatter, linter, scripts, CI, DX improvements* | `tooling-assistant` |

### Default

**Senior Code Architect is the main character.** It is the standing persona and
default for every task; specialist agents are invoked only when a prompt clearly
maps to them, and code-architect always owns the final result. Its standards —
minimalism, correctness, security-awareness, no comments, and verification
before claiming done — apply to every task, even those routed through other
agents.

| If nothing matches | `.github/agents/code-architect.agent.md` |

---

## Pipelines (complex tasks run agents in order)

These are the standard multi-agent flows. Do not skip verification.

- **Bug fix:** `bug-hunter` (report) → `code-architect` (fix) → `test-writer`
  (regression test) → `qa-verifier` (verify).
- **Security fix:** `security-auditor` (report) → `code-architect` (fix) →
  `qa-verifier` (verify).
- **Feature:** `intent-reframer` (if unclear) → `implementation-planner` (plan)
  → `code-architect` (build) → `test-writer` (tests) → `qa-verifier` (verify) →
  `roadmap-changelog-agent` (feature docs).
- **Schema change:** `migration-data-agent` (migrate) → `code-architect` (update
  consuming code) → `qa-verifier` (verify).
- **Safe ordering rule:** when a prompt triggers an audit + a fix, the audit
  (read-only) always runs first and produces a report before any code changes.

---

## Skills — load by prompt topic

Skills auto-apply by domain. Load the matching skill(s) when the prompt is about
that topic. Skills live in `.github/skills/`.

| Prompt topic | Skill(s) to load |
| --- | --- |
| Web animation / motion ("what's it called when...", "animate this") | `animation-vocabulary`, `improve-animations`, `find-animation-opportunities`, `review-animations`, `emil-design-eng` |
| Apple-style / native / iOS-feeling UI | `apple-design`, `apple-ui-designer` |
| UI look & feel / design direction / "not templated" | `frontend-design`, `taste-skill`, `pick-ui-library`, `prototype` |
| Brand / reference design ("make it look like X", "use the X design") | pick a matching `DESIGN.md` from `.github/design/` and apply its tokens, typography, and component rules verbatim |
| Writing/editing web copy, blog posts, taglines, landing text, "make it sound human" | `humanize-copy` |
| TypeScript code / types / best practices | `typescript-best-practices` |
| MCP servers (build/debug) | `building-mcp-servers` |
| Delegating to subagents / compressed agent output | `cavecrew` |
| Token efficiency / "be brief" / compressed output | `caveman` (and `caveman-*` variants) |
| Reviewing a PR / diff | `caveman-review` |
| Writing a commit / commit message | `caveman-commit` |
| Any of the above with heavy agent delegation | `cavecrew` |

> Rule: load **at most the relevant few** skills, not all. Don't load `caveman`
> modes unless the user asked for compressed/brief mode. Keep the working set to
> what the prompt actually needs.

---

## Universal instructions — apply to every task

From `.github/instructions/`. These are stack-independent guardrails that apply
regardless of agent.

| Rule | Source |
| --- | --- |
| Comments: zero-comment default; only the Comment Guardian writes them | `.github/instructions/comment-standards.instructions.md` |
| Icons: never modify an existing icon | `.github/instructions/icon-protection.instructions.md` |
| Codebase navigation: probe/graph-first, then file browsing | `.github/instructions/codebase-navigation.instructions.md` |
| Package installs: workspace-scoped; root for dev tooling only | `.github/instructions/workspace-packages.instructions.md` |
| UI: overlay thin scrollbars everywhere + strict mobile/tablet/desktop responsive | `.github/instructions/ui-standards.instructions.md` |
| UI/design work: always ground it in a `DESIGN.md` from `.github/design/` (ask which one if the user hasn't specified) | `.github/design/` |
| UI/UX standard: no custom styling — adopt `docs/UI_UX_STANDARDS.md:1` login + dashboard tokens/components | `docs/UI_UX_STANDARDS.md:1` + `.github/instructions/ui-standards.instructions.md:1` |
| Code standard: single `code-architect` pipeline, verified ship — no AI code without routing | `docs/CODE_STANDARDS.md:1` + `.github/instructions/code-standards.instructions.md:1` |

Also carried in every agent via its `PROJECT CONTEXT` block: probe the real
project (stack, layout, commands) before acting — never assume.

---

## Universal rules

- **Evidence over assumptions.** Read the relevant files, probe the stack, and
  verify before changing or claiming anything.
- **Correctness first.** Prefer the smallest correct, maintainable change.
- **Verifier is the gate.** Any non-trivial change runs `qa-verifier` before it
  is considered done.
- **Read-only audits first.** Auditors never edit; they produce a report for the
  fixer.
- **Secrets are the user's.** Never capture or enter credentials, OTPs, or
  passphrases; hand off to the user.
- **Git discipline.** Stage specific files, never `git add -A` from a monorepo
  root.

---

## Icons — HARD PROHIBITION

Never modify, refactor, redesign, simplify, or change any existing icon.
- Use provided SVG/JSX/components exactly, byte for byte.
- Never simplify paths, change `viewBox`, alter fills/colors, or restructure.
- You may only add a brand-new icon without touching existing exports.
- If a replacement is needed, ask the user for the exact icon and use it verbatim.
Full protocol: `.github/instructions/icon-protection.instructions.md`
