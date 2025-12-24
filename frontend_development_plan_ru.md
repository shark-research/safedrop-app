# 🎨 План разработки фронтенда SafeDrop

**Роли:** frontend-implementer, nextjs-developer, ui-designer

***

## 🔎 Текущее состояние (As-Is)

### ✅ Что работает
- Next.js 16 + React 19 UI с 4-шаговым степпером
- Подключение EVM (RainbowKit/Wagmi) и Solana-кошельков
- Мок-флоу верификации через CEX API-ключи
- Базовая структура компонентов

### ❗ Критические пробелы

| Пробел | Описание |
|-----|----------|
| **Сценарии Vault/Grind** | UI работает на моках, реальные сценарии отсутствуют |
| **Роуты верификации** | Нет `/verify/vault` и `/verify/grind` |
| **API-клиент** | Ограничен одним эндпоинтом, нет полноценного API-слоя |
| **Партнерский портал** | Отсутствует UI для партнеров |
| **UX связывания кошельков** | Нет подтверждения двумя подписями |
| **Флоу восстановления** | UI для восстановления Vault отсутствует |

***

## ✅ Сквозной пользовательский флоу (вход/регистрация -> 2FA -> Vault -> Grind -> Привязка -> Socials/SSO)
1. **Вход** через Google или кошелек (только для уже привязанных аккаунтов). Если не привязан, пользователь должен зарегистрироваться.
2. **Регистрация** только по коду из email (без регистрации через Google).
3. **2FA (Google Authenticator)** предлагается сразу после регистрации. Требуется для любых действий по привязке/добавлению/изменению (vault/burner/social/security), но не требуется для входа через Google/кошелек.
4. **Подключение Vault**: подпись challenge -> подтверждение через CEX API -> первые 3 депозита по данным DeBank.
5. **Подключение Grind (Burner)**: нужен минимум 1 on-chain депозит -> верификация через CEX API относительно первых депозитов Vault.
6. **Связывание двумя подписями** для Vault + Grind.
7. **Привязка соцсетей** и опциональное включение **passkey/биометрии** (WebAuthn) для SSO.

***

## 🧩 Фаза 4: UI идентификации и безопасности (2-3 недели)

### Epic 6.0: UI аутентификации и привязки аккаунтов (NEW)
- [ ] Роуты: `src/app/sign-in/page.tsx`, `src/app/sign-up/page.tsx`, `src/app/settings/security/page.tsx`
- [ ] Варианты входа: Google OAuth + кошелек (только если уже привязан)
- [ ] Регистрация по коду из email (без регистрации через Google)
- [ ] Привязка/отвязка Google + кошелька в настройках
- [ ] Список сессий/устройств + выход со всех устройств

**AC:**
- Если провайдер не привязан, показывать флоу 'Не привязан - зарегистрируйтесь по коду из email'
- Понятные состояния ошибок для 'уже привязан к другому аккаунту'
- Вход через Google/кошелек не требует 2FA

### Epic 6.0b: UI 2FA (TOTP) (NEW)
- [ ] Мастер настройки: QR-код, проверка, резервные коды
- [ ] Показывать настройку 2FA сразу после регистрации
 - [ ] Модальное окно запроса 2FA для действий привязки/добавления/изменения (vault/burner/socials/security)
- [ ] Отключение 2FA по коду + подтверждение

### Epic 6.0c: Соцсети + Passkeys (SSO) (NEW)
- [ ] Привязка Twitter/Discord в настройках
- [ ] Регистрация WebAuthn passkey + опция входа
- [ ] UI статуса (включено/выключено, последнее использование)

## 🧩 Фаза 5: флоу фронтенда (2-3 недели)

### Epic 6.1: `/verify/vault` UI

**Компоненты:**
- [ ] `VaultConnect` - подключение кошелька + challenge для подписи
- [ ] `CEXAuth` - флоу API-ключей
- [ ] `VerificationResult` - отображение Trust Score с разбивкой по факторам

**Пользовательский флоу:**
```
1. Подключить кошелек → подписать challenge/nonce
2. Верификация CEX → API-ключи
3. Анализ DeBank → on-chain проверка (первые 3 депозита)
4. Результат Trust Score → отображение факторов
```

