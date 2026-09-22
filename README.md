# CarbonMap
### Personal Carbon Footprint Tracker

**Tagline:** *"Map your impact. Make better choices."*

**Supporting Vision:** *Track everyday activities, understand your carbon footprint, and discover practical ways to reduce your impact.*

**HACKATHON ID:** `AZIS-FGXF58`

---

## 1. Problem Statement

Every day, individual decisions — how we commute, the electricity we power our appliances with, and the food we consume — directly drive global greenhouse gas emissions. However, carbon emissions remain abstract and invisible in everyday life. Most people have no intuitive gauge of how a 10 km car commute compares to a train ride, or how simple dietary changes influence their personal contribution to climate change.

## 2. Solution: CarbonMap

**CarbonMap** is a polished climate-tech SaaS web application designed to turn daily human choices into measurable, visible, and actionable carbon metrics. By coupling deterministic, scientific emission factors with intuitive visual analytics and intelligent AI-powered coaching, CarbonMap transforms complex environmental accounting into practical, habit-forming daily sustainability.

---

## 3. Five Core Features

1. **Log an Activity**:
   A streamlined, responsive logging interface supporting six everyday activities:
   - **Car Travel** (km)
   - **Bus Travel** (km)
   - **Flight** (km)
   - **Electricity** (kWh)
   - **Vegetarian Meal** (meals)
   - **Non-Vegetarian Meal** (meals)
   Includes dynamic unit switching, instant transparent calculation previews, and user notes.

2. **Deterministic CO₂ Calculation**:
   A dedicated backend calculation engine enforcing official hackathon emission factors:
   - **Car**: `0.20 kg CO₂ / km`
   - **Bus**: `0.08 kg CO₂ / km`
   - **Flight**: `0.25 kg CO₂ / km`
   - **Electricity**: `0.80 kg CO₂ / kWh`
   - **Vegetarian Meal**: `0.50 kg CO₂ / meal`
   - **Non-Vegetarian Meal**: `2.00 kg CO₂ / meal`
   Every value is computed strictly on the backend to 2 decimal places. Frontend CO₂ values are never trusted.

3. **Professional Dashboard**:
   A modern climate-tech dashboard featuring:
   - **4 Core KPI Stat Cards**: Total CO₂, This Week (Mon–Sun), Weekly Target, Remaining allowance.
   - **Carbon Trend Chart**: Interactive Recharts daily area chart across Monday through Sunday.
   - **Category Breakdown Chart**: Donut chart segmenting Transport, Electricity, and Food.
   - **Quick Demo Data Loader**: Enables evaluators to instantly experience a populated dashboard.

4. **Carbon Limits & Target**:
   Persistent daily and weekly carbon limits (stored in MongoDB, default Daily Limit: `5.50 kg CO₂e`, Weekly Limit: `38.50 kg CO₂e`). Dynamic progress visualization tracks percentage consumed, remaining budget, and switches visual states (Normal, Near Target, Exceeded). Pacing updates immediately when activities are logged or deleted.

5. **History & Multi-Parameter Filter**:
   Full audit trail of logged activities in a responsive table and mobile card layout.
   - Filter by **Activity Type** (All, Car, Bus, Flight, Electricity, Vegetarian, Non-Vegetarian).
   - Filter by **Date Period** (All Time, Today, This Week, This Month, Custom Date Range).
   - Delete confirmation modal with immediate recalculation of all dashboard metrics.

---

## 4. Hackathon Decision Points

### DP1 — The Nudge
- **Decision:** **Encourage + Inform + Suggest** (Never shame or block the user).
- **Implementation:** When the weekly target is exceeded, CarbonMap displays a supportive banner: *"You're above your weekly carbon target. That's okay — small changes can still make a difference."* It analyzes the user's highest emission contributor for the week to give tailored, realistic alternatives (e.g. carpooling or swapping a meal) rather than penalizing or disabling logging.

