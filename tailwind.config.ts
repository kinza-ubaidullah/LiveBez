import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: 'class',
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#2563eb",
                    foreground: "#ffffff",
                },
            },
            fontFamily: {
                outfit: ["var(--font-outfit)", "sans-serif"],
                inter: ["var(--font-inter)", "sans-serif"],
            },
        },
    },
    plugins: [],
};
export default config;

