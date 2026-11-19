import { existsSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    'import.meta.env.VITE_HAS_LOCAL_RESUME': JSON.stringify(String(existsSync(new URL('./public/resume.pdf', import.meta.url)))),
  },
})
