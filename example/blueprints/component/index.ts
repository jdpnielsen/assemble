import {
	prompt,
	changeCase,
	AssembleContext,
	runner,
	assembleTemplate,
} from '@jdpnielsen/assemble';
import path from 'node:path';

runner(async (context: AssembleContext) => {
	const answers = await prompt<{ name: string; destination: string }>([
		{
			type: 'text',
			name: 'name',
			message: 'What is the name of the component?',
			required: true,
		},
		{
			type: 'text',
			name: 'destination',
			message: 'Where should this component be created?',
			required: true,
			initial: './src/components',
		},
	]);

	const name = changeCase(answers.name);

	const vars = {
		name: name.kebabCase,
		componentName: name.pascalCase,
		componentClass: name.camelCase,
	};

	await assembleTemplate({
		input: path.join(__dirname, './blueprint.tsx.eta'),
		output: path.join(context.cwd, `./${answers.destination}/${vars.name}/${vars.name}.tsx`),
		templateVariables: vars,
		context,
	});

	await assembleTemplate({
		input: path.join(__dirname, './blueprint.stories.tsx.eta'),
		output: path.join(context.cwd, `./${answers.destination}/${vars.name}/${vars.name}.stories.tsx`),
		templateVariables: vars,
		context,
	});

	await assembleTemplate({
		input: path.join(__dirname, './blueprint.module.scss.eta'),
		output: path.join(context.cwd, `./${answers.destination}/${vars.name}/${vars.name}.module.scss`),
		templateVariables: vars,
		context,
	});
}).catch((err) => {
	console.error(err);
	process.exit(1);
});
