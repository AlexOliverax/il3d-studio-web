import { build } from 'vite'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const output = await mkdtemp(join(tmpdir(), 'il3d-tests-'))
try {
  await build({ configFile: false, logLevel: 'error',
    define: { 'import.meta.env.VITE_IL3D_WHATSAPP_NUMBER': JSON.stringify(process.env.VITE_IL3D_WHATSAPP_NUMBER ?? ''), 'import.meta.env.DEV': 'false' },
    build: { target: 'node20', minify: false, outDir: output,
      lib: { entry: 'tests/regression.ts', formats: ['es'], fileName: () => 'regression.mjs' },
      rollupOptions: { external: ['node:assert/strict', 'node:fs', 'react', 'react-dom/server'] } },
  })
  // Resolve React from this checkout, rather than the operating system temp folder.
  const { symlink } = await import('node:fs/promises')
  await symlink(join(process.cwd(), 'node_modules'), join(output, 'node_modules'), 'dir')
  await import(pathToFileURL(join(output, 'regression.mjs')).href)
} finally { await rm(output, { recursive: true, force: true }) }
