---
description: Инструкция по настройке AI агентов для проекта SafeDrop (любая LLM, любая IDE)
---

# SafeDrop AI Agent Setup - Universal Guide

## Поддерживаемые IDE и LLM

| IDE/Tool | Config File | LLM |
|----------|-------------|-----|
| Cursor | `.cursorrules` | Claude, GPT-4 |
| Windsurf | `.windsurfrules` | Claude |
| VS Code + Copilot | `.vscode/settings.json` | GPT-4 |
| VS Code + Continue | `.vscode/settings.json` | Any |
| Any Chat (Web) | `.agent/prompts/system-prompt.md` | Any |

---

## Option 1: Cursor IDE (Рекомендуется)

Cursor автоматически читает `.cursorrules` из корня проекта.

// turbo
```bash
# Проверить что файл на месте
type .cursorrules
```

Просто открой проект в Cursor - готово!

---

## Option 2: Windsurf/Codeium

Windsurf читает `.windsurfrules`.

// turbo
```bash
type .windsurfrules
```

---

## Option 3: VS Code + GitHub Copilot

Настройки в `.vscode/settings.json` уже добавлены.
Copilot Chat будет использовать custom instructions автоматически.

---

## Option 4: VS Code + Continue Extension

1. Установи Continue extension
2. Настройки уже в `.vscode/settings.json`
3. Можешь использовать любую LLM (OpenAI, Anthropic, Ollama, etc.)

---

## Option 5: Любой Chat UI (ChatGPT, Claude Web, Gemini)

1. Открой `.agent/prompts/system-prompt.md`
2. Скопируй содержимое
3. Начни новый чат
4. Вставь как первое сообщение или в System Prompt (если доступно)

---

## Option 6: API Integration (OpenAI, Anthropic API)

```python
# Python example
with open('.agent/prompts/system-prompt.md') as f:
    system_prompt = f.read()

# OpenAI
response = openai.chat.completions.create(
    model="gpt-4",
    messages=[
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": "Add a loading spinner to wallet button"}
    ]
)

# Anthropic
response = anthropic.messages.create(
    model="claude-3-opus-20240229",
    system=system_prompt,
    messages=[{"role": "user", "content": "..."}]
)
```

---

## Специализированные агенты

Для конкретных задач используй промпты из `.agent/prompts/`:

| Файл | Когда использовать |
|------|-------------------|
| `system-prompt.md` | **Всегда первым** - базовый контекст |
| `product-manager.txt` | User stories, requirements |
| `architect.txt` | Архитектурные решения |
| `implementer.txt` | Написание кода |
| `reviewer.txt` | Code review |
| `debugger.txt` | Исправление багов |
| `security.txt` | Security audit |
| `blockchain.txt` | Web3 интеграции |
| `tester.txt` | QA тестирование |

### Комбинирование промптов

Для сложных задач комбинируй:
```
[system-prompt.md] + [implementer.txt]
```

---

## Файловая структура

```
safedrop-app/
├── .cursorrules             # Cursor IDE
├── .windsurfrules           # Windsurf/Codeium
├── .vscode/settings.json    # VS Code + Copilot/Continue
├── CLAUDE.md                # Claude Code CLI
└── .agent/
    ├── README.md            # Документация
    ├── prompts/             # Универсальные промпты
    │   ├── system-prompt.md # Главный промпт
    │   ├── product-manager.txt
    │   ├── architect.txt
    │   ├── implementer.txt
    │   ├── reviewer.txt
    │   ├── debugger.txt
    │   ├── security.txt
    │   ├── blockchain.txt
    │   └── tester.txt
    ├── agents/              # Claude Code специфичные
    └── workflows/           # Рабочие процессы
```

---

## ⚠️ КРИТИЧЕСКОЕ ПРАВИЛО

Все промпты включают:

> **НИКОГДА НЕ ИЗМЕНЯТЬ `safedrop-back-main/`**
> 
> Бэкенд заморожен. Только frontend изменения.
