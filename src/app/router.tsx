import { createBrowserRouter } from 'react-router'
import { Layout } from './Layout'
import { HomePage } from '../pages/HomePage'
import { ExplorePage } from '../pages/ExplorePage'
import { PublicationPage } from '../pages/PublicationPage'
import { LibraryPage } from '../pages/LibraryPage'
import { ResearchersPage } from '../pages/ResearchersPage'
import { ResearcherPage } from '../pages/ResearcherPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { SignInPage } from '../pages/auth/SignInPage'
import { SignUpPage } from '../pages/auth/SignUpPage'
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage'
import { AccountPage } from '../pages/auth/AccountPage'
import { RequireAuth } from '../features/auth/RequireAuth'

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/explore', element: <ExplorePage /> },
      { path: '/publication/:id', element: <PublicationPage /> },
      { path: '/library', element: <RequireAuth><LibraryPage /></RequireAuth> },
      { path: '/account', element: <RequireAuth><AccountPage /></RequireAuth> },
      { path: '/sign-in', element: <SignInPage /> },
      { path: '/sign-up', element: <SignUpPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/researchers', element: <ResearchersPage /> },
      { path: '/researchers/:id', element: <ResearcherPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
