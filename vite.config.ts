import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  // Vitest 配置
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  // Vite 构建配置 (库模式)
  build: {
    ssr: true, // 优化 Node.js 构建
    lib: {
      entry: resolve(__dirname, 'src/server.ts'),
      name: '@zephyr-mcp/spreadsheet',
      fileName: 'server',
      formats: ['es','cjs'] // 输出 CommonJS 格式
    },
    outDir: 'dist',
    minify: true, // 启用压缩
    sourcemap: false, // 禁用 sourcemap
    rollupOptions: {
      // 外部化运行时依赖和 Node.js 内置模块
      external: [
        'fastmcp',
        'zod',
        'exceljs',
        'papaparse',
        /^node:/
      ],
    },
    target: 'node18', // 目标 Node.js 版本
  }
})