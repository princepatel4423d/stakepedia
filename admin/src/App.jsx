import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useThemeStore } from '@/store/themeStore'

// Layout
import AdminLayout from '@/components/layout/AdminLayout'
import ProtectedRoute from '@/components/shared/ProtectedRoute'
import PermissionRoute from '@/components/shared/PermissionRoute'

// Auth pages
import Login from '@/pages/auth/Login'
import Verify2FA from '@/pages/auth/Verify2FA'
import Setup2FA from '@/pages/auth/Setup2FA'
import ForgotPassword from '@/pages/auth/ForgotPassword'
import ResetPassword from '@/pages/auth/ResetPassword'

// Dashboard
import Dashboard from '@/pages/dashboard/Dashboard'

// AI Tools
import AIToolsList from '@/pages/ai-tools/AIToolsList'
import AIToolForm from '@/pages/ai-tools/AIToolForm'

// Blogs
import BlogsList from '@/pages/blogs/BlogsList'
import BlogForm from '@/pages/blogs/BlogForm'

// Courses
import CoursesList from '@/pages/courses/CoursesList'
import CourseForm from '@/pages/courses/CourseForm'
import LessonBuilder from '@/pages/courses/LessonBuilder'

// Prompts
import PromptsList from '@/pages/prompts/PromptsList'
import PromptForm from '@/pages/prompts/PromptForm'

// Categories & Tags
import CategoriesList from '@/pages/categories/CategoriesList'

// Users & Admins
import UsersList from '@/pages/users/UsersList'
import UserDetail from '@/pages/users/UserDetail'
import AdminsList from '@/pages/admins/AdminsList'

// Moderation
import ReviewsList from '@/pages/moderation/ReviewsList'
import CommentsList from '@/pages/moderation/CommentsList'
import ModerationQueue from '@/pages/moderation/ModerationQueue'

// Email
import EmailTemplates from '@/pages/email/EmailTemplates'
import EmailCampaigns from '@/pages/email/EmailCampaigns'
import EmailLogs from '@/pages/email/EmailLogs'
import NotificationCampaigns from '@/pages/notifications/NotificationCampaigns'

// Audit
import AuditLogs from '@/pages/audit/AuditLogs'

// Settings
import SiteSettings from '@/pages/settings/SiteSettings'
import ThemeSettings from '@/pages/settings/ThemeSettings'

// Profile
import AdminProfile from '@/pages/profile/AdminProfile'

export default function App() {
  const applyAll = useThemeStore((s) => s.applyAll)
  const theme = useThemeStore((s) => s.theme)

  useEffect(() => {
    applyAll()
  }, [applyAll, theme])

  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/verify-2fa" element={<Verify2FA />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected admin routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route element={<PermissionRoute permission="viewAnalytics" />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          <Route element={<PermissionRoute permission="manageAITools" />}>
            <Route path="/ai-tools" element={<AIToolsList />} />
            <Route path="/ai-tools/new" element={<AIToolForm />} />
            <Route path="/ai-tools/:id/edit" element={<AIToolForm />} />
            <Route path="/categories" element={<CategoriesList />} />
          </Route>

          <Route element={<PermissionRoute permission="manageBlogs" />}>
            <Route path="/blogs" element={<BlogsList />} />
            <Route path="/blogs/new" element={<BlogForm />} />
            <Route path="/blogs/:id/edit" element={<BlogForm />} />
          </Route>

          <Route element={<PermissionRoute permission="manageCourses" />}>
            <Route path="/courses" element={<CoursesList />} />
            <Route path="/courses/new" element={<CourseForm />} />
            <Route path="/courses/:id/edit" element={<CourseForm />} />
            <Route path="/courses/:id/lessons" element={<LessonBuilder />} />
          </Route>

          <Route element={<PermissionRoute permission="managePrompts" />}>
            <Route path="/prompts" element={<PromptsList />} />
            <Route path="/prompts/new" element={<PromptForm />} />
            <Route path="/prompts/:id/edit" element={<PromptForm />} />
          </Route>

          <Route element={<PermissionRoute permission="manageUsers" />}>
            <Route path="/users" element={<UsersList />} />
            <Route path="/users/:id" element={<UserDetail />} />
          </Route>

          <Route element={<PermissionRoute permission="manageAdmins" />}>
            <Route path="/admins" element={<AdminsList />} />
          </Route>

          <Route element={<PermissionRoute permission="manageModeration" />}>
            <Route path="/moderation" element={<ModerationQueue />} />
            <Route path="/moderation/reviews" element={<ReviewsList />} />
            <Route path="/moderation/comments" element={<CommentsList />} />
          </Route>

          {/* Email Management - manageEmail permission required */}
          <Route element={<PermissionRoute permission="manageEmail" />}>
            <Route path="/email/templates" element={<EmailTemplates />} />
            <Route path="/email/campaigns" element={<EmailCampaigns />} />
            <Route path="/email/logs" element={<EmailLogs />} />
          </Route>

          <Route element={<PermissionRoute permission="manageNotifications" />}>
            <Route path="/notifications/campaigns" element={<NotificationCampaigns />} />
          </Route>

          {/* Audit Logs - viewAuditLogs permission required */}
          <Route element={<PermissionRoute permission="viewAuditLogs" />}>
            <Route path="/audit" element={<AuditLogs />} />
          </Route>

          {/* Settings - manageSettings permission required */}
          <Route element={<PermissionRoute permission="manageSettings" />}>
            <Route path="/settings" element={<SiteSettings />} />
            <Route path="/settings/theme" element={<ThemeSettings />} />
          </Route>

          <Route path="/profile" element={<AdminProfile />} />
          <Route path="/setup-2fa" element={<Setup2FA />} />
        </Route>
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}