**Задачи:**
- [ ] Роут страницы: `src/app/verify/vault/page.tsx`
- [ ] Компонент `VaultConnect` с подписью сообщений
- [ ] `CEXAuthModal` с выбором биржи и API-ключей
- [ ] `TrustScoreCard` с визуализацией факторов (круговая диаграмма)
- [ ] Состояния успеха/ошибки с подсказками

**AC:** Успешная верификация отображается с разбивкой по факторам

---

### Epic 6.2: `/verify/grind` UI

**Флоу:**
1. Проанализировать Grind → показать предупреждения (если legacy-кошелек)
2. Верифицировать Grind → отображение условной логики
3. Связать Grind → подтверждение двумя подписями

**Компоненты:**
- [ ] `GrindAnalyzer` - анализ состояния кошелька
- [ ] `GrindWarnings` - предупреждения для legacy-кошельков
- [ ] `DualSignatureFlow` - подтверждение обеих подписей
- [ ] `LinkingSuccess` - результат связывания

**Задачи:**
- [ ] Роут страницы: `src/app/verify/grind/page.tsx`
- [ ] Анализ состояния кошелька (fresh/legacy/vault-funded)
- [ ] Если нет входящего депозита, блокировать флоу и показывать сообщение 'Пополните кошелек одним депозитом'
- [ ] UI предупреждений для кошельков с ненулевой историей
- [ ] **UI выбора CEX:** 'Предоставьте API для одного из обнаруженных источников CEX из `detected_cex_sources` (макс. 3)'
- [ ] Модальный флоу с двумя подписями

**UX-флоу для пользователя:**
```
Пользователь подключает старый кошелек Grind (2022)

SafeDrop:
  ⚠️ 'У этого кошелька есть история транзакций с 2022 года'
  🔍 'Проверяем источник пополнения...'
  
  [Если НЕТ совпадений ни с одним обнаруженным CEX]:
  ❌ 'Не можем подтвердить, что этот кошелек принадлежит вам'
  ✅ 'Варианты:'
     1. Создать новый burner-кошелек (1 клик)
     2. Использовать кошелек, пополненный с вашего аккаунта CEX
     3. Предоставить API для одного из обнаруженных CEX-источников
```

**AC:** Показывать предупреждения + подсказки для краевых случаев

---

### Epic 6.3: Интеграция API-клиента

**Новые API-эндпоинты:**
```typescript
// src/api/authApi.ts
export const startEmailLogin = async (email: string) => { ... }
export const verifyEmailCode = async (email: string, code: string) => { ... }
export const googleSignIn = async (idToken: string) => { ... }
export const walletChallenge = async (address: string) => { ... }
export const walletVerify = async (address: string, signature: string) => { ... }
export const refreshSession = async () => { ... }
export const logout = async () => { ... }

// src/api/vaultApi.ts
export const verifyVault = async (address: string, signature: string) => { ... }
export const verifyGrind = async (grindAddress: string, vaultAddress: string) => { ... }
export const linkWallets = async (vaultSig: string, grindSig: string) => { ... }
export const getTrustScore = async (vaultHash: string) => { ... }
```

**Задачи:**
- [ ] Создать `src/api/authApi.ts`
- [ ] Создать `src/api/vaultApi.ts`
- [ ] Создать `src/api/grindApi.ts`
- [ ] Создать `src/api/partnerApi.ts`
- [ ] Создать `src/api/securityApi.ts` (2FA, passkeys, socials)
- [ ] Добавить логику retry/backoff
- [ ] Обработка ошибок с понятными пользователю сообщениями
- [ ] Типы TypeScript для всех ответов

**AC:** Все запросы имеют retry/backoff и обработку ошибок

---

### Epic 6.4: UI партнерского портала (масштабирование)

**Функциональность:**
- Дашборд кампаний (создание, список, закрытие)
- Запросы Trust Score
- Дашборд аналитики: итоги, временные ряды, процент одобрения, средний Trust Score, причины отказов
- Индикатор свежести данных (последнее обновление + SLA)

**Требования к UI аналитики (пошагово):**
1. **Полоса итогов**
   - Проверено, Одобрено, Отклонено, В ожидании, Связано
   - Расположена над графиком для быстрого просмотра

2. **График временных рядов**
   - Дневные значения за последние 7/30 дней (переключатель)
   - Опциональный почасовой вид за последние 24ч

