import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#D1BD9B",
          dark: "#B89F72",   // dùng cho hover/nút nhấn, đậm hơn 1 chút
          light: "#EDE4D3",  // dùng cho nền nhạt, badge
        },
      },
    },
  },
  plugins: [],
};

export default config;