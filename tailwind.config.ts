import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "var(--primary)",
        primaryhover: "var(--primary-hover)",
        border: "var(--border)",
        secondary: "var(--secondary)",
        text: "var(--text-color)",
        'bright-text': "var(--bright-text-color)",
        tertiary: "var(--tertiary)",
        error: "var(--error)",
        success: "var(--success)",
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')
  ],
} satisfies Config;
