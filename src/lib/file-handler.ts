import type { PathLike } from 'node:fs';
import { writeFile, readFile, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { Eta } from 'eta'
import c from 'ansi-colors';
import { AssembleContext } from './define-config';
import { IndentationText, Project, QuoteKind, SourceFile } from 'ts-morph';

type ReadTemplateOptions = {
	input: PathLike;
};

export async function readTemplate({ input }: ReadTemplateOptions) {
	return await readFile(input);
}

type WriteTemplateOptions = {
	destination: PathLike;
	data: string | Buffer;
	context: AssembleContext;
};

export async function writeTemplate({ destination, data, context }: WriteTemplateOptions) {
	const relativeOutput = destination.toString().replace(context.cwd, '');

	const exists = await stat(destination)
		.then((out) => out.isFile())
		.catch(() => false);

	if (exists) {
		console.log(`${c.white('[Skipped]')} ${c.yellow('Exists')} ${relativeOutput}`);
		return;
	}

	if (context.preview) {
		console.log(`${c.white('[Skipped]')} ${c.green('Create')} ${relativeOutput}`);
		return;
	}

	await mkdir(path.parse(destination.toString()).dir, { recursive: true });

	await writeFile(destination, data);
	console.log(`${c.green('Create')} ${relativeOutput}`);
}

const eta = new Eta({})

type CompileTemplateOptions = {
	template: string | Buffer;
	templateVariables: object;
};

export async function compileTemplate({ template, templateVariables }: CompileTemplateOptions) {
	return await eta.renderStringAsync(template.toString(), templateVariables);
}

type AssembleTemplateOptions = {
	input: PathLike;
	output: PathLike;
	templateVariables: object;
	context: AssembleContext;
};

export async function assembleTemplate({ input, output, templateVariables, context }: AssembleTemplateOptions) {
	const template = await readTemplate({ input });
	const compiled = await compileTemplate({ template, templateVariables });
	await writeTemplate({ destination: output, data: compiled, context });
}

type PatchTsFileOptions = {
	input: PathLike;
	patcher: (input: SourceFile) => void;
	context: AssembleContext;
};

export async function patchTsFile({ input, patcher, context }: PatchTsFileOptions) {
	const relativeOutput = input.toString().replace(context.cwd, '');

	const project = new Project({
		manipulationSettings: {
			useTrailingCommas: true,
			indentationText: IndentationText.Tab,
			quoteKind: QuoteKind.Single,
		},
		tsConfigFilePath: `${context.cwd}/tsconfig.json`,
	});

	const file = project.getSourceFileOrThrow(input.toString());

	patcher(file);
	file.formatText({
		indentStyle: 1,
	});

	if (context.preview) {
		console.log(`${c.white('[Skipped]')} ${c.blue('Modified')} ${relativeOutput}`);
		return;
	}

	await writeFile(input, file.getFullText());
	console.log(`${c.blue('Modified')} ${relativeOutput}`);
}
