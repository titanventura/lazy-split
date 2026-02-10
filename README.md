# 🦥 LazySplit

> **Split the bill, not the friendship.**  
> The zero-friction way to handle shared expenses. No apps, no signups, no "I'll pay you later" awkwardness.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-Database-blue?style=flat-square&logo=supabase)](https://supabase.com)
[![Shadcn UI](https://img.shields.io/badge/UI-Shadcn-black?style=flat-square)](https://ui.shadcn.com)
[![Tailwind CSS](https://img.shields.io/badge/CSS-Tailwind-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com)

---

## ✨ Why LazySplit?

LazySplit is designed for people who are too lazy to download yet another app just to split a dinner bill. 

- **⚡ Instant Creation**: Spin up a split link in seconds.
- **🔗 Link-Based Magic**: WhatsApp the link to your crew. Done.
- **👤 Guest Mode by Default**: No registration needed. Enter your name and you're in.
- **✅ Real-Time Tracking**: Watch the progress bar fill up as people pay.
- **💸 UPI Integration**: Direct deep-linking into GPay, PhonePe, or Paytm with pre-filled amounts and notes.
- **📱 Mobile First**: Designed to look and feel premium on your phone.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Toasts**: [Sonner](https://sonner.emilkowal.ski/)

## 🚀 One-Click Setup

1. **Clone & Install**
   ```bash
   git clone git@gh-personal:titanventura/lazy-split.git
   cd lazy-split
   npm install
   ```

2. **Environment Specs**
   Create a `.env` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Go Live**
   ```bash
   npm run dev
   ```

## 📐 The Architecture

- `/app`: Next.js 15 App Router pages and API routes.
- `/components`: Reusable UI pieces built with Shadcn.
- `/lib`: Supabase client and helper utilities.
- `/supabase`: Migrations and schema definitions.

---
Built for the lazy, by the lazy. 🍕🥤
