---
name: "Repository instructions"
description: "Repository-level guidance for Copilot and contributors"
applyTo: "**"
---

Primary project config: see AGENTS.md

## General rules
- **Dependency rule**: Don't add packages without approval;
- **Test rule**: Run `npm run test` (unit) and `npm run test:e2e` (browser) before PRs; fix any failures.