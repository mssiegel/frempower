import { Box, Button, Container, Stack, Typography } from "@mui/material";
import {
  createBrowserRouter,
  Link as RouterLink,
  RouterProvider,
} from "react-router-dom";
import "./index.css";
import {
  type RealtimeConnectionState,
  useRealtimeConnection,
} from "./realtime";

function Homepage() {
  return (
    <Box className="homepage">
      <Box component="header" className="homepage-header">
        <Container maxWidth="lg">
          <Box
            component="nav"
            aria-label="Primary navigation"
            className="homepage-nav"
          >
            <Typography component="a" href="/" className="homepage-brand">
              Frempower
            </Typography>
            <Stack
              component="ul"
              direction="row"
              spacing={1.5}
              className="homepage-nav-list"
            >
              <li>
                <Button
                  component={RouterLink}
                  to="/teacher"
                  variant="contained"
                >
                  Teacher Page
                </Button>
              </li>
              <li>
                <Button component={RouterLink} to="/student" variant="outlined">
                  Student Page
                </Button>
              </li>
            </Stack>
          </Box>
        </Container>
      </Box>

      <Box component="main">
        <Box
          component="section"
          className="homepage-hero"
          aria-labelledby="homepage-title"
        >
          <Container maxWidth="lg">
            <Stack spacing={3} className="homepage-hero-content">
              <Typography component="p" className="homepage-kicker">
                Live classroom pair chats
              </Typography>
              <Typography
                component="h1"
                id="homepage-title"
                className="homepage-title"
              >
                Frempower helps teachers run focused student chats.
              </Typography>
              <Typography className="homepage-summary">
                Start an open classroom activity, pair students for real-time
                conversations, and keep completed chats visible for teacher
                review during the session.
              </Typography>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                className="homepage-actions"
              >
                <Button
                  component={RouterLink}
                  to="/teacher"
                  size="large"
                  variant="contained"
                >
                  Open Teacher Page
                </Button>
                <Button
                  component={RouterLink}
                  to="/student"
                  size="large"
                  variant="outlined"
                >
                  Open Student Page
                </Button>
              </Stack>
            </Stack>
          </Container>
        </Box>

        <Box
          component="section"
          className="homepage-section"
          aria-labelledby="classroom-activity-title"
        >
          <Container maxWidth="lg">
            <Stack spacing={2.5} className="homepage-section-content">
              <Typography
                component="h2"
                id="classroom-activity-title"
                className="homepage-section-title"
              >
                Built for a live classroom activity
              </Typography>
              <Typography className="homepage-section-copy">
                The Client keeps the Homepage public and search-indexable while
                the App Shell gives teachers and students direct access to their
                open experiences.
              </Typography>
              <Box component="ul" className="homepage-feature-list">
                <li>
                  Teachers can prepare to manage a student list and pair exactly
                  two students.
                </li>
                <li>
                  Students can prepare to join with their name and chat when
                  paired.
                </li>
                <li>
                  Completed chats stay in memory for the current running server
                  process.
                </li>
              </Box>
            </Stack>
          </Container>
        </Box>
      </Box>
    </Box>
  );
}

function PagePlaceholder({
  eyebrow,
  title,
  description,
  usesRealtimeConnection = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  usesRealtimeConnection?: boolean;
}) {
  const realtimeConnection = usesRealtimeConnection ? (
    <RealtimeConnectionStatus />
  ) : null;

  return (
    <Box component="main" className="app-shell">
      <Container maxWidth="md">
        <Stack spacing={3}>
          <Typography
            component="p"
            sx={{
              color: "secondary.main",
              fontSize: "0.875rem",
              fontWeight: 700,
              letterSpacing: 0,
              textTransform: "uppercase",
            }}
          >
            {eyebrow}
          </Typography>
          <Typography
            variant="h1"
            sx={{
              color: "text.primary",
              fontSize: { xs: "2.5rem", md: "4rem" },
              fontWeight: 800,
              lineHeight: 1,
            }}
          >
            {title}
          </Typography>
          <Typography
            sx={{
              color: "text.secondary",
              fontSize: { xs: "1.125rem", md: "1.25rem" },
              lineHeight: 1.6,
              maxWidth: "42rem",
            }}
          >
            {description}
          </Typography>
          {realtimeConnection}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
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

function RealtimeConnectionStatus() {
  const { isConnected, status } = useRealtimeConnection();

  return (
    <Typography
      sx={{
        color: isConnected ? "secondary.main" : "text.secondary",
        fontSize: "0.9375rem",
        fontWeight: 700,
      }}
    >
      Realtime Connection: {formatRealtimeConnectionStatus(status)}
    </Typography>
  );
}

function formatRealtimeConnectionStatus(status: RealtimeConnectionState) {
  if (status === "connected") {
    return "Connected";
  }

  if (status === "disconnected") {
    return "Disconnected";
  }

  return "Connecting";
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Homepage />,
  },
  {
    path: "/teacher",
    element: (
      <PagePlaceholder
        description="The Teacher Page will show the student list, active pairings, and completed chats for a live activity."
        eyebrow="Open experience"
        title="Teacher Page"
        usesRealtimeConnection
      />
    ),
  },
  {
    path: "/student",
    element: (
      <PagePlaceholder
        description="The Student Page will let a student enter their name and participate in an assigned chat."
        eyebrow="Open experience"
        title="Student Page"
        usesRealtimeConnection
      />
    ),
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