3. **Метрики здоровья**
   - Процент одобрения (%)
   - Средний Trust Score
   - Медианная/P95 задержка верификации (мс)

4. **Панель причин отказов**
   - Топ причин отказа с количеством
   - Подсказка с описанием причины

**Сопоставление кодов причин (лейбл + тултип):**
- `SIGNATURE_INVALID` - 'Подпись недействительна' - Проверка подписи пользователя не прошла
- `CEX_API_INVALID` - 'CEX API невалиден' - API-ключи невалидны или не имеют нужных прав
- `CEX_MASTER_MISMATCH` - 'Несоответствие аккаунта' - Хэш мастер-аккаунта не совпадает с vault
- `NO_CEX_ACCESS_FOR_FIRST_3_DEPOSITS` - 'Нет доступа к CEX' - Нет API для бирж первых 3 депозитов
- `CEX_SOURCE_MISMATCH` - 'Несоответствие источника пополнения' - Grind пополнен с другой биржи
- `TEMPORAL_IMPOSSIBILITY` - 'Временное несоответствие' - Grind пополнен раньше vault или раньше создания аккаунта CEX
- `LOW_CONFIDENCE_CORRELATION` - 'Низкая корреляция' - Корреляция по времени/сумме ниже порога
- `ONCHAIN_HISTORY_UNAVAILABLE` - 'История недоступна' - Невозможно получить историю первых депозитов
- `NO_ONCHAIN_ACTIVITY` - 'Нет on-chain активности' - У Grind-кошелька нет входящих депозитов
- `MIN_TRUST_SCORE_NOT_MET` - 'Trust Score слишком низкий' - Ниже минимального порога кампании
- `VAULT_COMPROMISED` - 'Vault скомпрометирован' - Vault помечен как скомпрометированный/восстановленный
- `GRIND_ALREADY_LINKED` - 'Уже привязан' - Grind уже привязан/верифицирован
- `CAMPAIGN_CLOSED` - 'Кампания закрыта' - Кампания не принимает новые верификации
- `UNSUPPORTED_CHAIN` - 'Неподдерживаемая сеть' - Сеть не разрешена для кампании
- `OTHER` - 'Другое' - Фолбэк, когда причина неизвестна

5. **Фильтры**
   - Выбор кампании
   - Диапазон дат: 24ч / 7д / 30д / все
   - Фильтр по статусу (одобрено/отклонено/в ожидании)

6. **Свежесть и доверие**
   - `last_updated_at` показывается рядом с итогами
   - Если данные старше SLA, показывать предупреждающий бейдж

**Задачи:**
- [ ] Роут страницы: `src/app/partner/page.tsx`
- [ ] Компонент `CampaignList`
- [ ] Компонент `CampaignCreateForm`
- [ ] Компонент `TrustScoreQuery`
- [ ] Компонент `AnalyticsDashboard`
- [ ] Подкомпоненты: `TotalsStrip`, `TimeSeriesChart`, `RejectReasonsTable`, `ApprovalRateCard`, `LastUpdatedBadge`
- [ ] Аутентификация Partner API + role gate
- [ ] Авто-обновление (polling 15-30с) + кнопка ручного обновления
- [ ] Опциональный optimistic increment для локальных действий сессии
- [ ] Сообщения empty/zero-state для новых кампаний

**AC:**
- Числа аналитики обновляются в рамках SLA (<= 60с)
- UI показывает last_updated_at и статус обновления
- Нет вводящих в заблуждение устаревших метрик для недавно верифицированных пользователей

---

### Epic 6.5: UX связывания кошельков

**Флоу с двумя подписями:**
```
1. Запрос подписи Vault → показать UI ожидания
2. Запрос подписи Grind → показать UI ожидания
3. Проверка обеих подписей → анимация успеха
4. Связка создана → экран подтверждения
```

**Задачи:**
- [ ] Компонент `DualSignatureModal`
- [ ] Пошаговый визуальный прогресс
- [ ] Подсказки при запросе подписей
- [ ] Состояния успеха/ошибки
- [ ] Отображение хэша транзакции

**AC:** Обе подписи подтверждены, показаны успех/ошибка

---

### Epic 6.6: UI восстановления Vault (NEW)

