---
description: 
---

---
trigger: always_on
---

# CHANGE IMPACT WORKFLOW (MANDATORY)

Before implementing ANY change that touches core system logic:

- Search logic
- Filter logic
- Pagination
- Map behavior
- Marker logic
- Database queries
- Unlock logic
- Coin or subscription flow
- Listing visibility

AI MUST perform the following:

---

## STEP 1 — Impact Mapping

Explicitly determine whether the change affects:

- SEARCH_AND_FILTER_BEHAVIOR.md
- MAP_BEHAVIOR.md
- DATABASE_SCHEMA.md
- RLS_AND_SECURITY.md
- PAYMENT_AND_COINS.md
- DOMAIN_MODEL.md

If YES:
- List impacted rule files
- Verify compliance before implementation

---

## STEP 2 — Global Result Set Protection

AI MUST confirm:

- Global result set definition is unchanged
- Pagination affects ONLY result panel
- Marker dataset remains derived from global result set

If uncertain:
STOP.

---

## STEP 3 — Contact & Security Protection

AI MUST confirm:

- No contact field is exposed
- No RLS bypass occurs
- Unlock record logic remains intact
- Subscription does NOT bypass logging

---

## STEP 4 — Architecture Boundary Check

AI MUST confirm:

- UI change does NOT alter domain logic
- Map change does NOT alter search semantics
- Pagination change does NOT redefine data source

---

If ANY uncertainty exists:
STOP and request clarification.
