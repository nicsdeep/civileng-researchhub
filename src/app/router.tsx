import { createBrowserRouter } from 'react-router'
import { Layout } from './Layout'
import { HomePage } from '../pages/HomePage'
import { ExplorePage } from '../pages/ExplorePage'
import { PublicationPage } from '../pages/PublicationPage'
import { ComingSoonPage } from '../pages/ComingSoonPage'
import { NotFoundPage } from '../pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/explore', element: <ExplorePage /> },
      { path: '/publication/:id', element: <PublicationPage /> },
      {
        path: '/researchers',
        element: (
          <ComingSoonPage title="Researchers">
            Search for researchers and view their affiliations and publications. Coming in a later phase.
          </ComingSoonPage>
        ),
      },
      {
        path: '/library',
        element: (
          <ComingSoonPage title="My Library">
            Save publications and organize them into collections. Available once accounts are enabled.
          </ComingSoonPage>
        ),
      },
      {
        path: '/sign-in',
        element: (
          <ComingSoonPage title="Sign in">
            Accounts are coming soon. Searching and reading publications does not require an account.
          </ComingSoonPage>
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
