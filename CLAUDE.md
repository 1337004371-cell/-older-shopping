# CLAUDE.md — Older Shopping (银发族电商)

> Karpathy Guidelines: Before implementing, state assumptions. If uncertain, ask. If a simpler approach exists, say so. Push back when warranted.

## 1. Architecture: Decoupled & Atomic

**Single Responsibility per file. Never dump logic into App.vue.**

| Layer | Directory | Examples |
|-------|-----------|---------|
| Pages / Views | `/views` | Home.vue, Landing.vue |
| Reusable Components | `/components` | VideoPlayer.vue, VoiceAssistant.vue, ProductCard.vue |
| Mock Data & Models | `/mock` or `/data` | searchCases.ts, products.ts |
| Composables / Hooks | `/composables` | useCart.ts, useAuth.ts |
| Utilities | `/utils` | formatPrice.ts, wechat.ts |

- **Naming must be intuitive**: file name should directly reflect business function. `SceneTags.vue` not `Group1.vue`. `ProductCard.vue` not `Card2.vue`.
- **One file, one responsibility**. A component that renders a card should not also fetch data — pass data in via props.

## 2. Execution Cadence: Incremental & Checkpoint-Based

**Atomic changes only.** Each step focuses on one narrow slice:

- One UI module adjustment (e.g. style the search bar — no search logic yet).
- One functional unit (e.g. add product list rendering — no cart logic yet).

**Checkpoint rules:**

1. After completing a standalone file or feature module → **stop and demo**. Wait for user confirmation (phone preview link or emulator) before proceeding.
2. If a change spans multiple files → **list the change manifest first**, get user approval, then execute.
3. Never batch unrelated changes. Never proceed past a checkpoint without explicit user sign-off.

## 3. Tech Specs: Silver-Age (银发族) Adaptation

| Concern | Rule |
|---------|------|
| **Styling** | Tailwind CSS class-first. Use `text-xl`, `p-6`, `font-bold` etc. for easy font/spacing tuning. |
| **Touch targets** | Minimum 44px tap area. Large, clearly labeled buttons. |
| **Error tolerance** | Keep interaction simple. No hover states, no double-tap, no complex gestures. |
| **WeChat** | Stay aware of `WeixinJSBridge` and WeChat-specific APIs. Test in WeChat WebView. |
| **Readability** | High-contrast text. Avoid tiny fonts. Prefer system fonts for CJK rendering. |

## 4. Karpathy Behavioral Guidelines

### Think Before Coding
- State assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.

### Simplicity First
- No features beyond what was asked.
- No abstractions for single-use code.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

### Surgical Changes
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- Every changed line should trace directly to the user's request.

### Goal-Driven Execution
- Transform tasks into verifiable goals:
  - "Add X" → "Write test/demo for X, confirm it works, then integrate."
  - "Fix bug" → "Reproduce it, fix it, verify the fix."
- For multi-step work, state a brief plan with verification checkpoints:
  ```
  1. [Step] → verify: [check]
  2. [Step] → verify: [check]
  ```