### DP2 — Absurd Input
- **Decision:** **Reject obviously unrealistic inputs** on both frontend and backend.
- **Thresholds:**
  - Car: max `2,000 km` per entry
  - Bus: max `1,000 km` per entry
  - Flight: max `20,000 km` per entry
  - Electricity: max `5,000 kWh` per entry
  - Meals: max `50 meals` per entry
- **Behavior:** Entering an extreme number (e.g., `500,000 km`) triggers an alert modal: *"This value looks unusually high. Please check the distance before saving this activity"* with **Cancel** and **Edit Value** options. The backend validation middleware enforces this rule, returning HTTP 400.

### DP3 — The Week
- **Decision:** **Monday 00:00 through Sunday 23:59 (Local Time)**.
- **Implementation:** Adheres to the ISO standard work-week cycle. Used uniformly across queries, charts, targets, and history. Displays explicit mid-week progress (e.g. *"Wednesday • Day 3 of 7 • 12.40 / 20.00 kg (62%)"*).

---

## 5. AI Feature — Eco Coach

**CarbonMap Eco Coach** delivers personalized reduction strategies based on your actual logged activities:
- Analyzes weekly category proportions (e.g., *"Your transport activities make up 64% of your footprint this week"*).
- Calculates tangible impact (e.g., *"Replacing one 10 km car trip with a bus trip saves ~1.20 kg CO₂"*).
- **Authoritative Source of Truth:** AI never calculates official CO₂ numbers; it interprets deterministically verified numbers.
- **Intelligent Fallback:** If `AI_API_KEY` is not provided, a deterministic fallback engine generates contextual advice directly from MongoDB stats, ensuring 100% functionality without external API failures.

---

## 6. Technology Stack

- **Frontend:** React 18, Vite, Tailwind CSS, React Router v6, Recharts, Lucide React
- **Backend:** Node.js, Express.js, REST API, Helmet, CORS
- **Database:** MongoDB, Mongoose (with automated In-Memory MongoDB fallback for zero-friction local grading)
- **AI Integration:** Google Gemini API / LLM-ready with deterministic local fallback

---

## 7. Architecture

```
User Browser (React 18 + Vite + Tailwind CSS)
     │
     ▼ REST API (JSON)
Express.js Server (Port 5000)
 ├── Security & Validation Middleware (Helmet, CORS, DP2 Absurd Input Guard)
 ├── Deterministic Carbon Calculator (Hackathon Emission Factors)
 ├── Eco Coach Engine (AI / Smart Deterministic Fallback)
 └── Dashboard Aggregator (Mon–Sun Bounds & Category Rollups)
     │
     ▼ Mongoose ODM
MongoDB Atlas / In-Memory MongoDB
 ├── activities collection
 └── targets collection
```

---

## 8. Authentication Notice

> **Authentication is intentionally not implemented because the hackathon requires graders to access all features without creating an account.**
>
> Graders can immediately access the dashboard, log activities, set targets, and inspect history without any login, registration, or credentials.

**Test Credentials:** *Not applicable — authentication is not implemented.*

---

## 9. Local Setup & Running Instructions

### Prerequisites
- Node.js (v18+ recommended, v24 verified)
- npm (v9+)

### Installation
Clone or navigate to the repository root and run:

```bash
# Install dependencies for both server and client
npm run install:all
```

### Running Locally

You can launch both services easily:

**Terminal 1 — Backend API:**
```bash
cd server
npm start
# Runs on http://localhost:5000
```
*(Note: If no `MONGODB_URI` is provided, an in-memory MongoDB database automatically boots up so you can test immediately with zero configuration!)*

**Terminal 2 — Frontend Application:**
```bash
cd client
npm run dev
# Runs on http://localhost:5173
```

Now open your browser at **http://localhost:5173** to use CarbonMap.

### Running Automated Calculator Tests
```bash
npm test
# Or from server directory:
cd server && npm test
```

---

## 10. Environment Variables

