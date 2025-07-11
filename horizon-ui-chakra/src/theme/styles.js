import { mode } from "@chakra-ui/theme-tools";
export const globalStyles = {
  colors: {
    brand: {
      100: "#f3f4f6",
      200: "#d1d5db",
      300: "#9ca3af",
      400: "#6b7280",
      500: "#4b5563",
      600: "#374151",
      700: "#1f2937",
      800: "#111827",
      900: "#0a0a0a",
    },
    brandScheme: {
      100: "#f3f4f6",
      200: "#9ca3af",
      300: "#6b7280",
      400: "#4b5563",
      500: "#374151",
      600: "#1f2937",
      700: "#111827",
      800: "#0a0a0a",
      900: "#000000",
    },
    brandTabs: {
      100: "#f3f4f6",
      200: "#9ca3af",
      300: "#6b7280",
      400: "#4b5563",
      500: "#374151",
      600: "#1f2937",
      700: "#111827",
      800: "#0a0a0a",
      900: "#000000",
    },
    secondaryGray: {
      100: "#E0E5F2",
      200: "#E1E9F8",
      300: "#F4F7FE",
      400: "#E9EDF7",
      500: "#8F9BBA",
      600: "#A3AED0",
      700: "#707EAE",
      800: "#707EAE",
      900: "#1B2559",
    },
    red: {
      100: "#FEEFEE",
      500: "#EE5D50",
      600: "#E31A1A",
    },
    blue: {
      50: "#EFF4FB",
      500: "#3965FF",
    },
    orange: {
      100: "#FFF6DA",
      500: "#FFB547",
    },
    green: {
      100: "#E6FAF5",
      500: "#01B574",
    },
    navy: {
      50: "#f7f8fa",
      100: "#e1e5e9",
      200: "#c3c9d1",
      300: "#9ca3ab",
      400: "#6b7280",
      500: "#4a5568",
      600: "#2d3748",
      700: "#1a202c",
      800: "#171923",
      900: "#0f0f0f",
    },
    gray: {
      100: "#FAFCFE",
    },
  },
  styles: {
    global: (props) => ({
      body: {
        overflowX: "hidden",
        bg: mode("secondaryGray.300", "navy.900")(props),
        fontFamily: "DM Sans",
        letterSpacing: "-0.5px",
      },
      input: {
        color: "gray.700",
      },
      html: {
        fontFamily: "DM Sans",
      },
    }),
  },
};
