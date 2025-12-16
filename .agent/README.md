# SafeDrop AI Agents

## ⚠️ BACKEND RULE
`safedrop-back-main/` is **READ-ONLY** — read and document only, no modifications.

## 20 Available Agents

### Core Development
| Agent | Role | Status |
|-------|------|--------|
| `frontend-implementer` | Next.js/React code | ✅ Active |
| `backend-developer` | NestJS code | ⏸️ Read only |
| `nextjs-developer` | Next.js 16 specifics | ✅ Active |
| `react-specialist` | React 19 patterns | ✅ Active |
| `typescript-pro` | TypeScript types | ✅ Active |
| `blockchain-specialist` | Wagmi/Solana | ✅ Active |

### Design & UX
| Agent | Role | Status |
|-------|------|--------|
| `ui-designer` | Visual design, components | ✅ Active |
| `ux-researcher` | User research, flows | ✅ Active |

### Quality & Security
| Agent | Role | Status |
|-------|------|--------|
| `architect-reviewer` | Architecture review | ✅ Active |
| `code-reviewer` | Code quality | ✅ Active |
| `security-auditor` | Web3 security | ✅ Active |
| `qa-tester` | Testing | ✅ Active |
| `debugger` | Bug fixing | ✅ Active |
| `performance-engineer` | Web Vitals | ✅ Active |

### Business & Product
| Agent | Role | Status |
|-------|------|--------|
| `product-manager` | User stories | ✅ Active |
| `project-manager` | Coordination | ✅ Active |

### Infrastructure & DX
| Agent | Role | Status |
|-------|------|--------|
| `api-designer` | API contracts | ✅ Active |
| `devops-engineer` | CI/CD, deploy | ✅ Active |
| `docs-engineer` | Documentation | ✅ Active |
| `refactoring-specialist` | Tech debt | ✅ Active |

## Usage

### In Cursor/Claude Code
```
@ui-designer Create a new wallet connection button
@code-reviewer Check the changes in StepCard.tsx
```

### In Chat (GPT/Gemini)
Copy content from `.agent/agents/[agent].md` and paste to chat.

## Workflows
- `/feature-development` — New features
- `/bug-fix` — Bug fixing
- `/claude-setup` — Setup guide

## Files
- `.cursorrules` — Cursor IDE
- `.windsurfrules` — Windsurf
- `.vscode/settings.json` — Copilot/Continue
- `CLAUDE.md` — Claude Code / Antigravity
- `.agent/prompts/` — Universal prompts
