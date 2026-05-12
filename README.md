# 🏥 CareerMade – Healthcare Job Portal (Frontend)

**CareerMade** is a modern, full-featured healthcare job portal frontend built with **Next.js 15**, designed to connect healthcare professionals (job seekers) with verified healthcare employers across India. The platform supports three user roles — **Job Seeker**, **Employer**, and **Admin** — each with a dedicated dashboard and tailored functionality.

> 🔗 **Backend API:** This frontend connects to a REST API backend at the URL configured via `NEXT_PUBLIC_API_URL` environment variable.

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [User Roles & Functionality](#-user-roles--functionality)
- [Pages & Routes](#-pages--routes)
- [Authentication](#-authentication)
- [UI Components](#-ui-components)
- [Deployment](#-deployment)

---

## ✨ Features

### 🌐 Public Pages
- **Landing Page** – Fully responsive hero section with animated statistics, healthcare specialty browsing (Doctors, Nursing, Technicians, Diagnostics, etc.), feature highlights, trust metrics, testimonials, and CTA section with email subscription
- **Job Browsing (Public)** – Browse available healthcare jobs without login with full filtering and search capabilities
- **User Registration** – Register as either a **Job Seeker** or **Employer** with client-side validation (email, phone, password, name length)
- **User Login** – Email/password authentication with role-based redirection
- **Google OAuth** – "Continue with Google" integration for both login and registration flows
- **OAuth Callback Handling** – Dedicated success/failure pages for Google OAuth flow

### 👤 Job Seeker Dashboard
- **Job Listings with Advanced Filters** – Filter by specialty (24 medical specializations), work mode (On-site, Remote, Full-time), experience (range slider 0–20 years), location (8 major Indian cities), and salary (minimum LPA)
- **Full-Text Search** – Search jobs by title, specialization, city, or state
- **Job Detail View** – Detailed view of individual job postings with full description, requirements, salary, and location
- **Job Applications** – Apply to jobs and track all applications with status updates
- **Bookmark / Save Jobs** – Save/unsave jobs with optimistic UI updates for instant feedback
- **Profile Management** – Create and view jobseeker profile with personal details
- **Resume Builder (InstantCV)** – Build, edit, and preview professional resumes directly within the platform
- **Resume Upload** – Upload existing resume documents
- **Cover Letter Upload** – Upload cover letters for job applications
- **Employer Directory** – Browse and view verified employer profiles
- **Recommended Jobs & Top Organizations** – Sidebar with personalized job recommendations and partner hospital logos (Apollo, Max, Fortis, AIIMS)
- **Pagination** – Paginated job listings (5 jobs per page)
- **Mobile-Responsive Filters** – Collapsible filter panel for mobile devices

### 🏢 Employer Dashboard
- **Job Management** – Full CRUD for job postings:
  - **Create Job** – Comprehensive job creation form with specialization, salary range, experience requirements, location, and description
  - **View Jobs** – List all posted jobs with status indicators
  - **Edit Job** – Modify existing job postings
  - **View Individual Job** – Detailed view of a specific job posting
- **Application Management** – Review and manage applications received for posted jobs
- **Company Profile** – Create and manage employer/company profile
- **Job Listing Cards** – Visual job cards with color-coded status bars, location, salary, and specialization tags

### 🛡️ Admin Dashboard
- **Platform Statistics** – Real-time stats overview (Total Users, Employers, Jobs, Applications) with gradient stat cards
- **User Management** – View and manage all registered users
- **Employer Management** – View and manage all employer accounts
- **Job Management** – View and manage all job listings across the platform
- **Quick Actions** – One-click navigation to manage users, employers, and jobs
- **Platform Overview** – Summary of active users, verified employers, active job postings, and total applications
- **Header Banner** – Branded admin banner with gradient overlay

### 🎨 UI/UX Features
- **Animated Transitions** – Smooth page and component animations using Framer Motion
- **Toast Notifications** – Real-time feedback using React Hot Toast and React Toastify
- **Responsive Design** – Fully mobile-responsive layout across all pages
- **Role-Based Navbar** – Dynamic navigation that adapts based on user role (jobseeker, employer, admin)
- **User Dropdown Menu** – Profile avatar with animated dropdown showing user info, navigation links, and logout
- **Gradient Loader** – Custom branded loading spinner
- **Sticky Navigation** – Persistent header with role-specific navigation items

---

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 15** | React framework with App Router & Turbopack |
| **React 19** | UI library |
| **TypeScript** | Type safety |
| **Tailwind CSS 4** | Utility-first CSS framework |
| **Framer Motion** | Animations & transitions |
| **Lucide React** | Icon library |
| **Axios** | HTTP client |
| **React Hot Toast** | Toast notifications |
| **React Toastify** | Additional toast notifications |
| **Sonner** | Toast library |
| **Radix UI** | Accessible UI primitives (Label, Select, Switch, Slot) |
| **Headless UI** | Unstyled accessible components |
| **shadcn/ui** | Component system (New York style) |
| **class-variance-authority** | Component variant management |
| **Geist Font** | Modern typography (Geist Sans & Geist Mono) |
| **Satoshi & Clash Display** | Additional web fonts |

---

## 📁 Project Structure

```
CareerMade-frontend/
├── app/
│   ├── components/              # Shared UI components
│   │   ├── Card.tsx             # Job/feature cards
│   │   ├── Footer.tsx           # Global footer
│   │   ├── GradientLoader.tsx   # Branded loading spinner
│   │   ├── Jobbers.tsx          # Job listing component
│   │   ├── Land.tsx             # Landing page variant
│   │   ├── Landing.tsx          # Main landing page component
│   │   ├── Navbar.tsx           # Role-based navigation bar
│   │   └── SidebarSection.tsx   # Sidebar section component
│   ├── dashboard/
│   │   ├── admin/               # Admin panel
│   │   │   ├── page.tsx         # Admin dashboard (stats + quick actions)
│   │   │   ├── employers/       # Employer management
│   │   │   ├── jobs/            # Job management
│   │   │   └── users/           # User management
│   │   ├── employee/            # Employer panel
│   │   │   ├── page.tsx         # Employer dashboard
│   │   │   ├── applications/    # Received applications
│   │   │   ├── jobs/            # Job CRUD (create, edit, view, list)
│   │   │   └── profile/         # Company profile (create, view)
│   │   └── jobseeker/           # Job seeker panel
│   │       ├── page.tsx         # Job seeker dashboard (job search)
│   │       ├── applications/    # My applications
│   │       ├── bookmarks/       # Saved/bookmarked jobs
│   │       ├── components/      # Jobseeker-specific components
│   │       ├── employers/       # Browse employers
│   │       ├── jobs/            # Job detail view
│   │       ├── profile/         # Profile management (create, view)
│   │       ├── resume/          # Resume builder (build, edit, preview)
│   │       ├── upload-cover-letter/  # Cover letter upload
│   │       └── upload-resume/   # Resume upload
│   ├── login/                   # Login page
│   ├── register/                # Registration page
│   ├── oauth/                   # OAuth callback handlers
│   │   ├── success/             # OAuth success redirect
│   │   └── failure/             # OAuth failure redirect
│   ├── view-jobs/               # Public job browsing page
│   ├── globals.css              # Global styles & CSS variables
│   ├── layout.tsx               # Root layout (fonts, toaster, footer)
│   └── page.tsx                 # Home page (landing)
├── public/                      # Static assets (logos, images, icons)
├── components.json              # shadcn/ui configuration
├── next.config.ts               # Next.js configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
├── postcss.config.mjs           # PostCSS configuration
└── package.json                 # Dependencies & scripts
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** or **yarn** or **pnpm** or **bun**

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd CareerMade-frontend

# Install dependencies
npm install
```

### Running the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL (e.g., `http://localhost:5000` for local development) |

---

## 👥 User Roles & Functionality

### 1. Job Seeker (`jobseeker`)
| Feature | Route |
|---|---|
| Dashboard (Job Search) | `/dashboard/jobseeker` |
| View Job Details | `/dashboard/jobseeker/jobs/[id]/view` |
| My Applications | `/dashboard/jobseeker/applications` |
| Saved/Bookmarked Jobs | `/dashboard/jobseeker/bookmarks` |
| View Profile | `/dashboard/jobseeker/profile` |
| Create Profile | `/dashboard/jobseeker/profile/create` |
| Resume Manager | `/dashboard/jobseeker/resume` |
| Resume Builder | `/dashboard/jobseeker/resume/build` |
| Edit Resume | `/dashboard/jobseeker/resume/edit` |
| Preview Resume | `/dashboard/jobseeker/resume/preview` |
| Upload Resume | `/dashboard/jobseeker/upload-resume` |
| Upload Cover Letter | `/dashboard/jobseeker/upload-cover-letter` |
| Browse Employers | `/dashboard/jobseeker/employers` |
| View Employer Profile | `/dashboard/jobseeker/employers/[id]` |

### 2. Employer (`employer`)
| Feature | Route |
|---|---|
| Dashboard | `/dashboard/employee` |
| All Job Postings | `/dashboard/employee/jobs` |
| Create Job | `/dashboard/employee/jobs/create` |
| View Job | `/dashboard/employee/jobs/view/[id]` |
| Edit Job | `/dashboard/employee/jobs/edit/[id]` |
| Manage Applications | `/dashboard/employee/applications` |
| View Application | `/dashboard/employee/applications/[id]` |
| Company Profile | `/dashboard/employee/profile` |
| Create Profile | `/dashboard/employee/profile/create` |

### 3. Admin (`admin`)
| Feature | Route |
|---|---|
| Dashboard (Stats & Quick Actions) | `/dashboard/admin` |
| User Management | `/dashboard/admin/users` |
| Employer Management | `/dashboard/admin/employers` |
| Job Management | `/dashboard/admin/jobs` |

---

## 📄 Pages & Routes

| Route | Access | Description |
|---|---|---|
| `/` | Public | Landing page with hero, features, specialties, stats, testimonials |
| `/login` | Public | Email/password login + Google OAuth |
| `/register` | Public | Registration with role selection (jobseeker/employer) |
| `/view-jobs` | Public | Browse all jobs with filters (no auth required) |
| `/oauth/success` | Public | Google OAuth success callback |
| `/oauth/failure` | Public | Google OAuth failure callback |
| `/dashboard/jobseeker` | Jobseeker | Job search dashboard with filters & bookmarks |
| `/dashboard/employee` | Employer | Employer dashboard with job listings |
| `/dashboard/admin` | Admin | Admin dashboard with platform statistics |

---

## 🔑 Authentication

- **JWT-based authentication** – Access tokens stored in `localStorage`
- **Cookie-based refresh tokens** – Sent via `credentials: "include"` on login
- **Google OAuth 2.0** – Redirects to backend `/api/auth/google` with role parameter
- **Role-based access control** – Each dashboard route validates user role before rendering
- **Auto-redirect** – Unauthenticated users are redirected to `/login`
- **Post-login routing:**
  - `jobseeker` → `/dashboard/jobseeker`
  - `employer` → `/dashboard/employee/jobs`
  - `admin` → `/dashboard/admin`

---

## 🧩 UI Components

| Component | Description |
|---|---|
| `Navbar` | Sticky header with role-based navigation, profile dropdown, InstantCV button, notification bell |
| `Landing` | Full landing page with hero, search, specialty cards, stats, testimonials, CTA |
| `Footer` | Global site footer |
| `GradientLoader` | Branded loading animation for async data fetching |
| `Card` | Reusable job/feature card component |
| `Jobbers` | Job listing layout component |
| `SidebarSection` | Sidebar layout for filters and recommendations |
| `ProfileCard` | User profile card component |

---

## 🚢 Deployment

### Vercel (Recommended)

The easiest way to deploy is via the [Vercel Platform](https://vercel.com/new):

1. Push your code to a Git repository
2. Import the project on Vercel
3. Set the `NEXT_PUBLIC_API_URL` environment variable
4. Deploy

### Other Platforms

```bash
npm run build
npm start
```

The app runs on port `3000` by default.

---

## 📝 API Endpoints Used

The frontend communicates with the following backend API endpoints:

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | User registration |
| `POST` | `/api/auth/login` | User login |
| `GET` | `/api/auth/google` | Google OAuth redirect |
| `GET` | `/api/jobs` | Fetch job listings |
| `POST` | `/api/jobs` | Create a new job (employer) |
| `PUT` | `/api/jobs/:id` | Update a job (employer) |
| `GET` | `/api/saved-jobs/saved-jobs` | Get saved jobs (jobseeker) |
| `POST` | `/api/saved-jobs/jobs/:id/save` | Save a job |
| `DELETE` | `/api/saved-jobs/jobs/:id/unsave` | Unsave a job |
| `GET` | `/api/admin/stats` | Admin platform statistics |

---

## 📜 License

This project is private and proprietary.

---

## 👨‍💻 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

<p align="center">
  Built with ❤️ by the <strong>Abhishek</strong>
</p>
