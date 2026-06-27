# CivicSentinel-AI
<div align="center">

# 🚀 CivicSentinel AI

### Intelligent Hyperlocal Civic Response Platform Powered by Google Gemini AI

<img src="https://chatgpt.com/s/m_6a3f4c41af188191b59072d519956751" alt="CivicSentinel AI Banner" width="100%">

[![Google Gemini](https://img.shields.io/badge/Google-Gemini%20API-blue?logo=google)]()
[![Google Cloud](https://img.shields.io/badge/Google-Cloud-orange?logo=googlecloud)]()
[![React](https://img.shields.io/badge/React-19-blue?logo=react)]()
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-green?logo=fastapi)]()
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue?logo=postgresql)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)]()
[![License](https://img.shields.io/badge/License-MIT-success)]()

### 🏆 Coding Ninjas × Google for Developers — Vibe2Ship Hackathon 2026

**Building the Future of AI-Powered Civic Intelligence**

</div>

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

## 🤖 AI-Powered Issue Analysis

- AI image understanding using Google Gemini
- Automatic issue categorization
- AI-generated descriptions
- Severity estimation
- Intelligent tagging

---

## 📍 Smart Geolocation

- Automatic GPS detection
- Interactive city maps
- Nearby issue discovery
- Marker clustering
- Location-aware reporting

---

## 🧠 Intelligent Duplicate Detection

Multiple users often report the same issue.

Instead of creating duplicate complaints, CivicSentinel AI:

- compares nearby locations
- checks issue similarity
- merges duplicate reports
- increases community verification count

---

## ⚡ AI Priority Engine

Every issue receives an intelligent priority score based on:

- Issue severity
- Community verification
- Frequency of reports
- Infrastructure impact

Priority Levels

🔴 Critical

🟠 High

🟡 Medium

🟢 Low

---

## 👥 Community Verification

Nearby citizens can:

✅ Verify reports

✅ Upvote issues

✅ Add supporting evidence

This improves report authenticity and reduces spam.

---

## 🏛️ Authority Dashboard

Authorities can:

- Monitor live reports
- Filter issues
- Change issue status
- View analytics
- Track response time
- Prioritize work orders

---

## 📊 Analytics Dashboard

Interactive dashboards include:

- Total Issues
- Active Issues
- Resolved Issues
- Average Resolution Time
- Category Distribution
- Heatmaps
- Citizen Participation

---

## 🌍 Google Technologies

| Technology | Purpose |
|------------|---------|
| Google Gemini API | AI-powered issue understanding |
| Google AI Studio | Prompt development |
| Google Cloud | Application deployment |
| Google Maps | Location services |
| Firebase Authentication | Secure authentication |
| Firebase Cloud Messaging | Notifications |

---

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

- 🎙️ Voice Reporting
- 🌐 Multilingual Support
- 📡 Offline Reporting
- 🤝 Volunteer Coordination
- 🔔 Push Notifications
- 📈 Predictive Infrastructure Analytics
- 🤖 AI Chat Assistant
- 📷 Before/After AI Verification

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

**Built with ❤️ using Google Gemini AI and Google Cloud**

</div>
