# Freelancer-Client Matching System — Frontend

A React + Vite frontend for the Freelancer-Client Matching Platform. Connects clients with the right freelancers based on skill matching.

🔗 **Live Demo:** [freelancer-client-matchingsystem-fr.vercel.app](https://freelancer-client-matchingsystem-fr.vercel.app)

---

## Features

### For Freelancers
- Register and set up a profile with skills, portfolio URL, and hourly rate
- Upload PDF resume to automatically extract skills
- Browse all available projects with category and budget filters
- Get matched to projects ranked by skill overlap percentage
- Submit proposals with bid amount and description
- Track proposal statuses (Pending / Accepted / Rejected)
- View ratings and reviews received from clients
- Real-time messaging with clients
- AI-powered chatbot assistant

### For Clients
- Post projects with title, description, required skills, budget, and deadline
- View all proposals received for each project
- Accept or reject proposals
- Browse all freelancers on the platform
- Get matched freelancers ranked by skill overlap for each project
- Message freelancers directly
- Give star ratings and feedback after project completion
- AI-powered chatbot assistant

### For Admins
- View platform overview and statistics
- Manage freelancer and client accounts (block / unblock / delete)
- Approve or reject job postings
- View system-wide reports

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| Vite | Build tool |
| React Router v6 | Client-side routing |
| Axios | HTTP requests |
| Context API | Auth state management |
| CSS | Custom styling |

---

## Project Structure

```
src/
├── components/
│   ├── Chatbot.jsx        # Floating AI chatbot widget
│   ├── Chatbot.css
│   └── ProtectedRoute.jsx # Role-based route protection
├── context/
│   └── AuthContext.jsx    # Global auth state
├── pages/
│   ├── HomePage.jsx
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── FreelancerDashboard.jsx
│   ├── ClientDashboard.jsx
│   └── AdminDashboard.jsx
└── App.jsx
```

---

## Getting Started Locally

### Prerequisites
- Node.js 18+
- Backend running on `http://localhost:8080`

### Installation

```bash
# Clone the repo
git clone https://github.com/Visshwasmai24/freelancer_client_matchingsystem_frontend.git
cd freelancer_client_matchingsystem_frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:8080" > .env

# Start development server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL |

---

## Deployment

Deployed on **Vercel** with automatic deployments on every push to `main`.

Set `VITE_API_URL` to your backend URL in Vercel's Environment Variables settings.

---

## Related

- [Backend Repository](https://github.com/Visshwasmai24/freelancer_client_matchingsystem_backend)
