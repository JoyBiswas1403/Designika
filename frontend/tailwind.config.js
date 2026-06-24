/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
                serif: ['Playfair Display', 'serif'],
            },
            colors: {
                // Overwriting default grays to be purely monochromatic or tinted
                slate: {
                    850: '#1f2937',
                    900: '#111827',
                    950: '#030712', // Deepest background
                },
                // The "Aura" Accents
                aura: {
                    amber: '#d97706',
                    cyan: '#22d3ee',
                    purple: '#4c1d95',
                },
                // Keep existing semantic tokens mapping to new values
                background: '#000000',
                foreground: '#ffffff',
                card: '#111827',
                'card-foreground': '#ffffff',
                primary: {
                    DEFAULT: '#ffffff',
                    foreground: '#000000',
                    50: '#f0f9ff',
                    500: '#0ea5e9', // Fallback
                },
                muted: {
                    DEFAULT: 'rgba(255, 255, 255, 0.1)',
                    foreground: 'rgba(255, 255, 255, 0.4)',
                }
            },
            backgroundImage: {
                // The noise texture used to reduce banding
                'noise': "url('https://grainy-gradients.vercel.app/noise.svg')",
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'scan': 'scan 2s cubic-bezier(0.4, 0, 0.2, 1) infinite',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                scan: {
                    '0%': { top: '0%', opacity: '0' },
                    '10%': { opacity: '1' },
                    '90%': { opacity: '1' },
                    '100%': { top: '100%', opacity: '0' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                }
            }
        },
    },
    plugins: [],
}
