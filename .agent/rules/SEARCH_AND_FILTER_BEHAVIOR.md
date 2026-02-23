---
trigger: always_on
---

# SEARCH & FILTER BEHAVIOR

## 1. Mandatory Geographic Selection

- User MUST select geography before any search
- Geography choice MUST be persisted
- User is NOT forced to reselect unless explicitly changed

### Supported Geography Systems

A. Old Administrative:
- Province (REQUIRED)
- District (OPTIONAL)

B. New Administrative:
- Province (REQUIRED)
- Ward (REQUIRED)

Only ONE system is active at a time.

## 2. Search Confirmation Rule

A search executes ONLY when the user explicitly confirms:
- Geography selection, or
- Filter changes

Input changes alone MUST NOT trigger search.

## 3. Text Search Behavior

One input applies to:
- Listing title
- Listing description
- Listing Detailed Address

Search is:
- Accent-insensitive
- Case-insensitive
- Whitespace-insensitive

## 4. Suitable Logic

- not_suitable_for[] = HARD exclusion
- suitable_for[] = ranking boost ONLY

## 5. Search Execution Order

1. Validate geography
2. Apply hard exclusions
3. Apply base filters
4. Apply ranking boosts
5. Apply pagination