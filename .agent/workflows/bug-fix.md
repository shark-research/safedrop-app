---
description: Workflow для исправления багов в SafeDrop
---

# SafeDrop Bug Fix Workflow

## ⚠️ CRITICAL RULE
**NEVER MODIFY BACKEND** - Баги бэкенда эскалируй!

## 1. Reproduce
Используй агента: `@debugger`

// turbo
```bash
cd safedrop-front-main && npm run dev
```

- Воспроизведи баг
- Задокументируй шаги
- Определи: Wallet / CEX / UI?

## 2. Diagnose
- Проверь консоль браузера
- Проверь network tab
- Изолируй проблемный компонент

## 3. Fix
Используй агента: `@frontend-implementer`
- Минимальное изменение
- Сохрани существующую функциональность
- Добавь обработку ошибок

## 4. Verify
// turbo
```bash
cd safedrop-front-main && npm run build
```

- Баг исправлен
- Нет регрессий
- Работает на EVM + Solana

## 5. Review
Используй агента: `@code-reviewer`
- Проверь качество фикса
