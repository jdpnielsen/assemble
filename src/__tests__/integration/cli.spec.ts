import { execa } from 'execa';
import { rm } from 'fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import packageJson from '../../../package.json' with { type: 'json' };

const currentDir = dirname(fileURLToPath(import.meta.url));
const bin = resolve(currentDir, '../../../bin/index.js');

describe('assemble', () => {
	beforeEach(async () => {
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		await rm('./dist', { recursive: true }).catch(() => {});
	});

	it('should display the help contents', async () => {
		const { stdout } = await execa(bin, ['--help']);

		expect(stdout).toContain('Usage: assemble [options]');
	});

	it('should display version information', async () => {
		const { stdout } = await execa(bin, ['--version']);

		expect(stdout).toContain(packageJson.version);
	});
});
