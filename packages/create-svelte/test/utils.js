import child_process from 'child_process';
import fs from 'fs';
import { fileURLToPath } from 'url';
import * as uvu from 'uvu';
import { create } from '../index.js';

/**
 * @typedef {{
 *   cwd: string;
 *   build: () => Promise<void>
 *   check: () => Promise<void>
 * }} TestContext
 */

/**
 * @param {string} app
 * @param {(test: import('uvu').Test<TestContext>) => void} callback
 */
export function run(app, callback) {
	/** @type {import('uvu').Test<TestContext>} */
	const suite = uvu.suite(app);

	suite.before(async (context) => {
		const cwd = fileURLToPath(new URL(`apps/${app}`, import.meta.url));
		context.cwd = cwd;

		rimraf(`${cwd}`);

		// TODO: turn this configurable per test
		await create(cwd, {
			eslint: true,
			name: app,
			playwright: true,
			prettier: true,
			template: 'default',
			types: 'typescript'
		});

		await spawn(`npm --prefix "${cwd}" install`, {
			cwd,
			stdio: 'inherit',
			shell: true
		});

		context.build = () =>
			spawn(`npm run --prefix "${cwd}" build`, {
				cwd,
				stdio: 'inherit',
				shell: true
			});

		context.check = () =>
			spawn(`npm run --prefix "${cwd}" check`, {
				cwd,
				stdio: 'inherit',
				shell: true
			});
	});

	suite.after(async (context) => {
		rimraf(`${context.cwd}`);
	});

	callback(suite);

	suite.run();
}

const parameterRegex = new RegExp('"[^"]+"|[\\S]+', 'g');

/**
 * @param {string} str
 * @param {child_process.SpawnOptions} opts
 */
function spawn(str, opts) {
	return new Promise((fulfil, reject) => {
		const [cmd, ...args] = str.match(parameterRegex);

		const child = child_process.spawn(cmd, args, opts);

		child.on('error', reject);

		child.on('exit', (exitCode) => {
			if (exitCode !== 0) reject(exitCode);
			fulfil(exitCode);
		});
	});
}

/** @param {string} path */
function rimraf(path) {
	(fs.rmSync || fs.rmdirSync)(path, { recursive: true, force: true });
}