**Компонент алерта:**
```jsx
┌────────────────────────────────────────────────────────┐
│ ⚠️  Ваш Vault был скомпрометирован                     │
│                                                        │
│ Верифицируйте его как burner, чтобы восстановиться     │
│ безопасно                                              │
│                                                        │
│ • Создайте новый чистый vault                          │
│ • Проверьте через тот же CEX API                       │
│ • Перепривяжите burner-кошельки (1 клик)               │
│ • Верните ваш Trust Score                              │
│                                                        │
│ [Начать восстановление Vault →]                        │
└────────────────────────────────────────────────────────┘
```

**Задачи:**
- [ ] Компонент `VaultCompromisedAlert`
- [ ] Мастер восстановления (3 шага, модалка):
  - Шаг 1: Создать новый Vault
  - Шаг 2: Верификация через CEX API (тот же master account)
  - Шаг 3: Перепривязка кошельков Grind
- [ ] Интерфейс перепривязки burner (один клик на каждый Grind)
- [ ] UI отслеживания статуса

**AC:**
- Пользователь видит алерт при компрометации Vault
- Может создать recovery vault через мастер
- Может перепривязать Grind в один клик

***

## ✨ Дополнительные фичи фронтенда

### Epic 6.7: UI выбора кампании
**Задачи:**
- [ ] Компонент `CampaignSelector`
- [ ] Карточки кампаний с деталями партнера
- [ ] Бейджи статуса активна/завершена
- [ ] Отображение требований конкретной кампании

### Epic 6.8: Визуализация Trust Score
**Компоненты:**
- [ ] `TrustScoreCard` - основное отображение Trust Score
- [ ] `FactorBreakdown` - круговая или столбчатая диаграмма
- [ ] `SignalBadges` - HIGH_CEX_VOLUME и т.д.
- [ ] `RiskFlagsAlert` - предупреждающие бейджи

***

## 🎨 Рекомендации по UI/UX

### Система дизайна
```css
/* CSS Variables */
--background: #0a0a0a;
--foreground: #ededed;
--sefa-mint: #22D3EE;
--sefa-cyan: #22D3EE;
--dark: #191919;
```

### Паттерны компонентов
- Использовать RainbowKit `ConnectButton` для EVM
- Использовать Solana Wallet Adapter `WalletMultiButton` для Solana
- TailwindCSS 4.x для стилизации
- Компоненты shadcn/ui где уместно
- Framer Motion для анимаций

### Доступность
- [ ] Навигация с клавиатуры
- [ ] Поддержка скринридеров
- [ ] Соответствие контрастности
- [ ] Состояния загрузки для асинхронных операций

***

## 🔗 Точки интеграции API

### Бэкенд-эндпоинты для использования

**Пользовательский API:**
```typescript
POST /api/auth/email/start
POST /api/auth/email/verify
POST /api/auth/oauth/google
POST /api/auth/wallet/challenge
POST /api/auth/wallet/verify
POST /api/auth/link/google
POST /api/auth/link/wallet
POST /api/auth/sessions/refresh
POST /api/auth/logout
POST /api/auth/2fa/setup
POST /api/auth/2fa/verify
POST /api/auth/2fa/disable
POST /api/auth/passkey/register/options
POST /api/auth/passkey/register/verify
POST /api/auth/passkey/authenticate/options
POST /api/auth/passkey/authenticate/verify
POST /api/socials/link
POST /api/socials/unlink
POST /api/wallets/verify-vault
POST /api/wallets/verify-grind
POST /api/wallets/link-grind
POST /api/wallets/report-compromised
POST /api/wallets/verify-vault-recovery
POST /api/wallets/relink-grind
GET /api/trust-scores/:vault_hash
GET /api/campaigns
```

**Partner API (портал):**
```typescript
POST /api/partners/register
POST /api/campaigns
GET /api/campaigns/:id
PATCH /api/campaigns/:id/close
GET /api/partners/analytics
```

Дополнительные пути auth/security:
- `safedrop-front-main/src/app/sign-in/page.tsx`
- `safedrop-front-main/src/app/sign-up/page.tsx`
- `safedrop-front-main/src/app/settings/security/page.tsx`
- `safedrop-front-main/src/api/authApi.ts`
- `safedrop-front-main/src/api/securityApi.ts`
- `safedrop-front-main/src/components/auth/*`
- `safedrop-front-main/src/components/security/*`

