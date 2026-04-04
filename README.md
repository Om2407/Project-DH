# 🏌️ GolfGives — Golf Charity Subscription Platform

> A modern subscription-based golf platform combining performance tracking, monthly prize draws, and charitable giving. Built for the Digital Heroes Full-Stack Trainee Selection Process.

<br/>

🌐 **Live Demo:** [https://digitalheroes-omega.vercel.app/](https://digitalheroes-omega.vercel.app/)

<br/>

![GolfGives Hero](./screenshots/gg1.png)

---

## 📋 Project Overview

GolfGives is a full-stack web application that allows golfers to:

- 🏌️ Subscribe to monthly/yearly plans with secure payment
- ⛳ Enter Stableford golf scores (last 5 retained automatically)
- 🎰 Participate in monthly prize draws
- ❤️ Support a charity of their choice with a portion of their subscription
- 🏆 Win prizes based on score matching (3, 4, or 5 number match)

<br/>


<img width="1920" height="868" alt="gg" src="https://github.com/user-attachments/assets/e2435f4c-6c9c-4038-bc94-03b863c7abfb" />


---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Authentication | JWT (JSON Web Tokens) |
| Payments | Razorpay (PCI-compliant) |
| Deployment | Vercel (Frontend) + Render (Backend) |

---

## ✨ Features

### 👤 User Panel
- ✅ Signup / Login with JWT authentication
- ✅ Monthly & Yearly subscription plans (£9.99 / £89.99)
- ✅ Razorpay payment integration
- ✅ Stableford score entry (1–45 range, last 5 retained)
- ✅ Charity selection from directory (search & filter)
- ✅ User dashboard — scores, subscription, draws, winnings
- ✅ Monthly draw participation

### 🛠️ Admin Panel
- ✅ View & manage all users
- ✅ Subscription management
- ✅ Charity add / edit / delete
- ✅ Draw configuration & results publishing
- ✅ Winner verification & payout tracking
- ✅ Analytics — total users, prize pool, charity totals

### 🎨 Design
- ✅ Mobile-first fully responsive design
- ✅ Modern emotion-driven UI (no golf clichés)
- ✅ Charity directory with search & filter by category
- ✅ Prize pool logic (40% / 35% / 25% split)
- ✅ Jackpot rollover system

---

## 🏗️ Project Structure

```
golf-charity-platform/
├── frontend/
│   └── vite-project/
│       ├── src/
│       │   ├── components/
│       │   │   ├── Navbar.jsx
│       │   │   ├── Footer.jsx
│       │   │   ├── HeroSection.jsx
│       │   │   ├── HowItWorks.jsx
│       │   │   ├── CharitySection.jsx
│       │   │   └── PricingSection.jsx
│       │   ├── pages/
│       │   │   ├── Home.jsx
│       │   │   ├── Login.jsx
│       │   │   ├── Signup.jsx
│       │   │   ├── Dashboard.jsx
│       │   │   ├── Charities.jsx
│       │   │   ├── Pricing.jsx
│       │   │   └── admin/
│       │   │       └── AdminDashboard.jsx
│       │   ├── context/
│       │   │   └── AuthContext.jsx
│       │   └── App.jsx
│       └── package.json
│
└── backend/
    ├── controllers/
    │   ├── authController.js
    │   ├── paymentController.js
    │   ├── scoreController.js
    │   ├── drawController.js
    │   └── adminController.js
    ├── models/
    │   ├── User.js
    │   ├── Charity.js
    │   ├── Draw.js
    │   └── Score.js
    ├── routes/
    │   ├── auth.js
    │   ├── charity.js
    │   ├── payment.js
    │   ├── scores.js
    │   ├── draw.js
    │   └── admin.js
    ├── middleware/
    │   └── auth.js
    ├── seed.js
    └── index.js
```

---

## 🔧 Local Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Razorpay account (test mode)

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/golf-charity-platform.git
cd golf-charity-platform
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `backend/.env`:
```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_jwt_secret_key
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
CLIENT_URL=http://localhost:5173
```

```bash
# Seed database with sample charities
node seed.js

# Start backend server
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend/vite-project
npm install
```

Create `frontend/vite-project/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
```

### 4. Open in browser
```
http://localhost:5173
```

---

## 🧪 Test Credentials

### 👤 User Account
```
Email:    test@golfgives.com
Password: test123456
```

### 🛠️ Admin Account
```
Email:    admin@golfgives.com
Password: admin123456
```

### 💳 Test Payment (Razorpay Test Mode)
```
Card Number: 4111 1111 1111 1111
Expiry:      12/26
CVV:         123
OTP:         1234
```

---

## 📊 Prize Pool Logic

| Match Type | Pool Share | Rollover |
|-----------|-----------|---------|
| 🏆 5-Number Match | 40% | ✅ Yes (Jackpot) |
| 🥈 4-Number Match | 35% | ❌ No |
| 🥉 3-Number Match | 25% | ❌ No |

> Jackpot carries forward to next month if no 5-match winner is found.

---

## 🌍 API Endpoints

### Auth
```
POST   /api/auth/register       Register new user
POST   /api/auth/login          Login user
```

### Scores
```
GET    /api/scores              Get user scores
POST   /api/scores              Add new score
```

### Charity
```
GET    /api/charity             List all charities
GET    /api/charity/my          Get user's selected charity
POST   /api/charity/select      Select a charity
GET    /api/charity/:id         Get charity by ID
POST   /api/charity/:id/donate  Independent donation
```

### Payment
```
POST   /api/payment/create-order    Create Razorpay order
POST   /api/payment/verify          Verify payment & activate subscription
GET    /api/payment/status          Get subscription status
POST   /api/payment/cancel          Cancel subscription
```

### Draw
```
GET    /api/draw/my             Get user's draw history
GET    /api/draw/latest         Get latest draw results
```

### Admin
```
GET    /api/admin/stats         Platform analytics
GET    /api/admin/users         All users list
POST   /api/admin/draw/run      Run monthly draw
```

---

## 🚀 Deployment

### Frontend — Vercel
1. Connect GitHub repo to [Vercel](https://vercel.com)
2. Set root directory: `frontend/vite-project`
3. Add environment variable:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```

### Backend — Render
1. Connect GitHub repo to [Render](https://render.com)
2. Set root directory: `backend`
3. Build command: `npm install`
4. Start command: `node index.js`
5. Add all environment variables from `.env`

---

## 📱 Screenshots

### 🏠 Homepage — Hero Section
![Homepage Hero](./screenshots/gg1.png)

*Modern, emotion-driven landing page with golf score visualization and clear CTAs*

### ❤️ Charity Section
![Charity Section](./screenshots/gg.png)

*Featured charities with amounts raised — users choose where their subscription goes*

---

## 🏆 Built For

**Digital Heroes** — Full-Stack Development Trainee Selection Process

> 🌐 [digitalheroes.co.in](https://digitalheroes.co.in) | Premium Full-Stack Development & Digital Marketing Agency

---

## 👨‍💻 Developer Notes

- **MongoDB** used instead of Supabase — functionally equivalent, email stated "any tools or methods allowed"
- **Razorpay** used instead of Stripe — PCI-compliant equivalent, better suited for INR payments
- All PRD requirements implemented: subscription engine, score management, draw system, charity integration, admin dashboard

---

*© 2026 GolfGives — Play Golf. Win Prizes. Change Lives.* 🏌️❤️
