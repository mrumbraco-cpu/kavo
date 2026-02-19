---
trigger: always_on
---

# MAP BEHAVIOR SPECIFICATION

## Pagination Definition

- Pagination is SERVER-SIDE ONLY
- Client-side slicing is forbidden

## Global Result Set

- A confirmed search defines ONE global result set
- Pagination divides this set for the result panel ONLY

## Marker Data Rule (ABSOLUTE)

- Marker data MUST be derived from the SAME query
  as the global result set, excluding pagination
- Marker data MUST NOT be derived from paginated results

## Marker Types

Primary:
- Listings in current page
- Prominent, interactive

Secondary:
- Listings from other pages
- Lower priority, still hoverable

## Map Stability

- Map initializes once
- Map NEVER re-mounts
- Page change:
  - Updates marker styles only
  - NEVER refits map

## Hover & Click Rules

- Hover listing:
  - Highlight marker
  - Recenter ONLY if outside viewport
- Hover marker:
  - Highlight only
  - NEVER recenter
- Click marker:
  - Show popup only
