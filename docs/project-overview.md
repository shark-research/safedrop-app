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

> **✅ Full Stack Development**: Both `safedrop-front-main/` and `safedrop-back-main/` are editable.

## Repository Structure

The project is organized as a multi-part repository:

| Part | Type | Path | Tech Stack | Status |
|------|------|------|------------|--------|
| **Frontend** | Web | `safedrop-front-main/` | Next.js 16, React 19, TailwindCSS, Wagmi | ✅ Active Development |
| **Backend** | Backend | `safedrop-back-main/` | NestJS 11, Swagger, Axios | ✅ Active Development |

## Key Features

- **Multi-Chain Support**: Ethereum (and EVM L2s) + Solana.
- **Deep Exchange Integration**: Verification via 9+ CEXs (Binance, OKX, Bybit, etc.).
- **Anti-Sybil/Drainer Protection**: Core business logic for airdrop security.

## Recent Backend Updates (2025-12-20)

- Added Grind linking flow with RPC new-wallet checks, DB first-use gate, and dual signatures.
- Added BlockchainService for Solana (web3.js) + EVM (ethers).
- Added Postgres-backed grind link repository with transaction lock.
- Added Project Integration service + endpoint `POST /api/verification/link-grind`.
- Added implementation notes in docs.

## Documentation Index

- [Master Index](./index.md)
- [Architecture - Frontend](./architecture-frontend.md)
- [Architecture - Backend](./architecture-backend.md)
- [Source Tree Analysis](./source-tree-analysis.md)
