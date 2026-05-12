import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <main />,
  },
  {
    path: '/teacher',
    element: <main />,
  },
  {
    path: '/student',
    element: <main />,
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
