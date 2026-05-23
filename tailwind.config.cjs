/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./scripts/**/*.mjs", "./src/**/*.mjs", "./src/**/*.css"],
  theme: {
    extend: {
      colors: {
        pitch: "var(--green)",
        "pitch-dark": "var(--green-dark)",
        field: "var(--surface)",
        "field-strong": "var(--surface-strong)",
        line: "var(--line)",
        ink: "var(--text)",
        muted: "var(--muted)",
        gold: "var(--accent)"
      },
      borderRadius: {
        ui: "8px"
      },
      boxShadow: {
        panel: "var(--shadow)"
      }
    }
  },
  corePlugins: {
    preflight: false
  },
  plugins: []
};
