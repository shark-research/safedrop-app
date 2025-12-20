# API Contracts

## Base URL

| Environment | URL |
|-------------|-----|
| **Local Dev** | `http://localhost:3001` |
| **Production** | Configured via `NEXT_PUBLIC_API_SERVER_URL` |

---

## Endpoints

### POST `/api/verification`

**Purpose:** Verify that a wallet address exists in a user's exchange withdrawal history.

**Headers:**
```
Content-Type: application/json
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `exchange` | `string` | ✅ | Exchange identifier |
| `key` | `string` | ✅ | API Key |
| `secret` | `string` | ✅ | API Secret |
| `passphrase` | `string` | ⚠️ Conditional | Required for Bitget, KuCoin, OKX |
| `wallet` | `string` | ✅ | Wallet address (EVM `0x...` or Solana) |

**Supported Exchanges:**

| Exchange | ID | Passphrase | Status |
|----------|----|-----------:|--------|
| Binance | `binance` | No | ✅ Active |
| BingX | `bingx` | No | ✅ Active |
| Bitget | `bitget` | **Yes** | ✅ Active |
| Bybit | `bybit` | No | ✅ Active |
| Gate.io | `gate` | No | ⏸️ Disabled |
| Kraken | `kraken` | No | ✅ Active |
| KuCoin | `kucoin` | **Yes** | ✅ Active |
| MEXC | `mexc` | No | ✅ Active |
| OKX | `okx` | **Yes** | ✅ Active |

**Example Request:**

```json
{
  "exchange": "binance",
  "key": "abc123...",
  "secret": "xyz789...",
  "wallet": "0x1234567890abcdef1234567890abcdef12345678"
}
```

**Example with Passphrase (OKX):**

```json
{
  "exchange": "okx",
  "key": "abc123...",
  "secret": "xyz789...",
  "passphrase": "my-passphrase",
  "wallet": "0x1234567890abcdef1234567890abcdef12345678"
}
```

---

**Response:**

| Field | Type | Description |
|-------|------|-------------|
| `found` | `boolean` | `true` if wallet found in withdrawal history |

**Success Response (200):**
```json
{
  "found": true
}
```

**Wallet Not Found (200):**
```json
{
  "found": false
}
```

---

**Error Responses:**

| Status | Cause | Body |
|--------|-------|------|
| `400` | Validation error | `{ "message": "..." }` |
| `401` | Invalid API credentials | `{ "message": "..." }` |
| `500` | Exchange API error | `{ "message": "..." }` |

---

## Verification Logic

1. Backend receives API credentials + wallet address
2. Connects to exchange API using provided credentials
3. Fetches withdrawal history for configured period (default: 1 year via `YEARS` env)
4. Searches for matching wallet address in withdrawal destinations
5. Returns `{ found: true }` if match found

**Note:** Backend is **chain-agnostic**. It treats wallet addresses as plain strings. Chain validation is frontend responsibility.

---

## Frontend Integration

### TypeScript Types

```typescript
interface VerificationRequest {
  exchange: 'binance' | 'bingx' | 'bitget' | 'bybit' | 'kraken' | 'kucoin' | 'mexc' | 'okx';
  key: string;
  secret: string;
  passphrase?: string;
  wallet: string;
}

interface VerificationResponse {
  found: boolean;
}
```

### Fetch Example

```typescript
const verifyWallet = async (data: VerificationRequest): Promise<VerificationResponse> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/verification`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }
  );
  
  if (!response.ok) {
    throw new Error('Verification failed');
  }
  
  return response.json();
};
```

---

## Swagger Documentation

When backend runs in `MODE=DEV`, Swagger UI is available at:

```
http://localhost:3001/api
```

---

## Security Notes

> ⚠️ **API credentials are sensitive!**

- Never log or persist API keys client-side
- All credentials are transmitted over HTTPS in production
- Backend doesn't store credentials (stateless verification)
- Use read-only API keys without withdrawal permissions

---

## POST `/api/verification/link-grind`

**Purpose:** Link a Grind wallet to a Vault wallet after new-wallet checks and dual signature validation.

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "grindAddress": "0x...",
  "vaultAddress": "0x...",
  "projectId": "project_123",
  "chain": "evm",
  "vaultSignature": "sig...",
  "grindSignature": "sig...",
  "nonce": "random",
  "timestamp": "2025-12-20T12:00:00Z"
}
```

**Response (200):**
```json
{
  "status": "linked",
  "grindAddress": "0x...",
  "vaultAddress": "0x...",
  "projectId": "project_123",
  "chain": "evm",
  "linkedAt": "2025-12-20T12:00:00.000Z"
}
```

**Error Codes:**
- `GRIND_HISTORY_NOT_EMPTY`
- `GRIND_BALANCE_NONZERO`
- `GRIND_ALREADY_USED`
- `INVALID_GRIND_SIGNATURE`
- `INVALID_VAULT_SIGNATURE`
- `RPC_TIMEOUT`
