---
trigger: always_on
---

# IMAGE STORAGE SPECIFICATION

This document defines the OFFICIAL image storage architecture for the project.
This overrides any industry default storage assumptions.

───────────────────────────────────────────────
1. STORAGE STRATEGY
───────────────────────────────────────────────

All listing images are stored in a PUBLIC GitHub repository.

Supabase Storage MUST NOT be used.
No other storage provider is allowed unless explicitly defined.

───────────────────────────────────────────────
2. UPLOAD ARCHITECTURE
───────────────────────────────────────────────

Client MUST NOT upload directly to GitHub.

Upload flow:

Client
→ Supabase Edge Function
→ GitHub REST API
→ Commit file to repository
→ Return public image URL

───────────────────────────────────────────────
3. SECURITY MODEL
───────────────────────────────────────────────

- GitHub Personal Access Token (PAT) is stored ONLY in Supabase Secrets.
- PAT MUST NEVER be exposed to:
  - Client
  - Public APIs
  - Logs
  - Source code
  - Environment variables accessible to frontend

Edge Function MUST:
- Verify authentication
- Accept file payload (base64)
- Commit image using GitHub API
- Return only public image URL

───────────────────────────────────────────────
4. REPOSITORY RULES
───────────────────────────────────────────────

- Repository visibility: PUBLIC
- Images are publicly accessible via GitHub raw URL
- Each image must have a deterministic path structure

Recommended structure:

/listings/{listing_id}/{timestamp}-{random}.jpg

AI MUST NOT invent alternative folder structures unless explicitly instructed.

───────────────────────────────────────────────
5. DATABASE STORAGE RULE
───────────────────────────────────────────────

The database stores ONLY:

- image_url (string)

No binary data.
No base64 storage.
No file blobs in database.

───────────────────────────────────────────────
6. FORBIDDEN IMPLEMENTATIONS
───────────────────────────────────────────────

AI MUST NOT:

- Use Supabase Storage
- Upload from client directly to GitHub
- Expose GitHub PAT
- Hardcode credentials
- Create alternative storage mechanisms
- Store images inside the database

───────────────────────────────────────────────
7. FUTURE MODIFICATIONS
───────────────────────────────────────────────

Any change to storage architecture MUST:

- Explicitly update this file
- Respect ANTI_ASSUMPTION_RULES
- Not be inferred automatically
