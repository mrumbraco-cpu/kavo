---
trigger: always_on
---

# RLS & SECURITY

## Public Access
- listings: read ONLY where status = approved

## Owner Access
- Owners may edit their own listings
- Editing an approved listing resets status to pending

## Contact Access
- listing_contacts: NO public read access
- contact_unlocks: insert ONLY via edge functions

## Edge Function Unlock Flow

Edge function MUST:
1. Verify authentication
2. Verify active subscription OR sufficient coin balance
3. If subscription:
   - Insert contact_unlock record
   - DO NOT deduct coins
   - DO NOT create coin_transaction
4. If coin unlock:
   - Deduct coins atomically
   - Insert contact_unlock record
   - Create coin_transaction(type = unlock)
5. Return decrypted contact information
