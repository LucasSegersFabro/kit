import * as assert from 'uvu/assert';
import { run } from './utils.js';

run('all options', (test) => {
	test('builds', async ({ build }) => {
		const buildExitCode = await build();
		assert.equal(buildExitCode, 0);
	});

	test('checks', async ({ check }) => {
		const checkExitCode = await check();
		assert.equal(checkExitCode, 0);
	});

	test('runs', async () => {
		// TODO: test that the built app runs
	});
});
