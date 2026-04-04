# GigShield — Admin Web Dashboard
## Phase 2 Frontend Requirements Document
**For: Frontend Engineer**
**Stack: HTML, CSS, JavaScript (Vanilla)**
**Backend: Flask REST API — already built and running**

---

## 1. Overview

This document defines the requirements for the **GigShield Admin Web Dashboard** — a browser-based interface used exclusively by the insurance company/admin team. Workers use the mobile app (separate). This website is the admin control panel.

The website communicates with an already-completed Flask backend via REST API calls using `fetch()` or `axios`. No backend changes are needed.

**Backend base URL:** `http://<server-ip>:5000`

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 |
| Styling | CSS3 (no frameworks required, but Bootstrap or Tailwind are acceptable) |
| Logic | Vanilla JavaScript (ES6+) |
| HTTP calls | `fetch()` API or `axios` via CDN |
| Auth storage | `localStorage` (store JWT token after login) |
| No build tools needed | Plain files, open in browser or served with Live Server |

---

## 3. Authentication

### 3.1 Admin Login Page
**File:** `login.html`

This is the entry point. The admin logs in with their phone number. On success, the JWT token is stored in `localStorage` and the admin is redirected to the dashboard.

**Fields on the page:**
- Phone number input
- Login button
- Error message area (shown if login fails)

**API call:**
```
POST /auth/login
Body: { "phone": "9000000000" }

Response: { "token": "...", "user_id": 1, "role": "admin", "user": {...} }
```

**Logic:**
- On success: store `token` and `user_id` in `localStorage`, redirect to `dashboard.html`
- On failure: show error message — "Invalid phone number or not an admin"
- If `role !== "admin"` in the response, reject login and show error — "Access denied. Admins only."

**All subsequent API calls must include this header:**
```
Authorization: Bearer <token from localStorage>
```

### 3.2 Logout
- A logout button visible on all pages after login
- On click: clear `localStorage`, redirect to `login.html`

### 3.3 Auth Guard
- All pages except `login.html` must check if a token exists in `localStorage` on page load
- If no token found → redirect to `login.html` immediately
- This check runs before any API call is made

---

## 4. Pages & Navigation

The website has 5 pages. Navigation is via a sidebar or top navbar visible on all pages after login.

```
login.html          ← no nav (entry point)
dashboard.html      ← overview stats
workers.html        ← list of all registered workers
policies.html       ← list of all policies
claims.html         ← list of all claims
```

---

## 5. Page-by-Page Requirements

---

### 5.1 Dashboard Page (`dashboard.html`)

**Purpose:** Show the admin a high-level overview of the platform.

**API call:**
```
GET /dashboard/stats
Headers: Authorization: Bearer <token>

Response:
{
  "total_users": 10,
  "active_policies": 7,
  "total_claims": 15,
  "approved_claims": 8,
  "payouts": 5
}
```

**What to display:**

Show 5 stat cards on the page:

| Card Title | Value from API |
|---|---|
| Total Workers | `total_users` |
| Active Policies | `active_policies` |
| Total Claims | `total_claims` |
| Approved Claims | `approved_claims` |
| Total Payouts | `payouts` |

**Additional API calls on this page:**

Also call these two endpoints and show summary tables below the cards:

```
GET /dashboard/claims
→ Show last 5 claims in a table: Claim ID, User ID, Trigger Type, Status, Date

GET /dashboard/payouts
→ Show total_payout amount prominently, e.g. "Total Disbursed: ₹12,500"
```

**Behaviour:**
- Data loads automatically when page opens
- Show a loading spinner while fetching
- Show "Failed to load data" message if API call fails

---

### 5.2 Workers Page (`workers.html`)

**Purpose:** Show a list of all registered gig workers.

**API call:**
```
GET /admin/workers
Headers: Authorization: Bearer <token>

Response:
[
  { "user_id": 1, "name": "Rahul", "email": "rahul@email.com", "role": "worker" },
  ...
]
```

**What to display:**

A table with these columns:

| Column | Field |
|---|---|
| Worker ID | `user_id` |
| Name | `name` |
| Email | `email` (show "—" if null) |
| Role | `role` |

**Behaviour:**
- Table loads on page open
- Show total worker count above the table: "Total Workers: 12"
- If no workers found, show "No workers registered yet."

---

### 5.3 Policies Page (`policies.html`)

**Purpose:** Show all insurance policies created across all workers.

**API call:**
```
GET /admin/policies
Headers: Authorization: Bearer <token>

Response:
{
  "total_policies": 5,
  "policies": [
    {
      "policy_id": 1,
      "user_id": 1,
      "zone_id": 2,
      "status": "ACTIVE",
      "weekly_premium": 45.0,
      "coverage_amount": 1000.0
    },
    ...
  ]
}
```

**What to display:**

A table with these columns:

| Column | Field |
|---|---|
| Policy ID | `policy_id` |
| Worker ID | `user_id` |
| Zone ID | `zone_id` |
| Weekly Premium | `weekly_premium` (show as ₹45.00) |
| Coverage Amount | `coverage_amount` (show as ₹1,000.00) |
| Status | `status` (colour-coded: ACTIVE = green, EXPIRED = grey, CANCELLED = red) |

