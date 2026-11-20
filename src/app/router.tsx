import { Navigate, createBrowserRouter } from 'react-router'
import { Layout } from './Layout'
import { HomePage } from '../pages/HomePage'
import { ExplorePage } from '../pages/ExplorePage'
import { PublicationPage } from '../pages/PublicationPage'
import { LibraryPage } from '../pages/LibraryPage'
import { ResearchersPage } from '../pages/ResearchersPage'
import { ResearcherPage } from '../pages/ResearcherPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { SignInPage } from '../pages/auth/SignInPage'
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
      // Old addresses from the password era go to the single email sign-in.
      { path: '/sign-up', element: <Navigate to="/sign-in" replace /> },
      { path: '/forgot-password', element: <Navigate to="/sign-in" replace /> },
      { path: '/researchers', element: <ResearchersPage /> },
      { path: '/researchers/:id', element: <ResearcherPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
