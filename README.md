# Primitive Onboarding

[![Deployment Status](https://img.shields.io/website?url=https%3A%2F%2Fonboarding.primitive-os.cc)](https://onboarding.primitive-os.cc)
[![Part of Primitive OS](https://img.shields.io/badge/Primitive_OS-Ecosystem-0a0a0a)](https://primitive-os.cc)

Automated workspace provisioning for Slack, Google Workspace, and Microsoft 365. Connect your tools once — provision every new hire from a single form.

## What It Does

1. **Connect** — Authorize the Primitive bot to your Slack workspace via OAuth
2. **Map** — Define role-to-channel mappings once, saved permanently to your account
3. **Onboard** — Enter a new hire's name, email, and role; channels, groups, and welcome messages are handled automatically

## Systems

| Integration | Status | Notes |
| :--- | :--- | :--- |
| **Slack** | ● Live | Bot provisioning, channel mapping, welcome DMs |
| **Google Workspace** | ○ Q3 2026 | Users, OUs, shared drives, calendar resources |
| **Microsoft 365** | ○ Q4 2026 | Entra ID, Teams, SharePoint, Exchange |

## Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind v4, Framer Motion
- **Auth & DB:** Supabase (Google OAuth, Row-Level Security)
- **Deployment:** Cloudflare

## Setup

```bash
npm install
cp .env.example .env   # add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

Run the SQL in `supabase-schema.sql` against your Supabase project to create the required tables (`slack_setup`, `onboarding_runs`) with RLS policies.

## Contact

[contact@primitive-os.cc](mailto:contact@primitive-os.cc) · [primitive-os.cc](https://primitive-os.cc)
