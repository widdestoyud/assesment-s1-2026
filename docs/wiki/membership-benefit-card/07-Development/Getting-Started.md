# Getting Started

> Covers: Req 14

## Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | 22+ (see `.nvmrc`) |
| Browser | Chrome Android 89+ (for Web NFC) |
| Device | NFC-enabled Android device |
| OS | Any (development), Android (NFC testing) |

## Install

```bash
nvm use
npm install
```

## Development

```bash
npm run dev
```

Open `https://localhost:443` — HTTPS is required for Web NFC API access.

## Test

```bash
npm run test              # Run all tests
npm run test:coverage     # Run with coverage report
```

Coverage threshold: 85% for branches, functions, lines, and statements.

## Build

```bash
npm run build
```

Output directory: `./build`

## Lint & Format

```bash
npx eslint --fix .        # ESLint auto-fix
npx prettier --write .    # Prettier format
```

Both are enforced via Husky pre-commit hook — commits that fail lint are rejected.

## Project Structure

See [System Overview](../01-Architecture/Overview) for the full project structure.

## MBC Routes

| Route | Page | Description |
|-------|------|-------------|
| `/mbc` | MbcRolePicker | Role selection landing |
| `/mbc/station` | MbcStation | Admin: registration, top-up, config |
| `/mbc/gate` | MbcGate | Check-in with service type selection |
| `/mbc/terminal` | MbcTerminal | Check-out with manual fallback |
| `/mbc/scout` | MbcScout | Read-only card viewer |

## NFC Testing

Web NFC requires:
1. HTTPS (localhost with self-signed cert works)
2. Chrome Android 89+
3. Physical NFC-enabled Android device
4. Physical NFC tags (NTAG215 or NTAG216 recommended)

For development without NFC hardware, use [Simulation Mode](../03-Business-Flows/Check-In-Flow) at The Gate.

## Related Pages

- [Phase Progress](Phase-Progress) — Current implementation status
- [Git Flow](Git-Flow) — Branch strategy
- [Agents and Hooks](Agents-and-Hooks) — Automation tools