Reference template available in `.env.example`:

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Backend server port | `5000` |
| `MONGODB_URI` | MongoDB Atlas connection string | In-Memory DB (if empty) |
| `CLIENT_URL` | Allowed frontend origin for CORS | `http://localhost:5173` |
| `AI_API_KEY` | (Optional) Gemini API Key for Eco Coach | Uses deterministic coach if empty |
| `VITE_API_URL` | Frontend API endpoint | `http://localhost:5000/api` |

---

## 11. REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health and uptime |
| `GET` | `/api/dashboard` | Aggregated stats, trends, breakdown & nudge |
| `GET` | `/api/activities` | List activities with filters (`type`, `period`, `startDate`, `endDate`) |
| `GET` | `/api/activities/:id` | Retrieve single activity |
| `POST` | `/api/activities` | Calculate & log new activity (with DP2 validation) |
| `DELETE`| `/api/activities/:id` | Delete activity and trigger instant recalculation |
| `GET` | `/api/target` | Retrieve current weekly carbon target |
| `PUT` | `/api/target` | Update weekly carbon target in MongoDB |
| `POST` | `/api/ai/eco-coach` | Get personalized reduction advice |
| `POST` | `/api/demo/seed` | Seed realistic demo activities for current week |
| `DELETE`| `/api/demo/clear` | Clear activities for fresh testing |

---

## 12. Deployment Guide

### Frontend Deployment (Vercel)
1. Set Framework Preset: **Vite**
2. Root Directory: `client`
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Environment Variable:
   - `VITE_API_URL`: `https://your-backend-service.onrender.com/api`

### Backend Deployment (Render / Railway)
1. Root Directory: `server`
2. Build Command: `npm install`
3. Start Command: `npm start`
4. Environment Variables:
   - `MONGODB_URI`: `mongodb+srv://<user>:<password>@cluster.mongodb.net/carbonmap`
   - `CLIENT_URL`: `https://your-carbonmap.vercel.app`
   - `PORT`: `5000`
   - `AI_API_KEY`: `<optional-gemini-key>`

---

## 13. Hackathon 3–4 Minute Demo Script

1. **Open CarbonMap**: Grader opens the root URL and lands directly on the clean climate-tech dashboard (no login required).
2. **Load Demo Data**: Click **"Load Demo Data"** to instantly populate realistic weekly activities.
3. **Explore Dashboard**:
   - Total CO₂ and active week metrics.
   - Recharts Trend Area Chart showcasing Monday through Sunday daily footprints.
   - Category Breakdown Donut Chart showing Transport, Electricity, and Food shares.
4. **Log an Activity**:
   - Navigate to **"Log Activity"**. Select **Car Travel**, enter **10 km**.
   - Observe real-time transparent preview: `10 km × 0.20 kg/km = 2.00 kg CO₂`.
   - Submit and verify the success toast notification.
5. **Demonstrate DP2 (Absurd Input)**:
   - Enter **500,000 km** for Car Travel.
   - See the immediate DP2 alert modal rejecting the input and offering **Cancel** / **Edit Value**.
6. **Demonstrate Weekly Target & DP1 (The Nudge)**:
   - Edit weekly target to a lower amount (e.g. `5 kg`) or log another travel activity to exceed target.
   - Watch the target card transition to "Target Exceeded" with a red progress bar.
   - Observe the **Supportive Nudge Banner** providing encouraging, non-shaming suggestions based on actual highest contributor.
7. **Demonstrate AI Eco Coach**:
   - View personalized savings recommendations and click **"Refresh Analysis"**.
8. **Inspect History & Filter**:
   - Navigate to **"History"**.
   - Filter by **"Car Travel"** — see table instantly filter down.
   - Click the delete icon on an activity — confirm deletion and see totals immediately recalculate.
9. **Responsive Design**:
   - Resize window or test mobile screen — all tables, charts, and navigation collapse into clean, overflow-free mobile components.
