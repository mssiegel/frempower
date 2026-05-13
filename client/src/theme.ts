import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#070AC5",
      light: "#5B5DF9",
      dark: "#070AC5",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#95C021",
      light: "#BFE35B",
      dark: "#95C021",
      contrastText: "#2B313B",
    },
    text: {
      primary: "#2B313B",
      secondary: "#718098",
    },
    background: {
      default: "#FFFFFF",
      paper: "#F8F8FF",
    },
    grey: {
      50: "#F3F4F6",
      100: "#D0D5DD",
      300: "#A0AABA",
      500: "#718098",
      700: "#4D586A",
      900: "#2B313B",
    },
  },
  typography: {
    fontFamily: [
      "Inter",
      "system-ui",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "sans-serif",
    ].join(","),
  },
  shape: {
    borderRadius: 8,
  },
});
