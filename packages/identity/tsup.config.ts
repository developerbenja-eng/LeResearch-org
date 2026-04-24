import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    schema: 'src/schema.ts',
    client: 'src/client.ts',
    middleware: 'src/middleware.ts',
    server: 'src/server.ts',
    edge: 'src/edge.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: [
    '@leresearch-org/auth',
    '@libsql/client',
    'drizzle-orm',
    'drizzle-orm/libsql',
    'drizzle-orm/sqlite-core',
    'jose',
    'next/server',
    'next/headers',
  ],
});
