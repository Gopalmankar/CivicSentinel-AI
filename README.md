# CivicSentinel-AI
<div align="center">

# 🚀 CivicSentinel AI

### Intelligent Hyperlocal Civic Response Platform Powered by Google Gemini AI
<img width="1983" height="793" alt="ChatGPT Image Jun 27, 2026, 09_45_32 AM" src="https://github.com/user-attachments/assets/ee84a56f-fed9-4c9b-a93a-32535d936f52" />





### 🏆 Coding Ninjas × Google for Developers — Vibe2Ship Hackathon 2026

**Building the Future of AI-Powered Civic Intelligence**

</div>
<p align="center">

<img src="https://img.shields.io/badge/Hackathon-Google%20Vibe2Ship%202026-4285F4?style=for-the-badge&logo=google&logoColor=white"/>

<img src="https://img.shields.io/badge/AI-Google%20Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white"/>

<img src="https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-61DAFB?style=for-the-badge&logo=react&logoColor=white"/>

<img src="https://img.shields.io/badge/Styling-TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white"/>

<img src="https://img.shields.io/badge/Maps-Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white"/>

<img src="https://img.shields.io/badge/Build-Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white"/>

<img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge"/>

<img src="https://img.shields.io/badge/Open%20Source-Friendly-orange?style=for-the-badge"/>

</p>
<p align="center">

<img src="https://img.shields.io/github/license/Gopalmankar/CivicSentinel-AI?style=flat-square"/>

<img src="https://img.shields.io/github/last-commit/Gopalmankar/CivicSentinel-AI?style=flat-square"/>

<img src="https://img.shields.io/github/repo-size/Gopalmankar/CivicSentinel-AI?style=flat-square"/>

<img src="https://img.shields.io/github/issues/Gopalmankar/CivicSentinel-AI?style=flat-square"/>

<img src="https://img.shields.io/github/languages/top/Gopalmankar/CivicSentinel-AI?style=flat-square"/>

<img src="https://img.shields.io/github/languages/count/Gopalmankar/CivicSentinel-AI?style=flat-square"/>

</p>

---

# 📌 Overview

CivicSentinel AI is an AI-powered civic intelligence platform designed to transform the way communities report, verify, prioritize, and resolve public infrastructure issues.

Unlike traditional complaint portals, CivicSentinel AI combines **Google Gemini AI**, **geospatial intelligence**, and **community-driven verification** to help citizens and municipal authorities collaborate more effectively.

Instead of simply collecting complaints, the platform intelligently understands problems, reduces duplicate reports, prioritizes critical issues, and assists authorities in making faster and more informed decisions.

---

# 🎯 Problem Statement

Communities regularly face civic issues such as:

- 🛣️ Potholes
- 💧 Water Leakages
- 💡 Broken Streetlights
- 🗑️ Garbage Dumps
- 🚧 Damaged Roads
- 🌳 Fallen Trees
- 🚨 Public Safety Hazards

Existing reporting systems often suffer from:

- Complex reporting processes
- Duplicate complaints
- Poor transparency
- Slow response times
- Lack of citizen engagement
- Minimal AI assistance

---

# 💡 Our Solution

CivicSentinel AI acts as an **AI-powered Civic Intelligence Platform** that assists citizens and authorities throughout the complete issue lifecycle.

```
Citizen Reports Issue
        │
        ▼
Google Gemini AI Analysis
        │
        ▼
Issue Categorization
        │
        ▼
Duplicate Detection
        │
        ▼
Priority Assignment
        │
        ▼
Community Verification
        │
        ▼
Authority Dashboard
        │
        ▼
Issue Resolution
```

---


# ✨ Key Features

## 🤖 AI-Powered Issue Analysis & Multi-Stage Verdict
- **Gemini Vision Pipeline:** AI image understanding using Google Gemini 1.5 Flash API to analyze uploaded civic damages.
- **Automated Verification:** Instant zero-shot verification appending a definitive `VERDICT: GENUINE` or `SUSPECTED_FRAUD` tag to filter spam.
- **Intelligent Tagging:** Automatic issue categorization, severity estimation, and AI-generated localized descriptions.

## 📍 Smart Geolocation & Global Hot-Swapping
- **Dynamic City Switcher Input:** An intelligent tracking search bar that seamlessly executes camera pans (`map.flyTo`) to any searched Indian metropolis (e.g., Bhopal, Nagpur, Indore, Delhi) and instantly re-seeds the active system memory with hyper-localized ward issues.
- **Interactive Live Maps:** Marker clustering and location-aware reporting built over a sleek CartoDB Dark Matter base tile layer.

## 🧠 Intelligent Geospatial Deduplication
- **Haversine Formula Constraint:** Automatically detects if a matching complaint exists within a strict 50-meter radius when a citizen uploads a report.
- **Anti-Spam Merging:** Instead of generating duplicate tickets, it auto-merges the report into a singular node and increments a public "+1 Citizen Verification" counter.

