# Meri (መሪ) — Multilingual Assistant & Career Gateway Plugin

> **ALX Capstone Project — Track 3: Multilingual Assistant & Live Help**  
> Built with React 18, TypeScript, Vite, Tailwind CSS, Web Speech API, and WebRTC Screen Sharing.

---

## 1. Project Overview

**Meri (መሪ)**—meaning *"Guide"* in Amharic—is an embeddable, context-aware AI learning companion and career gateway plugin. It installs on existing learning management systems (like the ALX Savanna LMS) and job platforms via a single script tag without requiring any changes to the host platform's frontend.

When embedded, Meri:
- 📖 **Detects & Reads the Active Page**: Automatically extracts visible course lessons or job postings (no copy-pasting required).
- 🇪🇹 **Bilingual Support**: Instant toggle between **English** and **Amharic (አማርኛ)**, with full Ethiopic typography support.
- 💡 **Simple Mode (ቀላል ሁነታ)**: One-click switch for learners to receive simplified explanations using everyday language and analogies.
- 🎙️ **Voice Input & Read-Aloud**: Voice speech-to-text recording and audio read-aloud for accessible learning.
- 📖 **Strict Course Citations**: Answers questions strictly grounded in the active course lesson and highlights the exact section on the host page.
- 👤 **One-Click Human Live Help**: Instant escalation to human tutors with **learner-controlled WebRTC screen sharing**.
- 💼 **Career Gateway**: Automatic switching to Career Coach on job pages, qualification analysis, and an **Interview Accommodations** request modal.
- 🛡️ **Shadow DOM Isolation**: All styles are isolated in a Shadow DOM, preventing any styling conflicts with host Bootstrap or Tailwind CSS.

---

## 2. Architecture & How Meri "Plugs In"

```
[Host Website: Savanna LMS or Job Portal]
          │
          ▼ <script src="https://.../meri.js" data-public-key="savanna-dev-01" async></script>
[initialize / main.tsx]
          │
          ├── Injects host element <div id="meri-plugin-root">
          ├── Attaches Shadow DOM (.attachShadow({ mode: 'open' }))
          ├── Injects compiled scoped styles (widget.css)
          ▼
[React Root inside Shadow DOM]
          │
          ├── context-extractor.ts ──── Scrapes #curriculum_navigation_content / Schema.org JobPosting
          ├── ai-service.ts ────────── Pluggable Cloud / Local / Offline Knowledge Base
          ├── speech.ts ────────────── Web Speech API (Amharic & English STT / TTS)
          ├── screen-share.ts ──────── navigator.mediaDevices.getDisplayMedia
          ▼
[Meri Floating Launcher & Chat Window]
```

---

## 3. How Meri Works with Savanna Static Pages

The provided `Savanna-static-pages` are frozen offline DOM snapshots. While most menu links are inert, the primary lesson page:
- **`pages/concept-with-navigation.html`** contains the full authored lesson *"The Future of the VA Industry"* under `#curriculum_navigation_content`.

Meri automatically reads this container, extracts the sections (*Section 2: An Important Distinction*, *What is Shaping the Future of VA Work?*), and grounds its tutor answers directly in that lesson.

For the **Career Gateway**, we provide **`pages/job-detail.html`** with Schema.org `JobPosting` data, allowing full demonstration of job qualification analysis and interview accommodations.

---

## 4. Quick Start & Development

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation
```bash
git clone https://github.com/BeimnetTadesse/Meri.git
cd Meri
npm install
```

### Run Interactive Dev Preview
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173). You can interact with Meri floating over the Savanna Course View, or use the top button to switch to the Job Portal View.

### Build Standalone Distribution Bundle
```bash
npm run build
```
This compiles everything into a single, standalone distribution file:
- `dist/meri.js` (Self-contained, inlines all styles and dependencies into an isolated IIFE bundle).

---

## 5. Embedding on Any Website

To install Meri on any LMS or Job website, add this single script tag before `</body>`:

