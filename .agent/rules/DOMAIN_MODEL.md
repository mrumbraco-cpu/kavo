---
trigger: manual
---

# DOMAIN MODEL

## Actors

- F1: Space provider (owner or renter)
- F2: Space seeker

## Listing Semantics

- A listing does NOT represent a booking
- A listing has NO availability state
- Unlimited users may contact the same listing

## Contact Unlock Semantics

- A user may unlock a listing at most once
- Unlock is permanent unless the listing is disabled
- Unlocking does NOT imply any reservation or priority