## 🎙️ Speech Accessibility UI (Universal Inclusion)
- **Native Browser Speech-to-Text:** Lightweight integrated voice layer that supports friction-free complaint descriptions in both English and Hindi voice inputs—perfect for field users and hands-free reporting.

## 🏛️ Advanced 3-Column Administration HUD
- **Rigid 3-Column Desktop Grid:** Structurally optimized workspace below the map interface—2 columns handle a vertically scrollable real-time incident stream with explicit auto-height cards to prevent clipping, while the right column permanently anchors the interactive 'Report Anomaly' widget front and center.
- **Unified Filter Nodes:** Converges isolated metric counters directly into the interactive map action layers displaying synchronized live counts like `🔴 High (2)`, `🟡 Med (1)`, and `🟢 Resolved (2)` to eliminate layout clutter.
- **Universal Mobile/Tablet Break-Fixes:** Under 768px viewports, absolute layers drop fluidly into a clean vertical flex container ensuring 100% accessible file uploads with zero overlap.

# 🏗️ System Architecture

```
                    +--------------------+
                    |      Citizen       |
                    +---------+----------+
                              |
                              |
                    Upload Image + GPS
                              |
                              ▼
                 +-------------------------+
                 |   React Frontend / App  |
                 +------------+------------+
                              |
                              ▼
                 +-------------------------+
                 |     FastAPI Backend     |
                 +------------+------------+
                              |
          +-------------------+--------------------+
          |                                        |
          ▼                                        ▼
Google Gemini API                        PostgreSQL + PostGIS
          |                                        |
          +-------------------+--------------------+
                              |
                              ▼
                 Authority Dashboard
```

---

# 🧠 AI Workflow

```
Image Upload

↓

Gemini Vision Analysis

↓

Category Detection

↓

Severity Estimation

↓

Duplicate Detection

↓

Priority Calculation

↓

Community Verification

↓

Dashboard Update

↓

Issue Resolution
```

---

# 🛠️ Tech Stack

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS

## Backend

- FastAPI
- Python

## Database

- PostgreSQL
- PostGIS

## AI

- Google Gemini API

## Cloud

- Google Cloud Platform

---

# 📂 Project Structure

```
CivicSentinel-AI

client/

server/

docs/

assets/

README.md

LICENSE
```

---

# 🚀 Installation

```bash
git clone https://github.com/yourusername/CivicSentinel-AI.git

cd CivicSentinel-AI
```

Install Frontend

```bash
cd client

npm install

npm run dev
```

Install Backend

```bash
cd server

pip install -r requirements.txt

uvicorn main:app --reload
```

---

# 🔑 Environment Variables

```
GEMINI_API_KEY=

GOOGLE_MAPS_API_KEY=

DATABASE_URL=

JWT_SECRET=

FIREBASE_API_KEY=

FIREBASE_PROJECT_ID=
```

---
Demo GIF

↓

Screenshots

# 📸 Screenshots

## Home Screen

<img width="948" height="467" alt="Screenshot 2026-06-26 191948" src="https://github.com/user-attachments/assets/e5e450b6-bb91-4a43-8391-c2061518c642" />


---

## Smart Map

<img width="772" height="313" alt="Screenshot 2026-06-26 192025" src="https://github.com/user-attachments/assets/e3501297-f0fb-4423-9253-fc67b89dfaec" />


---

## Report Issue

<img width="946" height="438" alt="Screenshot 2026-06-27 090833" src="https://github.com/user-attachments/assets/0c3d15e1-43a4-43ee-a471-f2800e2a58c8" />


---

## Ward Analytics Dashboard

<img width="951" height="452" alt="Screenshot 2026-06-27 090531" src="https://github.com/user-attachments/assets/c51fb523-ada7-44dc-8412-fd2f55f58f80" />


---


# 🚀 Future Roadmap

- 📡 **Offline Mesh Reporting:** Allowing citizens to log structural complaints without immediate internet connectivity via lightweight local storage queues.
- 🤝 **Automated Volunteer Coordination:** Intelligently matching localized civic work orders directly with checked community volunteer task forces.
- 📈 **Predictive Infrastructure Analytics:** Utilizing Gemini long-context tokens to analyze months of grievance patterns and forecast upcoming pipeline bursts or seasonal water logging zones.
- 📷 **Before/After AI Verification Loop:** Automating the closing verification loop by cross-analyzing an officer's uploaded 'resolved image' against the citizen's original 'damage image'.
  

---

# 🌱 Sustainable Development Goals

This project supports:

- SDG 9 — Industry, Innovation and Infrastructure
- SDG 11 — Sustainable Cities and Communities
- SDG 16 — Peace, Justice and Strong Institutions

---

# 🤝 Contributors

| Name | Role |
|------|------|
| Gopal Mankar | Full Stack Developer |
| Team Members | AI • Backend • Frontend |

---

# 📜 License

This project is released under the MIT License.

---

<div align="center">

## ⭐ If you found this project interesting, consider giving it a star!

<div align="center">

## ⭐ Star this repository if you like the project!

Made with ❤️ by Team CivicSentinel AI

Google Gemini • React • FastAPI • PostgreSQL

</div>


