# PRODUCT REQUIREMENTS DOCUMENT

This document defines MVP scope.

Behavioral logic MUST comply with:

- ANTI_ASSUMPTION_RULES.md
- SEARCH_AND_FILTER_BEHAVIOR.md
- MAP_BEHAVIOR.md
- DATABASE_SCHEMA.md
- RLS_AND_SECURITY.md
- PAYMENT_AND_COINS.md


---

## MVP Goals

- Đăng & duyệt listing
- Search + filter + Goong map
- Unlock contact bằng xu
- SePay top-up
- Favorite listings
- Share listing link


---

## Core Principles

- Listing does NOT represent booking
- Unlimited users may contact the same listing
- Unlock does NOT imply reservation
- All negotiations happen OFF-PLATFORM
- No availability state exists


---

## User Roles

Guest:
- Search listings
- View listing details

User:
- Create listings
- Edit own listings
- Favorite listings
- Unlock contact information

Admin:
- Approve listings
- Disable listings
- Manage coin balances


---

## Monetization Model

- Contact unlock requires coins
- Subscription removes coin requirement
- Subscription DOES NOT bypass unlock tracking
- Unlock records are ALWAYS created
- All unlock logic is server-side


---

## Out of Scope

- Booking
- Calendar
- Chat
- Review
- Rating system
- Real-time availability
- Advanced SEO automation
- Automatic UX optimization


---

## Architectural Constraints

- Next.js (App Router) + TypeScript
- Supabase with strict RLS
- Goong Maps SDK only
- No Google Maps
- No client-side security logic
- No implicit caching
- No auto-triggered search
