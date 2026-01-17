/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'cyber-black': '#0a0a0f',
                'cyber-gray': '#1a1a24',
                'neon-blue': '#00f3ff',
                'neon-pink': '#ff00ff',
                'neon-green': '#0aff00',
            },
            fontFamily: {
                'cyber': ['"Orbitron"', 'sans-serif'],
                'sans': ['"Inter"', 'sans-serif'],
            },
            boxShadow: {
                'neon-blue': '0 0 10px #00f3ff',
                'neon-pink': '0 0 10px #ff00ff',
                'neon-green': '0 0 10px #0aff00',
            }
        },
    },
    plugins: [],
}
