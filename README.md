# 🛡️ InternSafe 2.0 — AI-Powered Career Intelligence & Protection System

InternSafe 2.0 is a multi-agent AI system that protects students from fraudulent job/internship listings, analyzes their fit for roles, and provides career strategy with negotiation coaching — all powered by 10 specialized AI agents running through the Groq API.

Built for **AMD Ryzen AI Slingshot 2026 Hackathon**.

---

## 🚀 Getting Started

### Step 1: Login

Use the following credentials to access the app:

```
Email    : user@gmail.com
Password : test123
```

### Step 2: Add Your Groq API Key

> ⚠️ **Do this first before running any analysis.**

1. After logging in, click on **Settings** in the sidebar.
2. Paste your **Groq API Key** in the input field.
3. Click **Save**.

Don't have a key? Get one for free at [console.groq.com](https://console.groq.com).

### Step 3: Start a New Analysis

1. Click **New Analysis** from the sidebar or dashboard.
2. **Paste the job/internship listing** text in the text area (or enter the listing URL).
3. Click **Next**.

### Step 4: Enter Your Profile

1. **Paste your resume text** in the provided area.
2. Add your **LinkedIn profile URL** (optional).
3. Add your **GitHub profile URL** (optional).
4. Click **Run Analysis**.

### Step 5: Watch the Agents Work

Sit back and watch 10 AI agents analyze the listing in real-time:

- **Shield Agents** — Check if the listing is a scam (company verification, recruiter check, red flag detection)
- **Fit Agents** — Analyze how well your profile matches the role across 5 dimensions
- **Leverage Agents** — Build your application strategy, cover letter, and negotiation scripts

### Step 6: View Your Intelligence Report

Once all agents complete, you get a full report with:

- **Safety Score** — Is this listing legit or a scam?
- **Fit Score** — How well do you match this role?
- **Skill Gap Roadmap** — What to learn and how long it'll take
- **Application Strategy** — Resume improvements + tailored cover letter
- **Negotiation Playbook** — Market salary data + ready-to-send counter-offer scripts

You can **download the report as PDF** or access it anytime from **My Reports**.

---

## 🧠 How It Works

```
Job Listing + Resume + LinkedIn
        │
        ▼
┌─── PILLAR 1: SHIELD ──────────────────────┐
│  Listing Analyst → Company Investigator    │
│  → Recruiter Verifier → Safety Gate        │
└────────────────────────────────────────────┘
        │ (If safe, continue ↓)
        ▼
┌─── PILLAR 2: FIT ─────────────────────────┐
│  Profile Deep-Dive → Fit-Match Engine      │
│  → Growth-Gap Analyzer                     │
└────────────────────────────────────────────┘
        │
        ▼
┌─── PILLAR 3: LEVERAGE ────────────────────┐
│  Market Intelligence → App Strategist      │
│  → Negotiation Coach                       │
└────────────────────────────────────────────┘
        │
        ▼
   📄 Intelligence Report
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, TypeScript, Tailwind CSS, shadcn/ui |
| LLM | Groq API (Llama 3.3 70B) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Deployment | Lovable |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── landing/       → Hero, Features, Stats
│   ├── analysis/      → Wizard, Agent cards, Execution view
│   ├── report/        → Safety, Fit, Upskilling, Strategy sections
│   └── layout/        → Sidebar, Header, Dashboard layout
├── lib/
│   ├── groq.ts        → Groq API client + agent prompts
│   ├── agents.ts      → Agent execution pipeline
│   └── supabase.ts    → Supabase client
├── pages/             → All route pages
└── hooks/             → Custom React hooks
```

---

## 🏗️ Built For

**AMD Ryzen AI Slingshot 2026**
- Theme: AI in Consumer Experiences + AI + Cybersecurity & Privacy
- Powered by Hack2Skill

---

## 📝 License

This project was built for the AMD Slingshot Hackathon and is intended for educational and demonstration purposes.
