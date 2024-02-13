import { Command } from 'commander';
import { prompt } from 'enquirer';
import execa from 'execa';
import { cosmiconfigSync } from 'cosmiconfig';
import { cwd } from 'process';
import path from 'path';
import { AssembleConfig, AssembleContext } from './lib/define-config';

const program = new Command();

program
	.version('1.1.0')
	.name('assemble')
	.description('Command-line tool to generate files based on templates')
	.option('-c, --config <string>', 'Path for config file. Example: --config ./assemble.config.ts')
	.option('-b, --blueprint <string>', 'Blueprint to use. Example: --blueprint component')
	.option('--dry-run', 'prevents filesystem changes', false)
	.option('-d, --debug', 'enables verbose logging', false)
	.parse(process.argv);

// Function code for CLI goes here
const opts = program.opts() as {
	debug: boolean;
	blueprint?: string;
	config?: string;
	dryRun: boolean;
};

const explorerSync = cosmiconfigSync('assemble')

const searchedFor = opts.config
	? explorerSync.load(opts.config)
	: explorerSync.search();

const executeFrom = searchedFor
	? path.resolve(path.parse(searchedFor.filepath).dir)
	: cwd();

async function run() {
	if (!searchedFor) {
		throw new Error('No config file specified');
	}

	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	const config: AssembleConfig = searchedFor.config;
	const { blueprints } = config;

	if (!opts.blueprint) {
		const answers = await prompt<{ blueprint: string }>([
			{
				name: 'blueprint',
				type: 'select',
				message: 'Select blueprint',
				choices: blueprints.map(b => b.name),
			}
		]);

		opts.blueprint = answers.blueprint;
	}

	const blueprint = blueprints.find(b => b.name === opts.blueprint);

	if (!blueprint) {
		throw new Error(`Blueprint ${opts.blueprint} not found`);
	}
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
	// const tsConfig = path.join(executeFrom, './tsconfig.json');
	const recipePath = path.join(executeFrom, blueprint.recipe);
	const tsconfigPath = path.join(executeFrom, './tsconfig.json');

	const assembleContext: AssembleContext = {
		cwd: executeFrom,
		preview: opts.dryRun,
	};

	console.log(`Executing blueprint: "${blueprint.name}"`);

	const { all, failed, stderr } = await execa('npx', ['tsx', '--tsconfig', tsconfigPath, recipePath, '-d', JSON.stringify(assembleContext)], {
		cwd: __dirname,
		all: true,
		input: process.stdin,
		stdout: process.stdout,
	})

	if (all) {
		console.log(all.replaceAll('\\\\', '\\'));
	}

	if (failed) {
		console.error(stderr);
		throw new Error('failed to build blueprint');
	}
}

run()
	.catch(err => {
		console.error(err);
		process.exit(1);
	});