```html
<!-- Meri Assistant Plugin -->
<script 
  src="https://your-domain.com/dist/meri.js" 
  data-public-key="YOUR_PLATFORM_KEY" 
  async
></script>
```

---

## 6. Repository Layout

```
Meri/
├── dist/                             # Compiled standalone bundle (meri.js)
├── src/
│   ├── components/                   # React components
│   │   ├── Widget.tsx                # Central orchestrator
│   │   ├── Launcher.tsx              # Docked floating green sparkle button
│   │   ├── Header.tsx                # Brand, Online status, EN/አማ toggle, Audio, Minimize
│   │   ├── ContextBar.tsx            # Active page sync pill & Simple Mode toggle
│   │   ├── ModeSwitcher.tsx          # 🎓 Course Tutor vs 💼 Career Coach
│   │   ├── StatusRibbon.tsx          # Low-Bandwidth, Voice speed, AAA 11:1 contrast
│   │   ├── MessageList.tsx           # Chat bubbles, Savanna Sync timestamp, citations
│   │   ├── QuickActions.tsx          # Dynamic chips (Course & Job questions)
│   │   ├── MessageInput.tsx          # Voice mic, attachment, text input, send
│   │   ├── HumanHelpModal.tsx        # Live tutor escalation + WebRTC screen sharing
│   │   └── AccommodationsModal.tsx   # Career gateway interview accommodations form
│   ├── context/
│   │   ├── page-detector.ts          # Detects Lesson, Course, Job, or General page
│   │   └── context-extractor.ts      # Scrapes clean content, highlights citations
│   ├── core/
│   │   └── configuration.ts          # Platform configuration & dynamic CSS variables
│   ├── services/
│   │   ├── ai-service.ts             # Pluggable AI layer: Cloud / Local / Offline FAQ
│   │   ├── speech.ts                 # Web Speech API (English & Amharic STT/TTS)
│   │   └── screen-share.ts           # Learner-controlled WebRTC screen sharing
│   ├── styles/
│   │   └── widget.css                # Scoped Tailwind & Ethiopic typography
│   ├── types/
│   │   └── index.ts                  # TypeScript definitions
│   └── main.tsx                      # Shadow DOM mounting and plugin entry
├── savanna-host/                     # Savanna LMS Test Harness & Job portal demo
│   ├── index.html                    # Test hub linking course and job pages
│   ├── pages/
│   │   ├── concept-with-navigation.html # Savanna lesson page with Meri embedded
│   │   ├── homepage-v1-paced.html       # Savanna paced dashboard
│   │   ├── homepage-v1-self-paced.html  # Savanna self-paced dashboard
│   │   └── job-detail.html              # ALX Tech Job page (Career Gateway demo)
│   └── assets/                       # Savanna fonts, images, and styles
├── index.html                        # Interactive local dev testbed
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 7. Track 3 Evaluation Checklist

| Requirement | Implementation in Meri |
| :--- | :--- |
| **Amharic & English Voice and Text Tutor** | Header `[ EN | አማ ]` toggle; Web Speech API recognition & speech synthesis; Ge'ez font support. |
| **Strict Course Citations** | Clickable `📖 Citation` cards in AI responses with `Jump to source` highlighting on the page. |
| **Plain-Language "Simple Mode"** | `📖 Simple / ቀላል` toggle simplifying vocabulary and sentence structure. |
| **One-Click Human Help & Screen Sharing** | `Live Help` modal with tutor preview and `🖥️ Share My Screen` WebRTC sharing. |
| **Pluggable AI Layer** | `ai-service.ts` supports cloud endpoints, local models, and offline course knowledge base. |
| **Career Gateway & Job Alerts** | Automatic `💼 Career Coach` mode, qualification checks, interview prep, accommodations modal, and Telegram/SMS job alerts. |
| **Web Embed & Style Isolation** | Single `<script src="meri.js">` tag with full **Shadow DOM** protection from host CSS. |
