---
trigger: manual
---

# DATABASE SCHEMA

⚠️ USAGE CONSTRAINT

This document is a STRUCTURAL REFERENCE ONLY.

AI MUST:
- Use this schema ONLY when explicitly instructed
- NOT infer queries, joins, relations, or constraints
- NOT generate CRUD logic unless the task explicitly requires it


## profiles
- id (uuid, pk)
- email
- role (user | admin)
- coin_balance (int)
- created_at

## listings
- id (pk)
- owner_id (fk)
- title
- description
- space_type
- suitable_for[]
- not_suitable_for[]
- location_type
- amenities[]
- time_slots[]
- price_min
- price_max
- address_old_admin
- address_new_admin
- province_old
- district_old
- province_new
- ward_new
- latitude
- longitude
- status (draft | pending | approved | disabled)
- is_hidden (boolean)
- created_at
- updated_at

## listing_contacts (PRIVATE)
- listing_id (pk, fk)
- phone_encrypted
- zalo_encrypted

## contact_unlocks
- user_id
- listing_id
- created_at
- UNIQUE (user_id, listing_id)

## favorites
- user_id
- listing_id
- UNIQUE (user_id, listing_id)

## coin_transactions
- id (pk)
- user_id
- amount
- type (topup | reward | unlock)
- reference
- created_at

## subscriptions
- user_id (pk)
- start_date
- end_date

## listing_submissions (Internal)
- id (pk)
- user_id (fk)
- listing_id (fk)
- action (create | update)
- created_at
