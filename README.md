# Stakepedia

> The #1 AI Tools Directory — Discover, compare and learn about AI tools, courses, prompts and resources.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Getting Started](#getting-started)
6. [Environment Variables](#environment-variables)
7. [API Reference](#api-reference)
8. [Features](#features)
9. [Authentication & Security](#authentication--security)
10. [Admin Panel](#admin-panel)
11. [Database Models](#database-models)
12. [Deployment](#deployment)
13. [Contributing](#contributing)
14. [License](#license)

---

## Project Overview

Stakepedia is a full-stack MERN monorepo consisting of three projects:

| Project | Description | Port |
|---------|-------------|------|
| `server/` | Express + MongoDB REST API | 5000 |
| `admin/` | React + Vite admin dashboard | 5174 |
| `webapp/` | React + Vite public-facing website | 5173 |

The platform allows users to browse AI tools, enroll in courses, read blogs, use prompt templates and write reviews — all managed through a fully-featured admin panel with role-based access control, two-factor authentication and audit logging.

---

## Architecture

```
stakepedia/
├── server/          # Express REST API
├── admin/           # Admin dashboard (React + Vite)
└── webapp/          # Public website (React + Vite)
```

### System Design

```
Browser (webapp)  ──┐
Browser (admin)   ──┼──► Express API ──► MongoDB
Google OAuth      ──┘         │
                              ├──► Cloudinary (images)
                              ├──► Nodemailer (email)
                              └──► Node-cron (scheduled jobs)
```

---

## Tech Stack

### Server

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 18+ (ESM modules) |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Authentication | JWT (access + refresh tokens), Google OAuth 2.0 |
| Two-Factor Auth | speakeasy (TOTP), qrcode |
| File Uploads | Multer + Cloudinary |
| Email | Nodemailer + Handlebars templates |
| Validation | express-validator |
| Security | helmet, cors, express-rate-limit |
| Scheduled Jobs | node-cron |
| Password Hashing | bcryptjs |

### Admin Dashboard

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + Vite 7 |
| Styling | Tailwind CSS v4 + shadcn/ui |
| State Management | Zustand v5 |
| Server State | TanStack Query v5 |
| Routing | React Router v7 |
| Forms | React Hook Form v7 + Zod v4 |
| Rich Text | TipTap v3 |
| Drag & Drop | dnd-kit |
| Charts | Recharts v3 |
| Notifications | Sonner v2 |

### Public Webapp

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + Vite 7 |
| Styling | Tailwind CSS v4 + shadcn/ui |
| State Management | Zustand v5 |
| Server State | TanStack Query v5 |
| Routing | React Router v7 |
| Forms | React Hook Form v7 + Zod |
| Notifications | Sonner v2 |

---

## Project Structure

### Server (`server/src/`)

```
server/src/
├── server.js                    # Entry point, all routes mounted
├── config/
│   ├── db.config.js             # MongoDB connection
│   ├── cloudinary.config.js     # Cloudinary setup + verification
│   ├── mailer.config.js         # Nodemailer setup + verification
│   └── passport.config.js       # Google OAuth strategy
├── models/
│   ├── User.model.js            # User accounts
│   ├── Admin.model.js           # Admin accounts with 2FA + permissions
│   ├── AITool.model.js          # AI tool listings
│   ├── Blog.model.js            # Blog posts
│   ├── Course.model.js          # Courses with embedded lessons
│   ├── Prompt.model.js          # Prompt templates
│   ├── Category.model.js        # Tool categories
│   ├── Tag.model.js             # Content tags
│   ├── Review.model.js          # Polymorphic reviews
│   ├── Comment.model.js         # Blog comments
│   ├── AuditLog.model.js        # Admin action audit trail (90-day TTL)
│   ├── Notification.model.js    # Admin notifications (60-day TTL)
│   ├── EmailLog.model.js        # Email delivery logs
│   ├── EmailTemplate.model.js   # Handlebars email templates
│   └── SiteSettings.model.js   # Global site configuration
├── controllers/
│   ├── auth.controller.js       # User auth (register, login, OAuth, reset)
│   ├── adminAuth.controller.js  # Admin auth with 2FA
│   ├── adminManage.controller.js# Admin CRUD + permissions
│   ├── adminUser.controller.js  # User management
│   ├── adminAITool.controller.js# AI tool CRUD + publish/archive
│   ├── adminBlog.controller.js  # Blog CRUD + publish/archive
│   ├── adminCourse.controller.js# Course CRUD + lesson management
│   ├── adminPrompt.controller.js# Prompt CRUD + featured
│   ├── adminCategory.controller.js # Category CRUD + reorder
│   ├── adminTag.controller.js   # Tag CRUD
│   ├── adminEmail.controller.js # Email templates + campaigns + logs
│   ├── adminSettings.controller.js # Site settings + maintenance mode
│   ├── analytics.controller.js  # Dashboard stats
│   ├── auditLog.controller.js   # Audit log queries
│   ├── notification.controller.js # Admin notifications
│   ├── blog.controller.js       # Public blog endpoints
│   ├── comment.controller.js    # Blog comments
│   ├── course.controller.js     # Public course + lesson endpoints
│   ├── prompt.controller.js     # Public prompts
│   ├── review.controller.js     # User reviews + moderation
│   ├── profile.controller.js    # User profile + avatar + saved tools
│   ├── search.controller.js     # Global search
│   └── upload.controller.js     # Image upload via Cloudinary
├── routes/                      # 26 route files (see API Reference)
├── middleware/
│   ├── auth.middleware.js       # protect, protectAdmin, protectAny, requireRole
│   ├── audit.middleware.js      # createAuditLog, auditMiddleware
│   ├── error.middleware.js      # notFound, errorHandler
│   ├── maintenance.middleware.js# 503 when maintenance mode is on
│   ├── rateLimit.middleware.js  # globalLimiter, authLimiter, emailLimiter
│   ├── upload.middleware.js     # uploadSingle, uploadMultiple, uploadFields
│   └── validate.middleware.js  # express-validator result handler
├── services/
│   ├── email.service.js         # sendEmail, sendWelcome, sendVerification, etc.
│   ├── twoFactor.service.js     # generate2FASecret, generateQRCode, verify2FAToken
│   ├── notification.service.js  # createNotification, notifyAllSuperAdmins
│   ├── seed.service.js          # seedSuperAdmin, seedDefaultSettings, seedTemplates
│   └── cron.service.js          # Cleanup jobs (unverified users, email logs)
├── utils/
│   ├── apiResponse.js           # successResponse, errorResponse, paginatedResponse
│   ├── crypto.utils.js          # generateToken, hashToken
│   ├── jwt.utils.js             # generateAccessToken, generateRefreshToken
│   ├── pagination.utils.js      # getPagination, buildPaginationMeta
│   └── slug.utils.js            # generateSlug, generateUniqueSlug
└── validators/
    ├── auth.validators.js
    ├── aitool.validators.js
    ├── blog.validators.js
    ├── category.validators.js
    ├── comment.validators.js
    ├── course.validators.js
    ├── prompt.validators.js
    ├── review.validators.js
    └── tag.validators.js
```

### Admin (`admin/src/`)

```
admin/src/
├── api/                         # Axios API layer (16 files)
├── components/
│   ├── layout/
│   │   ├── AdminLayout.jsx      # Root layout with sidebar + topbar
│   │   ├── Sidebar.jsx          # Collapsible nav with permission filtering
│   │   └── TopBar.jsx           # Theme toggle, notifications, user dropdown
│   └── shared/
│       ├── DataTable.jsx        # Reusable table with skeletons + pagination
│       ├── ConfirmDialog.jsx    # Reusable delete/action confirmation
│       ├── ImageUploader.jsx    # Drag-drop upload to Cloudinary
│       ├── RichTextEditor.jsx   # TipTap editor with full toolbar
│       ├── TagInput.jsx         # Badge-style tag picker
│       ├── FilterBar.jsx        # Select-based filter row
│       ├── SearchInput.jsx      # Debounced search input
│       ├── PageHeader.jsx       # Title + breadcrumbs + actions slot
│       ├── StatusBadge.jsx      # Colored status pills
│       ├── EmptyState.jsx       # Empty state with icon + CTA
│       ├── PermissionGate.jsx   # Conditional render by permission
│       └── ProtectedRoute.jsx   # Auth guard
├── hooks/
│   ├── useAdminAuth.js          # Login, 2FA, logout mutations
│   ├── useNotifications.js      # Fetch + poll + mark read
│   └── usePermission.js         # hasPermission, isSuperAdmin
├── store/
│   ├── authStore.js             # Admin auth state (Zustand persist)
│   ├── themeStore.js            # Theme + colors + font (Zustand persist)
│   └── uiStore.js               # Sidebar collapsed state
└── pages/
    ├── auth/                    # Login, 2FA, Setup2FA, Forgot/Reset password
    ├── dashboard/               # Stats, charts, recent activity
    ├── ai-tools/                # List + Form (4-tab)
    ├── blogs/                   # List + Form (rich text)
    ├── courses/                 # List + Form + LessonBuilder (dnd-kit)
    ├── prompts/                 # List + Form with variable editor
    ├── categories/              # List + inline create/edit
    ├── tags/                    # List + quick-add
    ├── users/                   # List + Detail view
    ├── admins/                  # List + Create + Permissions editor
    ├── moderation/              # Queue + Reviews + Comments
    ├── email/                   # Templates + Campaigns + Logs
    ├── audit/                   # Audit log with expandable diffs
    ├── settings/                # Site settings + Theme settings
    └── profile/                 # Admin profile + 2FA management
```

### Webapp (`webapp/src/`)

```
webapp/src/
├── api/                         # Axios API layer (10 files)
├── components/
│   ├── layout/
│   │   ├── MainLayout.jsx       # Navbar + Outlet + Footer
│   │   ├── AuthLayout.jsx       # Split-screen auth layout
│   │   ├── Navbar.jsx           # Sticky nav with search + user menu
│   │   └── Footer.jsx           # Links + social + copyright
│   └── shared/
│       ├── PageLoader.jsx       # Full-screen loading spinner
│       ├── ProtectedRoute.jsx   # Auth guard → redirect to login
│       ├── EmptyState.jsx       # Empty state component
│       ├── Pagination.jsx       # Smart page navigator
│       ├── StarRating.jsx       # Configurable star display
│       ├── PricingBadge.jsx     # Coloured free/paid/freemium badges
│       └── ReviewForm.jsx       # Star picker + title + content form
├── store/
│   ├── authStore.js             # User auth state (Zustand persist)
│   └── themeStore.js            # Dark/light/system theme
└── pages/
    ├── Home.jsx                 # Hero, categories, featured tools/courses/blogs
    ├── ai-tools/
    │   ├── AIToolsList.jsx      # Grid with search + category/pricing/sort filters
    │   └── AIToolDetail.jsx     # Tabs: overview, features, prompts, reviews
    ├── blogs/
    │   ├── BlogsList.jsx        # List with search + pagination
    │   └── BlogDetail.jsx       # Full post + comments + like + reviews
    ├── courses/
    │   ├── CoursesList.jsx      # Grid with level/pricing filters
    │   ├── CourseDetail.jsx     # Curriculum, locked/free lessons, reviews
    │   └── LessonView.jsx       # Video embed + rich content + resources + nav
    ├── prompts/
    │   ├── PromptsList.jsx      # Grid with copy, like, category filter
    │   └── PromptDetail.jsx     # Variable filler + formatted prompt + reviews
    ├── SearchPage.jsx           # Global search across all content types
    ├── auth/
    │   ├── Login.jsx
    │   ├── Register.jsx
    │   ├── VerifyEmail.jsx
    │   ├── ForgotPassword.jsx
    │   └── ResetPassword.jsx
    ├── profile/
    │   ├── Profile.jsx          # Hero + stats + saved tools + activity tabs
    │   └── ProfileSettings.jsx  # Profile/Security/Account tabs
    ├── static/
    │   ├── About.jsx            # Mission, team, timeline, values
    │   ├── Contact.jsx          # Contact form with subject routing
    │   ├── PrivacyPolicy.jsx    # 10-section policy with sticky TOC
    │   └── Terms.jsx            # 10-section terms with sticky TOC
    └── NotFound.jsx
```

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- MongoDB (local or Atlas)
- Cloudinary account (for image uploads)
- SMTP email provider (Gmail, SendGrid, etc.)

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/your-org/stakepedia.git
cd stakepedia
```

**2. Install dependencies for all three projects**

```bash
# Server
cd server && npm install

# Admin
cd ../admin && npm install

# Webapp
cd ../webapp && npm install
```

**3. Set up environment variables**

Copy the example env files and fill in your values:

```bash
cp server/.env.example server/.env
cp admin/.env.example admin/.env
cp webapp/.env.example webapp/.env
```

**4. Seed the database**

The server auto-seeds on first boot:
- Super admin account (from `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD`)
- Default site settings
- 3 system email templates (welcome, verify-email, reset-password)

**5. Start development servers**

```bash
# Terminal 1 — API server
cd server && npm run dev

# Terminal 2 — Admin dashboard
cd admin && npm run dev

# Terminal 3 — Public webapp
cd webapp && npm run dev
```

| Service | URL |
|---------|-----|
| API | http://localhost:5000 |
| Admin | http://localhost:5174 |
| Webapp | http://localhost:5173 |

---

## Environment Variables

### Server (`server/.env`)

```env
# App
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb://localhost:27017/stakepedia

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_REFRESH_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback

# Email (SMTP)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your@email.com
MAIL_PASS=your_app_password
MAIL_FROM="Stakepedia <no-reply@stakepedia.com>"

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# App URLs
CLIENT_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174

# Super Admin Seed
SUPER_ADMIN_EMAIL=superadmin@stakepedia.com
SUPER_ADMIN_PASSWORD=SuperAdmin@123
SUPER_ADMIN_NAME=Super Admin
```

### Admin (`admin/.env`)

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_CLIENT_URL=http://localhost:5173
```

### Webapp (`webapp/.env`)

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_ADMIN_URL=http://localhost:5174
VITE_CLIENT_URL=http://localhost:5173
```

---

## API Reference

All endpoints are prefixed with `/api/v1`.

### Authentication (Users)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register new user | Public |
| POST | `/auth/login` | Login with email + password | Public |
| GET | `/auth/google` | Initiate Google OAuth | Public |
| GET | `/auth/google/callback` | Google OAuth callback | Public |
| GET | `/auth/verify-email/:token` | Verify email address | Public |
| POST | `/auth/forgot-password` | Send password reset email | Public |
| POST | `/auth/reset-password` | Reset password with token | Public |
| POST | `/auth/refresh-token` | Refresh access token | Public |
| GET | `/auth/me` | Get current user | User |
| POST | `/auth/resend-verification` | Resend verification email | User |

### User Profile

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/profile` | Get profile | User |
| PUT | `/profile` | Update profile | User |
| PATCH | `/profile/avatar` | Upload avatar | User |
| PATCH | `/profile/change-password` | Change password | User |
| GET | `/profile/saved-tools` | Get saved AI tools | User |
| GET | `/profile/activity` | Get reviews + comments | User |

### Public Content

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/ai-tools` | List AI tools (search, filter, paginate) | Public |
| GET | `/ai-tools/:slug` | Get AI tool by slug | Public |
| GET | `/blogs` | List blog posts | Public |
| GET | `/blogs/:slug` | Get blog post by slug | Public |
| POST | `/blogs/:slug/like` | Toggle blog like | User |
| GET | `/blogs/:id/comments` | Get blog comments | Public |
| POST | `/blogs/:id/comments` | Post a comment | User |
| DELETE | `/blogs/:blogId/comments/:commentId` | Delete own comment | User |
| GET | `/courses` | List courses | Public |
| GET | `/courses/:slug` | Get course + lessons | Public |
| GET | `/courses/:slug/lessons/:lessonId` | Get lesson (free or auth) | Mixed |
| GET | `/prompts` | List prompts | Public |
| GET | `/prompts/categories` | Get prompt categories | Public |
| GET | `/prompts/:slug` | Get prompt by slug | Public |
| GET | `/categories` | List categories | Public |
| GET | `/search` | Global search | Public |
| GET | `/reviews` | Get reviews for a target | Public |
| POST | `/reviews` | Submit a review | User |
| DELETE | `/reviews/:id` | Delete own review | User |
| POST | `/uploads/image` | Upload image | User/Admin |

### Admin — Auth

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/admin/auth/login` | Admin login (returns pre-auth token if 2FA enabled) | Public |
| POST | `/admin/auth/verify-2fa` | Verify TOTP code | Pre-auth |
| GET | `/admin/auth/me` | Get current admin | Admin |
| POST | `/admin/auth/setup-2fa` | Generate 2FA secret + QR | Admin |
| POST | `/admin/auth/enable-2fa` | Enable 2FA with TOTP code | Admin |
| POST | `/admin/auth/disable-2fa` | Disable 2FA | Admin |
| PUT | `/admin/auth/profile` | Update admin profile | Admin |
| PATCH | `/admin/auth/change-password` | Change admin password | Admin |
| POST | `/admin/auth/forgot-password` | Admin password reset email | Public |
| POST | `/admin/auth/reset-password` | Reset admin password | Public |

### Admin — Content Management

| Resource | Endpoints | Notes |
|----------|-----------|-------|
| AI Tools | `GET/POST /admin/ai-tools` · `GET/PUT/DELETE /admin/ai-tools/:id` · `PATCH /:id/publish` · `PATCH /:id/archive` · `PATCH /:id/featured` | Full CRUD + status actions |
| Blogs | `GET/POST /admin/blogs` · `GET/PUT/DELETE /admin/blogs/:id` · `PATCH /:id/publish` · `PATCH /:id/featured` | Full CRUD + status |
| Courses | `GET/POST /admin/courses` · `GET/PUT/DELETE /admin/courses/:id` · `POST /:id/lessons` · `PUT /:id/lessons/:lessonId` · `DELETE /:id/lessons/:lessonId` · `PATCH /:id/lessons/reorder` | Lessons management |
| Prompts | `GET/POST /admin/prompts` · `GET/PUT/DELETE /admin/prompts/:id` · `PATCH /:id/publish` · `PATCH /:id/featured` | Full CRUD |
| Categories | `GET/POST /admin/categories` · `GET/PUT/DELETE /admin/categories/:id` · `PATCH /reorder` | With reorder |
| Tags | `GET/POST /admin/tags` · `GET/PUT/DELETE /admin/tags/:id` | Full CRUD |

### Admin — Management

| Resource | Endpoints |
|----------|-----------|
| Users | `GET /admin/users` · `GET /admin/users/:id` · `PATCH /:id/toggle-status` · `DELETE /:id` · `GET /admin/users/stats` |
| Admins | `GET/POST /admin` · `GET/PUT/DELETE /admin/:id` · `PATCH /:id/permissions` |
| Reviews | `GET /admin/reviews` · `PATCH /:id/approve` · `PATCH /:id/reject` · `DELETE /:id` |
| Comments | `GET /admin/comments` · `PATCH /:id/approve` · `DELETE /:id` |
| Email | `GET/POST /admin/email/templates` · `PUT/DELETE /:id` · `POST /:id/preview` · `POST /:id/test` · `POST /admin/email/send` · `GET /admin/email/logs` · `GET /admin/email/stats` |
| Settings | `GET/PUT /admin/settings` · `POST /admin/settings/logo` · `POST /admin/settings/favicon` · `PATCH /admin/settings/maintenance` |
| Analytics | `GET /admin/analytics/dashboard` |
| Audit Logs | `GET /admin/audit` · `GET /admin/audit/:id` · `GET /admin/audit/resource/:type/:id` · `GET /admin/audit/stats` |
| Notifications | `GET /admin/notifications` · `PATCH /:id/read` · `PATCH /read-all` · `DELETE /:id` · `DELETE /clear-all` · `GET /unread-count` |

---

## Features

### Public Website

- **Home page** — hero with stats, category grid, featured tools, courses and blog posts, CTA
- **AI Tools directory** — search, filter by category/pricing/sort, pagination, tool cards with pricing badges and ratings
- **Tool detail** — tabbed layout (overview, features, prompt tips, reviews), screenshots carousel, usage stats
- **Blog** — paginated list, full post with rich HTML content, likes, comments, reviews
- **Courses** — level/pricing filters, full curriculum view with locked/free lesson indicators
- **Lesson viewer** — embedded YouTube/video support, rich content, resources, prev/next navigation, course sidebar
- **Prompt library** — category filter, one-click copy, variable filler for `{{placeholder}}` syntax
- **Global search** — searches across AI tools, blogs, courses and prompts simultaneously
- **User profiles** — hero card with social links, stats, saved tools, reviews and comments tabs
- **Static pages** — About, Contact (with subject routing), Privacy Policy and Terms (both with sticky TOC navigation)

### Admin Dashboard

- **Dashboard** — KPI cards, content breakdown bar chart, top tools table, pending moderation alert, recent audit activity
- **AI Tools** — featured/verified badges, publish/archive/featured actions, screenshot management, SEO meta, prompt tips
- **Blogs** — TipTap rich text editor, word count + read time, Google SERP preview, cover image, featured toggle
- **Courses** — 4-tab form, lesson builder with dnd-kit drag reorder, free/locked lesson control, duration tracking
- **Prompts** — variable editor (name/description/example), live content preview with highlighted variables, tool linking
- **Categories** — colour picker with presets, icon field, order control, tool count display
- **Tags** — grid chip display, usage count badges, quick-add inline form
- **Users** — activation toggle, user detail view with saved tools and social links
- **Admins** — create with granular permissions, per-permission toggle, activate/deactivate
- **Moderation queue** — unified pending reviews + comments with approve/reject/delete
- **Email system** — template CRUD with Handlebars preview, send-test, campaign builder with recipient list or all-users broadcast
- **Audit logs** — expandable before/after diffs, resource and status filtering, 30-day stats
- **Site settings** — SEO defaults, social links, maintenance mode toggle, custom header/footer scripts
- **Theme settings** — colour mode, font family, 6 colour presets, custom primary/secondary/accent with live preview
- **Admin profile** — avatar upload, tabs for profile/password/2FA, password strength meter

### Security

- JWT access tokens (15m) + refresh tokens (7d)
- Bcrypt password hashing (12 rounds)
- Google OAuth 2.0
- TOTP-based two-factor authentication (speakeasy)
- Per-route rate limiting (global/auth/email)
- Role-based access: `user` / `admin` / `superadmin`
- Granular admin permissions (10 toggleable permissions)
- Maintenance mode (blocks all public routes with 503)
- `protectAny` middleware — accepts both user and admin tokens for shared endpoints (uploads)
- Audit log of all admin actions with IP + user agent
- Email verification required for certain actions
- Pre-auth token flow for 2FA (prevents full login before TOTP verified)

---

## Authentication & Security

### User Auth Flow

```
Register → Email verification → Login → JWT access token + refresh token
                                     ↓
                              Protected routes
```

### Admin Auth Flow (with 2FA)

```
Admin login → 2FA enabled? ─Yes─► Return pre-auth token
                   │                      ↓
                   No           TOTP code submitted
                   │                      ↓
                   └──────────────► Full JWT access token
                                          ↓
                                  Admin routes (protectAdmin)
```

### Token Strategy

| Token | Expiry | Storage | Use |
|-------|--------|---------|-----|
| Access token | 15 minutes | Memory / localStorage | API requests |
| Refresh token | 7 days | Cookie (httpOnly) | Renew access token |
| Pre-auth token | 5 minutes | Memory | 2FA verification step |
| Email verify token | 24 hours | DB (hashed) | Email verification |
| Password reset token | 1 hour | DB (hashed) | Password reset |

---

## Admin Panel

### Roles & Permissions

| Role | Description |
|------|-------------|
| `superadmin` | Full access to everything — cannot be deleted or modified by other admins |
| `admin` | Access controlled by the 10 permission toggles set by a superadmin |

**Admin permissions:**

| Permission | Controls |
|------------|---------|
| `manageUsers` | View, activate/deactivate and delete users |
| `manageAITools` | CRUD on AI tool listings |
| `manageBlogs` | CRUD on blog posts |
| `manageCourses` | CRUD on courses and lessons |
| `managePrompts` | CRUD on prompts |
| `manageEmail` | Email templates, campaigns and logs |
| `manageAdmins` | Create and manage other admin accounts |
| `manageSettings` | Site settings and theme |
| `viewAnalytics` | Dashboard and analytics data |
| `viewAuditLogs` | Audit log access |

### Seeded on First Boot

The server automatically seeds when no super admin exists:

1. **Super admin account** — credentials from `SUPER_ADMIN_EMAIL` + `SUPER_ADMIN_PASSWORD`
2. **Site settings** — default site name, SEO values
3. **System email templates** — welcome, email verification, password reset

---

## Database Models

### Key model relationships

```
User ──────────────── savedTools ──► AITool
User ──────────────── likedBlogs ──► Blog
User ──────────────── likedTools ──► AITool

Review ─── targetType/targetId ──► AITool | Course | Blog | Prompt  (polymorphic)
Comment ──────────────────────────► Blog

Course ─── lessons[] (embedded)

AuditLog ─── adminId ──► Admin   (TTL: 90 days)
Notification ─── adminId ──► Admin  (TTL: 60 days)
EmailLog  (TTL: 90 days)
```

### Automatic TTL cleanup

In addition to MongoDB TTL indexes, `cron.service.js` runs:

| Job | Schedule | Action |
|-----|----------|--------|
| Unverified user cleanup | Daily at 2:00 AM | Delete users who never verified email after 7 days |
| Email log cleanup | Weekly Sunday 3:00 AM | Delete email logs older than 90 days |

---

## Deployment

### Production checklist

**Server**
- [ ] Set `NODE_ENV=production`
- [ ] Use MongoDB Atlas or a managed MongoDB instance
- [ ] Enable Cloudinary (required for image uploads in production)
- [ ] Configure a real SMTP provider (not Gmail for high volume)
- [ ] Set strong, unique values for all JWT secrets
- [ ] Restrict CORS origins to your actual domains
- [ ] Run behind a reverse proxy (nginx) with HTTPS

**Admin + Webapp**
- [ ] Build for production: `npm run build`
- [ ] Set `VITE_API_URL` to your production API URL
- [ ] Serve `/dist` as static files via nginx or a CDN

### Example nginx config (API)

```nginx
server {
    listen 80;
    server_name api.stakepedia.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Docker (optional)

A basic `Dockerfile` for the server:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "src/server.js"]
```

---

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes following the existing code style
4. Write or update tests where applicable
5. Commit with a clear message: `git commit -m "feat: add X feature"`
6. Push to your fork: `git push origin feature/your-feature-name`
7. Open a Pull Request with a clear description

### Commit convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | Use for |
|--------|---------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation changes |
| `style:` | Formatting, no logic change |
| `refactor:` | Code restructure |
| `perf:` | Performance improvement |
| `chore:` | Build, dependencies, config |

### Reporting bugs

Open a GitHub issue with:
- Steps to reproduce
- Expected vs actual behaviour
- Node.js version and OS
- Relevant error messages or logs

---

## License

<div align="center">

**Built By Prince Patel princep4423d@gmail.com**

[Website](http://localhost:5173) · [Admin](http://localhost:5174) · [API Docs](http://localhost:5000/api/v1)

</div>