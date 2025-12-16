# Project Overview

**Project:** SafeDrop
**Type:** Multi-part Monorepo
**Primary Languages:** TypeScript (Frontend & Backend)
**Architecture:** Client-Server with Web3 Integration

## Executive Summary

SafeDrop is a Security & Verification Infrastructure for the Airdrop Economy. It protects Web3 projects from Sybil attacks and drainer scams while providing a secure verification flow for users.

The system consists of:
1. **Frontend (`safedrop-front-main`)**: A modern Next.js 16 application for user interaction, wallet connection (EVM & Solana), and exchange verification.
2. **Backend (`safedrop-back-main`)**: A NestJS API service that validates wallet activities against centralized exchanges (Binance, OKX, etc.).

> **⚠️ CRITICAL RULE:** The backend (`safedrop-back-main/`) is currently **READ-ONLY**. All active development must occur in the frontend.

## Repository Structure

The project is organized as a multi-part repository:

| Part | Type | Path | Tech Stack | Status |
|------|------|------|------------|--------|
| **Frontend** | Web | `safedrop-front-main/` | Next.js 16, React 19, TailwindCSS, Wagmi | ✅ Active Development |
| **Backend** | Backend | `safedrop-back-main/` | NestJS 11, Swagger, Axios | ⏸️ Read-Only |

## Key Features

- **Multi-Chain Support**: Ethereum (and EVM L2s) + Solana.
- **Deep Exchange Integration**: Verification via 9+ CEXs (Binance, OKX, Bybit, etc.).
- **Anti-Sybil/Drainer Protection**: Core business logic for airdrop security.

## Documentation Index

- [Master Index](./index.md)
- [Architecture - Frontend](./architecture-frontend.md)
- [Architecture - Backend](./architecture-backend.md)
- [Source Tree Analysis](./source-tree-analysis.md)
