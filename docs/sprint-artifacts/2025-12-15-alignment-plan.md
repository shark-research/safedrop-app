# Implementation Plan - Align with BMAD
> **Status**: Completed
> **Date**: 2025-12-15

## Goal
Ensure all project artifacts (PRD, Agents, Rules) reference the new BMAD documentation structure (`docs/`) and methodology to facilitate scaling.

## Executed Changes

### 1. Product Requirements (`PRD_SafeDrop.md.resolved`)
- [x] **Feature**: Add "Documentation & Architecture" section pointing to `docs/index.md`.
- [x] **Rationale**: The PRD should rely on living documentation for technical details.

### 2. System Prompts (`.agent/prompts/system-prompt.md`)
- [x] **Feature**: Add instruction: "ALWAYS check `docs/index.md` for latest architecture and code patterns."
- [x] **Rationale**: Agents must know where to look for the "truth".

### 3. Agent Definitions (`.agent/agents/`)
- [x] **Feature**: Verify if local agents need to import/reference BMAD capabilities.
- [x] **Rationale**: Prevent conflict between local `backend-developer` and BMAD's `dev` agent.

### 4. IDE Rules (`.cursorrules`, `.windsurfrules`)
- [x] **Feature**: Add rule: "Context: Read `docs/project-overview.md` for project structure."

## Verification
- Manual review of updated files.
- User confirmation.
