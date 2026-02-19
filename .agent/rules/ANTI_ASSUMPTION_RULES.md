# ANTI-ASSUMPTION RULES
## PRIORITY: ABSOLUTE (OVERRIDES ALL OTHER FILES)

This file has the HIGHEST PRIORITY.
If any other document conflicts with this one,
this document MUST be followed.

## ABSOLUTE AI BEHAVIOR FIREWALL

This document exists to PREVENT AI from:
- Applying industry defaults
- Filling gaps with “reasonable” behavior
- Optimizing logic without permission
- Making UX or architecture assumptions

If ANY behavior is not EXPLICITLY described elsewhere,
it MUST be treated as FORBIDDEN.

---

## 1. GENERAL ASSUMPTION BAN

AI MUST NOT:
- Assume this marketplace behaves like Airbnb, Booking, Shopee, or any rental platform
- Assume users intend to book, reserve, or secure availability
- Assume listings represent time-based availability
- Assume “search” implies auto-refresh or instant feedback
- Assume common UX patterns are desired

If something is common practice in the industry,
it is STILL FORBIDDEN unless explicitly allowed.

---

## 2. “MAKE IT SMARTER” IS FORBIDDEN

AI MUST NOT:
- Optimize queries “for performance” by removing conditions
- Simplify logic “for MVP speed”
- Merge steps “because they feel redundant”
- Cache results unless explicitly instructed
- Add debounce, throttle, or auto-search logic

Correctness ALWAYS overrides cleverness.

---

## 3. SEARCH & FILTER ASSUMPTIONS (STRICT)

AI MUST NOT:
- Trigger search on input change
- Trigger search on modal open/close
- Trigger search on pagination change
- Trigger search on hover events
- Combine geography selection with filters
- Ignore persisted geographic selection

Search happens ONLY on explicit user confirmation.
No exceptions.

---

## 4. PAGINATION ASSUMPTIONS (CRITICAL)

AI MUST NOT:
- Assume pagination implies partial data context
- Assume non-visible pages are irrelevant
- Assume page 1 is more “important” than others
- Re-query data differently for markers vs listings

Pagination affects ONLY the result panel.
Pagination MUST NEVER affect:
- Map bounds
- Marker dataset
- Search result definition

---

## 5. MAP BEHAVIOR ASSUMPTIONS (ZERO TOLERANCE)

AI MUST NOT:
- Treat map as a visual mirror of the current page
- Derive marker data from paginated listings
- Re-mount or re-initialize the map for any reason
- Recenter map on page change
- Show popup on hover
- Use Google Maps mental models

Goong Maps behavior MUST follow MAP_BEHAVIOR.md EXACTLY.
No “similar enough” logic is allowed.

---

## 6. UX ASSUMPTIONS (HARD STOP)

AI MUST NOT:
- Redesign layout to “improve usability”
- Change interaction flow to “feel more natural”
- Add confirmation dialogs unless specified
- Add loading states that alter behavior
- Add skeletons that change layout timing logic

UI behavior is PART OF BUSINESS LOGIC.

---

## 7. DATA MODEL ASSUMPTIONS

AI MUST NOT:
- Store relational data in arrays or JSON fields
- Skip database-level constraints
- Rely on frontend checks for critical rules
- Assume “this will never happen” edge cases
- Auto-heal inconsistent data

If a rule exists, it MUST be enforced at DB or server level.

---

## 8. SECURITY & ACCESS ASSUMPTIONS

AI MUST NOT:
- Expose contact data via joins
- Expose decrypted data in public queries
- Trust client-provided unlock state
- Bypass RLS “for convenience”
- Cache sensitive responses client-side

Security is NEVER optional.

---

## 9. SUBSCRIPTION & PAYMENT ASSUMPTIONS

AI MUST NOT:
- Treat subscription unlocks differently in data records
- Skip creating contact_unlock records
- Create fake coin transactions
- Assume “free” actions don’t need logging

Subscription ≠ magic bypass.
It only changes payment requirement, not behavior tracking.

---

## 10. ERROR HANDLING & UNCERTAINTY (MANDATORY RULE)

If AI encounters:
- Ambiguous instruction
- Missing rule
- Conflicting interpretation
- Undefined edge case

AI MUST:
1. STOP implementation
2. ASK for clarification
3. WAIT for explicit instruction

AI MUST NOT:
- Guess
- Choose the “most reasonable” option
- Implement a temporary solution
- Add TODO logic

---

## 11. META RULE (OVERRIDES ALL)

When in doubt:
- Doing NOTHING is always safer than doing something wrong.

Silence > Assumption  
Explicit permission > Smart guess  

Any violation of this document is a BUG, not a feature.
