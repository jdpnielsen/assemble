import execa from 'execa';
import { rm } from 'fs/promises';
import { resolve } from 'path';
import { version } from '../../../package.json';

const bin = resolve(__dirname, './bin.js');

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

		expect(stdout).toContain(version);
	});
});
