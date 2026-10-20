import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'

const BASE = '/quizlingo/'

// Serves the Vercel functions in api/ during `npm run dev`, so the app and API run from one command.
// On Vercel the platform routes /api itself and this plugin is not used.
const vercelApi = (): Plugin => ({
  name: 'vercel-api-dev',
  configureServer(server: ViteDevServer) {
    server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
      const url = new URL(req.url ?? '/', 'http://localhost')
      const prefix = `${BASE}api/`
      if (!url.pathname.startsWith(prefix)) return next()
      const name = url.pathname.slice(prefix.length)
      const file = resolve(__dirname, 'api', `${name}.ts`)
      if (name.startsWith('_') || name.includes('..') || !existsSync(file)) {
        res.statusCode = 404
        return res.end(JSON.stringify({ error: 'Not found' }))
      }
      try {
        const handlers = await server.ssrLoadModule(file)
        const handler = handlers[req.method ?? 'GET']
        if (typeof handler !== 'function') {
          res.statusCode = 405
          return res.end(JSON.stringify({ error: 'Method not allowed' }))
        }
        const chunks: Buffer[] = []
        for await (const chunk of req) chunks.push(chunk as Buffer)
        const body = chunks.length > 0 ? Buffer.concat(chunks) : undefined
        const request = new Request(url, {
          method: req.method,
          headers: req.headers as Record<string, string>,
          body: req.method === 'GET' || req.method === 'HEAD' ? undefined : body,
        })
        const response: Response = await handler(request)
        res.statusCode = response.status
        response.headers.forEach((value, key) => res.setHeader(key, value))
        res.end(Buffer.from(await response.arrayBuffer()))
      } catch (error) {
        server.ssrFixStacktrace(error as Error)
        console.error(error)
        res.statusCode = 500
        res.end(JSON.stringify({ error: 'Dev API error' }))
      }
    })
  },
})

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Make TURSO_* from .env.local visible to the API during development
  Object.assign(process.env, loadEnv(mode, process.cwd(), 'TURSO_'))
  return {
    base: BASE,
    plugins: [react(), tailwindcss(), vercelApi()],
    build: {
      outDir: `dist${BASE}`,
      emptyOutDir: true,
    },
  }
})
