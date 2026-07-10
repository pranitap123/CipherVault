/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: { 950: "#0b0f1a", 900: "#111726", 850: "#161d2e", 800: "#1c2438", 700: "#2a3450", 600: "#3a4668" },
        ink: { DEFAULT: "#e6e9f2", muted: "#9aa3b8", faint: "#6b7488" },
        accent: { DEFAULT: "#5b8cff", hover: "#7aa2ff", soft: "#1e2b4d" },
        ok: "#3ecf8e", warn: "#f5b451", danger: "#f26d6d",
        line: "#243049",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      borderRadius: { xl: "0.9rem" },
    },
  },
  plugins: [],
};
