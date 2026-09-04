/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // "Vault control room" palette — replaces the generic dark-blue/single-accent
        // SaaS look. Warmer, metallic, tied to the product being an encrypted vault.
        base: { 950: "#0a0a0c", 900: "#131317", 850: "#191a1f", 800: "#202127", 700: "#2b2d33", 600: "#3a3c44" },
        ink: { DEFAULT: "#ded9cf", muted: "#a8a39a", faint: "#726d63" },
        accent: { DEFAULT: "#c9963c", hover: "#f2c877", soft: "#2b2210" },
        ok: "#3ecf8e", warn: "#e0a542", danger: "#d1614a",
        line: "#2f3038",
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
