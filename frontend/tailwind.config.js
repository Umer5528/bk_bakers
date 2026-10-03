/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // --- BK_Bakers premium palette ---
        cream: {
          50: "#FFFEFC",
          100: "#FFF9F6", // Warm Cream — main background
          200: "#FDF1EA",
        },
        blush: {
          50: "#FDF6F7",
          100: "#F8E5E8", // Soft Blush — background accents
          200: "#F0D0D6",
        },
        rose: {
          100: "#FBEBEE",
          200: "#F5CDD5",
          300: "#EFB7C1", // Rose Pink — brand highlights
          400: "#E9A3B0",
          500: "#E39BAA", // Deep Rose — buttons, active states
          600: "#CD7E8F", // hover
          700: "#B0687C",
        },
        peach: {
          100: "#FBE7D9",
          200: "#F7D5C0", // Warm Peach — decorative accents
          300: "#F0BC97",
        },
        berry: {
          300: "#A67885",
          400: "#8C5E68",
          500: "#70434E", // Berry Brown — headings & important text
          600: "#5A343D",
          700: "#452831",
          800: "#331E25",
          900: "#241419",
        },
        mauve: {
          300: "#B3A0A5",
          400: "#9C848A",
          500: "#876C73", // Muted Mauve — secondary text
          600: "#6E565C",
        },
      },
      fontFamily: {
        display: ["'Cormorant Garamond'", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        // A deliberate display scale for the serif — Cormorant needs
        // larger sizes and tighter tracking to read as confident rather
        // than thin/timid.
        "display-sm": ["1.75rem", { lineHeight: "1.15", letterSpacing: "-0.01em" }],
        "display-md": ["2.5rem", { lineHeight: "1.1", letterSpacing: "-0.01em" }],
        "display-lg": ["3.5rem", { lineHeight: "1.05", letterSpacing: "-0.015em" }],
        "display-xl": ["4.5rem", { lineHeight: "1.02", letterSpacing: "-0.02em" }],
      },
      boxShadow: {
        soft: "0 2px 16px rgba(112, 67, 78, 0.07)",
        card: "0 8px 28px rgba(112, 67, 78, 0.10)",
        lift: "0 18px 45px rgba(112, 67, 78, 0.16)",
        "inner-line": "inset 0 0 0 1px rgba(112, 67, 78, 0.08)",
      },
      borderRadius: {
        xl2: "1.25rem",
        xl3: "1.75rem",
      },
      maxWidth: {
        "content": "1240px",
      },
      transitionTimingFunction: {
        "soft-out": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
