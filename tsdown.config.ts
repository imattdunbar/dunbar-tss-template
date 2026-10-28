import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    'api-client': 'packages/web/src/api/types.ts'
  },
  tsconfig: 'packages/web/tsconfig.json',
  outDir: 'packages/shared/api/generated',
  format: 'esm',
  fixedExtension: false,
  clean: false,
  deps: {
    neverBundle: true
  },
  dts: {
    emitDtsOnly: true
  }
})
