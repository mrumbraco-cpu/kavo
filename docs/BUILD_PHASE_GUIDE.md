# BUILD PHASE GUIDE (HUMAN REFERENCE ONLY)

This document is for HUMAN planning only.

AI MUST NOT:
- Treat this document as implementation instruction
- Override GLOBAL_RULES
- Override ANTI_ASSUMPTION_RULES
- Override any always_on rule

If any content here conflicts with higher-priority rule files,
the higher-priority rule ALWAYS wins.


---

## Phase 0 – Setup

- Next.js (App Router) + TypeScript + Tailwind CSS
- Supabase Auth (SSR-compatible setup)
- Environment variable configuration
- Basic project structure aligned with GLOBAL_RULES


---

## Phase 1 – Database & RLS

- Implement schema EXACTLY as defined in DATABASE_SCHEMA.md
- Apply RLS policies EXACTLY as defined in RLS_AND_SECURITY.md
- No schema improvisation
- No inferred relationships
- No JSON-based relational shortcuts


---

## Phase 2 – Listings

- CRUD for listings
- Approval workflow (draft → pending → approved → disabled)
- Editing approved listing resets status to `pending`
- Listings are NEVER deleted


---

## Phase 3 – Search & Map

- Implement search STRICTLY following SEARCH_AND_FILTER_BEHAVIOR.md
- Implement map STRICTLY following MAP_BEHAVIOR.md
- Ensure pagination affects ONLY the result panel
- Ensure marker dataset derives from global result set (excluding pagination)


---

## Phase 4 – Monetization

- Coin system
- SePay top-up integration
- Unlock edge function
- Subscription logic
- Unlock records ALWAYS created
- No client-side unlock logic


---

## Phase 5 – Admin

- Listing approval & disable
- Coin balance management
- No auto-approval
- No silent state transitions
