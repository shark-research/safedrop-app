---
description: Основной workflow для разработки новых фич в SafeDrop
---

# SafeDrop Feature Development Workflow

## ⚠️ CRITICAL RULE
**NEVER MODIFY BACKEND** - All changes in `safedrop-front-main/` only!

## 1. Product Discovery
// turbo
```bash
# Прочитать PRD и понять контекст
cat PRD_SafeDrop.md.resolved
```

Используй агента: `@product-manager`
- Сформулируй user story
- Определи acceptance criteria
- Задокументируй edge cases

## 2. Architecture Review
Используй агента: `@architect-reviewer`
- Проверь модульность решения
- Определи границы компонентов
- Убедись в совместимости с wallet интеграциями

## 3. Implementation
Используй агента: `@frontend-implementer`
// turbo
```bash
cd safedrop-front-main && npm run dev
```

- Пиши код только во frontend
- Следуй паттернам RainbowKit/Wagmi
- Используй существующие CSS переменные

## 4. Code Review
Используй агента: `@code-reviewer`
- Проверь качество кода
- Убедись в безопасности Web3 интеграций
- Проверь TypeScript типы

## 5. Testing
Используй агента: `@qa-tester`
// turbo
```bash
cd safedrop-front-main && npm run build
```

- Протестируй на EVM (MetaMask)
- Протестируй на Solana (Phantom)
- Проверь мобильную версию

## 6. Security Check
Используй агента: `@security-auditor`
- Аудит wallet безопасности
- Проверка на утечку credentials
- Валидация anti-drain архитектуры
