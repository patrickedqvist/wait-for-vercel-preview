import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		setupFiles: ['./test/support/setupTests.js'],
		coverage: {
			provider: 'v8',
			include: ['action.js'],
			exclude: ['node_modules', 'test', 'dist', 'index.js'],
		},
		testTimeout: 20000,
	},
});
