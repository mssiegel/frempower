import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';

function PagePlaceholder({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <Box component="main" className="app-shell">
      <Container maxWidth="md">
        <Stack spacing={3}>
          <Typography
            component="p"
            sx={{
              color: 'secondary.main',
              fontSize: '0.875rem',
              fontWeight: 700,
              letterSpacing: 0,
              textTransform: 'uppercase',
            }}
          >
            {eyebrow}
          </Typography>
          <Typography
            variant="h1"
            sx={{
              color: 'text.primary',
              fontSize: { xs: '2.5rem', md: '4rem' },
              fontWeight: 800,
              lineHeight: 1,
            }}
          >
            {title}
          </Typography>
          <Typography
            sx={{
              color: 'text.secondary',
              fontSize: { xs: '1.125rem', md: '1.25rem' },
              lineHeight: 1.6,
              maxWidth: '42rem',
            }}
          >
            {description}
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button href="/teacher" size="large" variant="contained">
              Teacher Page
            </Button>
            <Button href="/student" size="large" variant="outlined">
              Student Page
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <PagePlaceholder
        description="Frempower helps teachers run live student pair chats from an open classroom activity."
        eyebrow="Frempower"
        title="Homepage"
      />
    ),
  },
  {
    path: '/teacher',
    element: (
      <PagePlaceholder
        description="The Teacher Page will show the student list, active pairings, and completed chats for a live activity."
        eyebrow="Open experience"
        title="Teacher Page"
      />
    ),
  },
  {
    path: '/student',
    element: (
      <PagePlaceholder
        description="The Student Page will let a student enter a display name and participate in an assigned chat."
        eyebrow="Open experience"
        title="Student Page"
      />
    ),
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