**Behaviour:**
- Table loads on page open
- Show total count above table: "Total Policies: 5"
- If no policies, show "No policies created yet."

---

### 5.4 Claims Page (`claims.html`)

**Purpose:** Show all claims generated by the trigger engine, with their status.

**API call:**
```
GET /admin/claims
Headers: Authorization: Bearer <token>

Response:
{
  "total_claims": 15,
  "claims": [
    {
      "claim_id": 1,
      "user_id": 1,
      "policy_id": 1,
      "event_id": 2,
      "trigger_type": "rain",
      "status": "APPROVED",
      "created_at": "2026-03-25T10:00:00"
    },
    ...
  ]
}
```

**What to display:**

A table with these columns:

| Column | Field |
|---|---|
| Claim ID | `claim_id` |
| Worker ID | `user_id` |
| Policy ID | `policy_id` |
| Trigger Type | `trigger_type` (show as uppercase badge: RAIN, HEAT, AQI) |
| Status | `status` (colour-coded — see below) |
| Date | `created_at` (formatted as DD-MM-YYYY) |

**Status colour coding:**

| Status | Colour |
|---|---|
| APPROVED | Green |
| PENDING | Orange |
| FLAGGED | Yellow |
| REJECTED | Red |
| PAID | Blue |

**Behaviour:**
- Table loads on page open
- Show total count: "Total Claims: 15"
- If no claims, show "No claims generated yet."

---

## 6. Navigation Bar / Sidebar

Visible on all pages after login. Contains:

- **GigShield Admin** (brand name / logo text)
- Links: Dashboard | Workers | Policies | Claims
- **Logout** button (right side or bottom of sidebar)
- Show logged-in admin name if available from `localStorage`

Active link should be highlighted to show current page.

---

## 7. API Communication Rules

All API calls follow these rules:

**Always include Authorization header:**
```javascript
const token = localStorage.getItem('gigshield_token');

fetch('http://<ip>:5000/admin/workers', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
})
```

**Handle errors consistently:**
- `401` → token expired → clear localStorage → redirect to `login.html`
- `403` → show "Access denied"
- `404` → show "Data not found"
- `500` → show "Server error. Please try again."
- Network failure → show "Cannot connect to server. Check backend is running."

**All currency values** must display with ₹ symbol and 2 decimal places: `₹45.00`

**All dates** from the API (ISO format) must be converted to `DD-MM-YYYY` for display.

---

## 8. File Structure

```
admin-web/
├── login.html
├── dashboard.html
├── workers.html
├── policies.html
├── claims.html
├── css/
│   └── style.css
└── js/
    ├── auth.js          ← login, logout, auth guard, token helpers
    ├── api.js           ← all fetch() calls to backend, one function per endpoint
    ├── dashboard.js     ← logic for dashboard.html
    ├── workers.js       ← logic for workers.html
    ├── policies.js      ← logic for policies.html
    └── claims.js        ← logic for claims.html
```

---

## 9. Backend Endpoints Used (Phase 2 Only)

| Method | Endpoint | Used On | Auth Required |
|---|---|---|---|
| POST | `/auth/login` | login.html | No |
| GET | `/dashboard/stats` | dashboard.html | Yes |
| GET | `/dashboard/claims` | dashboard.html | Yes |
| GET | `/dashboard/payouts` | dashboard.html | Yes |
| GET | `/admin/workers` | workers.html | Yes |
| GET | `/admin/policies` | policies.html | Yes |
| GET | `/admin/claims` | claims.html | Yes |

**Important:** The `Authorization` header sends the token as `Bearer <token>`, not as `X-User-Id`. The backend now uses JWT — do NOT use `X-User-Id` header anywhere.

---

## 10. What NOT to Build (Phase 2 Scope Limit)

Do not build any of the following — these are Phase 3 or mobile-only:

- Worker registration form (mobile app handles this)
- Policy creation form (mobile app handles this)
- Payout processing button
- Simulation / trigger forms
- Any charts or graphs (Phase 3)
- Real-time updates / WebSockets

---

## 11. Workflow Summary

```
Admin opens browser
        │
        ▼
  login.html
  Enter phone → POST /auth/login
  Store token in localStorage
        │
        ▼
  dashboard.html (auto-loads on login)
  Shows: total workers, policies, claims, approved claims, payouts
  Shows: last 5 claims table
  Shows: total disbursed amount
        │
  Sidebar navigation
        ├── workers.html  → GET /admin/workers  → table of all workers
        ├── policies.html → GET /admin/policies → table of all policies
        └── claims.html   → GET /admin/claims   → table of all claims with status
        │
  Logout button
  Clears localStorage → back to login.html
```

---

## 12. Notes for the Frontend Engineer

- The backend is running locally. Use the actual IP address of the backend machine — do not use `localhost` unless running on the same machine.
- The backend returns `role: "admin"` in the login response. Use this to verify the user is an admin before allowing access.
- All data is already formatted correctly by the backend. No calculations needed on the frontend — just display what the API returns.
- Token expiry: if any API call returns `401`, it means the token has expired. Clear `localStorage` and redirect to login.
- Test each page independently using the browser's Network tab to confirm API calls are succeeding before building UI.
