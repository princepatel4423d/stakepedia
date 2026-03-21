import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useThemeStore } from '@/store/themeStore'
import MainLayout from '@/components/layout/MainLayout'
import AuthLayout from '@/components/layout/AuthLayout'
import ProtectedRoute from '@/components/shared/ProtectedRoute'
import PageLoader from '@/components/shared/PageLoader'

const Home = lazy(() => import('@/pages/home/Home'))
const AIToolsList = lazy(() => import('@/pages/ai-tools/AIToolsList'))
const AIToolDetail = lazy(() => import('@/pages/ai-tools/AIToolDetail'))
const BlogsList = lazy(() => import('@/pages/blogs/BlogsList'))
const BlogDetail = lazy(() => import('@/pages/blogs/BlogDetail'))
const CoursesList = lazy(() => import('@/pages/courses/CoursesList'))
const CourseDetail = lazy(() => import('@/pages/courses/CourseDetail'))
const LessonView = lazy(() => import('@/pages/courses/LessonView'))
const PromptsList = lazy(() => import('@/pages/prompts/PromptsList'))
const PromptDetail = lazy(() => import('@/pages/prompts/PromptDetail'))
const SearchPage = lazy(() => import('@/pages/SearchPage'))
const Login = lazy(() => import('@/pages/auth/Login'))
const Register = lazy(() => import('@/pages/auth/Register'))
const GoogleAuthCallback = lazy(() => import('@/pages/auth/GoogleAuthCallback'))
const VerifyEmail = lazy(() => import('@/pages/auth/VerifyEmail'))
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'))
const ResetPassword = lazy(() => import('@/pages/auth/ResetPassword'))
const Profile = lazy(() => import('@/pages/profile/Profile'))
const ProfileSettings = lazy(() => import('@/pages/profile/ProfileSettings'))
const NotFound = lazy(() => import('@/pages/NotFound'))

// Add these lazy imports at the top with the others:
const About = lazy(() => import('@/pages/static/About'))
const Contact = lazy(() => import('@/pages/static/Contact'))
const PrivacyPolicy = lazy(() => import('@/pages/static/PrivacyPolicy'))
const Terms = lazy(() => import('@/pages/static/Terms'))

export default function App() {
  const initTheme = useThemeStore((s) => s.initTheme)

  useEffect(() => { initTheme() }, [])

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="ai-tools" element={<AIToolsList />} />
          <Route path="ai-tools/:slug" element={<AIToolDetail />} />
          <Route path="blogs" element={<BlogsList />} />
          <Route path="blogs/:slug" element={<BlogDetail />} />
          <Route path="courses" element={<CoursesList />} />
          <Route path="courses/:slug" element={<CourseDetail />} />
          <Route path="courses/:slug/:lessonId" element={<LessonView />} />
          <Route path="prompts" element={<PromptsList />} />
          <Route path="prompts/:slug" element={<PromptDetail />} />
          <Route path="search" element={<SearchPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="profile" element={<Profile />} />
            <Route path="profile/settings" element={<ProfileSettings />} />
          </Route>

          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="privacy" element={<PrivacyPolicy />} />
          <Route path="terms" element={<Terms />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="verify-email" element={<VerifyEmail />} />
          <Route path="auth/google/success" element={<GoogleAuthCallback />} />
          <Route path="auth/google/error" element={<GoogleAuthCallback />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}