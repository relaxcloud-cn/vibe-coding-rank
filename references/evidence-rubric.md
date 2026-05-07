# Evidence Rubric

Use observed evidence, not self-description.

## Invalid Evidence

Do not score these as user ability evidence:

- System prompts, developer instructions, tool policies, permission notes, or environment context.
- Auto-injected `AGENTS.md` / `CLAUDE.md` context shown to the model before work begins.
- Compacted conversation summaries unless they clearly summarize user-directed work and not policy/context.
- File paths, repo names, or keyword mentions without an observed behavior.
- Raw snippets that only say a tool exists, a framework exists, or a rule file exists.

Valid evidence must show the user or agent actually doing work: defining a goal, setting constraints, reviewing a plan, validating output, redesigning a module, creating a reusable workflow, or teaching the method to others.

## Positive Signals

### Context and Boundary

- Gives goals, non-goals, acceptance criteria.
- Limits files, modules, APIs, or data boundaries.
- Requires plan before edits.
- Mentions `AGENTS.md`, `CLAUDE.md`, `.cursor/rules`, skills, hooks, MCP, checklists.

Supports: 四品及以上.

### Vibe Generation

- Starts from vague idea or product feeling.
- Uses screenshots, UI taste, runtime feedback, logs, and natural language to shape output.
- Lets AI build runnable demos before full manual understanding.

Supports: 五品/六品 depending on control quality.

### System Ownership

- Asks AI to explain architecture and critical paths.
- Uses tests, lint, build, smoke checks, diff review.
- Refuses uncontrolled large changes.
- Switches from patching to redesign when the system shape is wrong.
- Handles production boundaries: auth, data, payment, security, monitoring, backup, rollback.

Supports: 五品 to 七品.

### Agent Orchestration

- Splits work between writer/reviewer/tester/researcher agents.
- Runs Best-of-N approaches.
- Uses independent review agent.
- Sets gates and checkpoints.

Supports: 六品/七品, or 八品 if made reusable for others.

### Team System

- Creates shared playbooks, reusable skills, rules, workflows, templates, evals.
- Helps team members adopt the method.
- Builds org-level AI engineering process.

Supports: 八品.

## Negative Signals

### Bug Loop Trap

- Repeatedly says "fix again" without adding context.
- Keeps feeding errors back with no root-cause analysis.
- Lets AI patch symptoms indefinitely.

Caps: usually 三品 unless later evidence shows boundary reset or redesign.

### Demo Without Ownership

- Accepts runnable code without understanding key paths.
- No validation beyond "it runs".
- Does not know where data/auth/payment/security live.

Caps: 二品/三品.

### Uncontrolled Agent

- Lets agent change many unrelated files.
- No file scope, no tests, no plan, no review.
- Accepts broad refactors for small tasks.

Caps: 三品/四品 depending on correction behavior.

### Thin Evidence

- Few records, mostly chat snippets.
- No project evidence.
- No validation traces.

Lower confidence and avoid high ranks.

## Rank Cap Rules

- No AI coding evidence: zero品.
- Only snippets/functions: one品.
- Demo evidence but no validation: two品.
- Feature delivery plus bug loops: three品.
- Boundaries and acceptance criteria: at least four品.
- Architecture/product goals plus gates: five品.
- Closed loop from problem definition to delivery: six品.
- System ownership with transparent tooling: seven品.
- Team replication evidence: eight品.
- Public paradigm-level influence: nine品.