***

## 🏁 Распределение по спринтам (FINAL)

| Спринт | Недели | Фокус | Результат |
|--------|--------|-------|-----------|
| **Спринт 0** | 1-2 | Фаза 0 + Auth/2FA | БД + схемы + Auth + 2FA core |
| **Спринт 1** | 3-4 | Фаза 1 (Часть 1) | Подписи + CEX API |
| **Спринт 2** | 5-6 | Фаза 1 (Часть 2) + **Epic 2.6** | DeBank + корреляция + Trust Score v1 + **Multi-CEX + Recovery** |
| **Спринт 3** | 7-8 | Фаза 2 (Часть 1) + **Epic 3.1 UPDATED** | **Условная верификация (требуется CEX API)** + on-chain анализ |
| **Спринт 4** | 9-10 | Фаза 2 (Часть 2) | Связывание двумя подписями + No-honeypot |
| **Спринт 5** | 11-12 | Фаза 3 | API кампаний + эндпоинт Trust Score |
| **Спринт 6** | 13-14 | Фаза 4 + Фаза 5 | Auth UI + /verify/vault + /verify/grind + **UI восстановления** |
| **Спринт 7** | 15-16 | Фаза 4 | Fingerprinting + кластеризация графа |
| **Спринт 8** | 17-18 | Фаза 5 | Partner Portal + улучшения UX |
| **Спринт 9** | 19-20 | Фаза 6 | Тесты + Observability + Security audit |

**Итого:** ~20 недель (5 месяцев) до Production-Ready

***

## 📌 Ближайшие шаги (Неделя 1)

1. **Создать структуру роутов**
   - `src/app/sign-in/page.tsx`
   - `src/app/sign-up/page.tsx`
   - `src/app/settings/security/page.tsx`
   - `src/app/verify/vault/page.tsx`
   - `src/app/verify/grind/page.tsx`
   - `src/app/partner/page.tsx`

2. **Реализовать модули API-клиента**
   - `src/api/authApi.ts`, `src/api/securityApi.ts`
   - `src/api/vaultApi.ts`, `src/api/grindApi.ts`, `src/api/partnerApi.ts`
   - Добавить обертки для recovery эндпоинтов

3. **Собрать UI для Auth + 2FA**
   - Вход (Google + кошелек) + регистрация по коду из email
   - Настройка 2FA + модалка step-up prompt

4. **Собрать UI верификации Vault**
   - `VaultConnect` + `CEXAuthModal`
   - Список CEX берется из `detected_cex_sources`

5. **Собрать UI верификации Grind**
   - `GrindAnalyzer`, `GrindWarnings`, `DualSignatureFlow`
   - Выбор CEX согласован с бэкенд-источниками

6. **Подключить UI восстановления**
   - `VaultCompromisedAlert` + `RecoveryWizard`
   - Подключить к recovery эндпоинтам

***

## ❓ Открытые вопросы (требуют решения перед стартом)

| # | Вопрос | Рекомендация |
|---|--------|--------------|
| **1** | Какие CEX поддерживаем в MVP API? | API-ключи по биржам (CEX) |
| **2** | MVP только EVM или Solana + EVM? | Сначала EVM, Solana - в Phase 2 |
| **3** | Как связывать `user_uid` с `vault_hash`? | JWT-токен, сопоставление в памяти |
| **4** | Порог уверенности для Grind? | Fresh: **требуется CEX API**, Legacy: 70% |
| **5** | Что делать при rate limit DeBank? | Фолбэк через direct RPC |
| **6** | Что делать если все 3 CEX утеряны? | REJECT (вероятно скамер), но можно добавить ручную проверку |

***

## ✅ Критерии успеха (Definition of Done)

### MVP Core (Phase 0-2):
- [ ] Регистрация только по коду из email (без регистрации через Google)
- [ ] Вход через Google/кошелек для привязанных аккаунтов
- [ ] 2FA требуется для действий привязки/добавления/изменения (vault/burner/social/security), но не требуется для логина
- [ ] Grind требует как минимум 1 on-chain депозит до верификации
- [ ] Верификация Vault работает end-to-end
- [ ] **Первые 3 депозита сохраняются** как фолбэк
- [ ] Верификация Grind **требует CEX API** (без авто-аппрува)
- [ ] **Пользователь может верифицироваться через ЛЮБОЙ из 3 CEX**
- [ ] **Флоу восстановления Vault работает**
- [ ] No-honeypot: Grind адрес не сохраняется
- [ ] API-документация актуальна

