# Project Overview

**Project:** SafeDrop
**Type:** Multi-part Monorepo
**Primary Languages:** TypeScript (Frontend & Backend)
**Architecture:** Client-Server with Web3 Integration

## Executive Summary

SafeDrop is a Security & Verification Infrastructure for the Airdrop Economy. It protects Web3 projects from Sybil attacks and drainer scams while providing a secure verification flow for users.

The system consists of:
1. **Frontend (`safedrop-front-main`)**: Next.js 16 application for auth, wallet connection, and verification flows.
2. **Backend (`safedrop-back-main`)**: NestJS API for auth/2FA, vault + grind verification, and partner analytics.

> **Full Stack Development**: Both `safedrop-front-main/` and `safedrop-back-main/` are editable.

## Key Features

- **Email-code sign-up + 2FA onboarding**
- **Vault + Grind verification with dual-signature linking**
- **Multi-CEX fallback + recovery flows**
- **Partner analytics with near-real-time SLA**

## Recent Plan Updates (2025-12-20)

- Canonical endpoints standardized under `/api/auth/*` and `/api/wallets/*`.
- Partner analytics scaling path defined (events + aggregates + cache).
- Reason-code enum defined for rejected verifications.

## Documentation Index

- [Master Index](./index.md)
- [Architecture - Frontend](./architecture-frontend.md)
- [Architecture - Backend](./architecture-backend.md)
- [Source Tree Analysis](./source-tree-analysis.md)
