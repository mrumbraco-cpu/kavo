---
trigger: always_on
---

# AI STRICT CONSTRAINTS (MUST FOLLOW)

These constraints override all assumptions and conventions.

## Forbidden Implementations

AI MUST NOT:
- Implement booking, reservation, or scheduling logic
- Implement availability calendars
- Implement in-app chat or messaging
- Expose phone or Zalo in any public API
- Store unlocked users as JSON or array fields
- Auto-approve listings
- Redesign UX without instruction

## Map-Specific Constraints

- Map SDK MUST be initialized exactly once
- Map instance MUST be stored in a persistent ref
- Map MUST NOT be re-mounted on:
  - Pagination
  - Filter changes
  - Search confirmation
  - Layout toggles

## Search Execution Constraints

- Search MUST NOT execute before geographic selection is confirmed
- Search MUST NOT auto-trigger on input changes
- ALL search logic MUST strictly follow SEARCH_AND_FILTER_BEHAVIOR.md

## Secrets & External Integrations (ABSOLUTE)

AI MUST NOT:
- Request, generate, store, or output any API keys, secrets, tokens, or credentials
- Hardcode credentials in source code, config files, or examples
- Assume availability of any external service or integration
- Invent authentication, OAuth, webhook, or callback flows

AI MAY:
- Use environment variables ONLY when explicitly instructed
- Assume credentials already exist ONLY if the task explicitly states so