### B2B Ready (Phase 3-4):
- [ ] Партнерские API-эндпоинты работают
- [ ] Push-webhook отправляется партнерам
- [ ] Anti-Sybil кластеризация работает

### Production (Phase 6):
- [ ] 80%+ покрытие тестами
- [ ] Observability настроена
- [ ] Security audit пройден

***

## 📚 Источники

Информация собрана из:
- **[audit.md]** - анализ разрывов + бэклог + глубокий разбор
- **[rules.txt]** - полная структура репозитория + технологический стек
- **[PRD.txt]** - текущая функциональность + улучшения
- **[CLAUDE.md]** - AI-агенты + workflows
- **[SafeDrop 40 questions.docx]** - бизнес-логика (модель Burner→Vault)
- **Диалоги с пользователем** - уточнения по Multi-CEX fallback, Vault Recovery, логике верификации Grind

***

## 🗂️ Структура файлов

```
safedrop-front-main/src/
├── app/
│   ├── verify/
│   │   ├── vault/page.tsx        # NEW
│   │   └── grind/page.tsx        # NEW
│   ├── partner/
│   │   └── page.tsx              # NEW
│   └── page.tsx                   # Existing
├── components/
│   ├── vault/
│   │   ├── VaultConnect.tsx      # NEW
│   │   ├── CEXAuth.tsx           # NEW
│   │   ├── TrustScoreCard.tsx    # NEW
│   │   └── VaultCompromisedAlert.tsx  # NEW (Recovery)
│   ├── grind/
│   │   ├── GrindAnalyzer.tsx     # NEW
│   │   ├── GrindWarnings.tsx     # NEW
│   │   ├── DualSignatureFlow.tsx # NEW
│   │   └── CEXSelectionModal.tsx # NEW (Multi-CEX)
│   ├── partner/
│   │   ├── CampaignList.tsx      # NEW
│   │   └── AnalyticsDashboard.tsx # NEW
│   └── recovery/
│       ├── RecoveryWizard.tsx    # NEW
│       └── BurnerRelinkCard.tsx  # NEW
├── api/
│   ├── index.ts                   # Existing
│   ├── vaultApi.ts               # NEW
│   ├── grindApi.ts               # NEW
│   └── partnerApi.ts             # NEW
└── providers/
    └── Web3Provider.tsx           # Existing
```

***

## ⚠️ Зависимости

### Со стороны бэкенда (должно быть готово):
- `POST /api/auth/email/start`
- `POST /api/auth/email/verify`
- `POST /api/auth/oauth/google`
- `POST /api/auth/wallet/challenge`
- `POST /api/auth/wallet/verify`
- `POST /api/auth/link/google`
- `POST /api/auth/link/wallet`
- `POST /api/auth/2fa/setup`
- `POST /api/auth/2fa/verify`
- `POST /api/auth/2fa/disable`
- `POST /api/auth/passkey/register/options`
- `POST /api/auth/passkey/register/verify`
- `POST /api/auth/passkey/authenticate/options`
- `POST /api/auth/passkey/authenticate/verify`
- `POST /api/socials/link`
- `POST /api/socials/unlink`
- `POST /api/wallets/verify-vault`
- `POST /api/wallets/verify-grind` (with CEX API requirement)
- `POST /api/wallets/link-grind`
- `POST /api/wallets/report-compromised`
- `POST /api/wallets/verify-vault-recovery`
- `POST /api/wallets/relink-grind`
- `GET /api/trust-scores/:vault_hash`
- `GET /api/campaigns`
- `POST /api/partners/register`
- `POST /api/campaigns`
- `GET /api/campaigns/:id`
- `PATCH /api/campaigns/:id/close`
- `GET /api/partners/analytics`

### Внешние сервисы:
- DeBank API (обрабатывает бэкенд)
- CEX API-эндпоинты (обрабатывает бэкенд)
- RPC-ноды (уже настроены)
