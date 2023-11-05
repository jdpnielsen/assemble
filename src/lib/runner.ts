import { program } from 'commander';
import type { AssembleContext } from './define-config';

export function runner(recipe: (context: AssembleContext) => Promise<void>) {
	program
		.option('-d, --data <string>')
		.parse(process.argv);

	const opts = program.opts() as {
		data?: string;
	};

	const context = JSON.parse(opts.data || '{}') as AssembleContext;

	return recipe(context)
		.catch((err) => {
			console.error(err);
			process.exit(1);
		});
}
