import {
	prompt,
	changeCase,
	AssembleContext,
	patchTsFile,
	runner,
	assembleTemplate,
	ts,
} from '@jdpnielsen/assemble';

import path from 'path';

const { SyntaxKind } = ts;

runner(async (context: AssembleContext) => {
	const answers = await prompt<{ name: string }>([
		{
			type: 'text',
			name: 'name',
			message: 'What is the name of the block?',
			required: true,
		},
	]);

	const name = changeCase(answers.name);

	const vars = {
		name: name.kebabCase,
		type: name.camelCase,
		componentName: name.pascalCase,
		componentClass: name.camelCase,
	};

	await assembleTemplate({
		input: path.join(__dirname, './blueprint.tsx.eta'),
		output: path.join(context.cwd, `./src/blocks/${vars.name}/${vars.name}.blocks.tsx`),
		templateVariables: vars,
		context,
	});

	await assembleTemplate({
		input: path.join(__dirname, './blueprint.stories.tsx.eta'),
		output: path.join(context.cwd, `./src/blocks/${vars.name}/${vars.name}.stories.tsx`),
		templateVariables: vars,
		context,
	});

	await assembleTemplate({
		input: path.join(__dirname, './blueprint.module.scss.eta'),
		output: path.join(context.cwd, `./src/blocks/${vars.name}/${vars.name}.module.scss`),
		templateVariables: vars,
		context,
	});

	await assembleTemplate({
		input: path.join(__dirname, './blueprint.schema.ts.eta'),
		output: path.join(context.cwd, `./src/blocks/${vars.name}/${vars.name}.schema.ts`),
		templateVariables: vars,
		context,
	});

	await assembleTemplate({
		input: path.join(__dirname, './blueprint.query.ts.eta'),
		output: path.join(context.cwd, `./src/blocks/${vars.name}/${vars.name}.query.ts`),
		templateVariables: vars,
		context,
	});

	await assembleTemplate({
		input: path.join(__dirname, './index.ts.eta'),
		output: path.join(context.cwd, `./src/blocks/${vars.name}/index.ts`),
		templateVariables: vars,
		context,
	});

	await patchTsFile({
		context,
		input: `${context.cwd}/src/blocks/index.ts`,
		patcher(file) {
			file.addImportDeclaration({
				namedImports: [`${vars.type}Config`],
				moduleSpecifier: `./${vars.name}`,
			});

			const blockVariable = file.getVariableDeclarationOrThrow('blockDefinitions');
			const objectLiteral = blockVariable.getFirstDescendantByKindOrThrow(SyntaxKind.ObjectLiteralExpression);
			const props = objectLiteral.getProperties();
			const newElementName = `[${vars.type}Config.name]`;
			const index = props.findIndex((element) => element.getText() > newElementName);

			if (index === -1) {
				objectLiteral.addPropertyAssignment({
					name: newElementName,
					initializer: `${vars.type}Config`,
				});
			} else {
				objectLiteral.insertPropertyAssignment(index, {
					name: newElementName,
					initializer: `${vars.type}Config`,
				});
			}
		},
	});

	await patchTsFile({
		context,
		input: `${context.cwd}/src/blocks/schemas.ts`,
		patcher(file) {
			file.addImportDeclaration({
				defaultImport: `${vars.type}Schema`,
				moduleSpecifier: `./${vars.name}/${vars.name}.schema`,
			});

			const blockVariable = file.getVariableDeclarationOrThrow('blockSchemas');
			const array = blockVariable.getFirstDescendantByKindOrThrow(SyntaxKind.ArrayLiteralExpression);
			const elements = array.getElements();
			const newElement = `${vars.type}Schema`;
			const index = elements.findIndex((element) => element.getText() > newElement);

			if (index === -1) {
				array.addElement(newElement);
			} else {
				array.insertElements(index, [newElement]);
			}
		},
	});
}).catch((err) => {
	console.error(err);
	process.exit(1);
});
