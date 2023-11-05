# @jdpnielsen/assemble

[![npm package][npm-img]][npm-url]
[![Build Status][build-img]][build-url]
[![Downloads][downloads-img]][downloads-url]
[![Issues][issues-img]][issues-url]
[![Commitizen Friendly][commitizen-img]][commitizen-url]
[![Semantic Release][semantic-release-img]][semantic-release-url]

> Command-line tool to generate files based on templates

## Install

```bash
npm install @jdpnielsen/assemble
```

## Blueprints

Blueprints are the core of Assemble. They are the templates that Assemble uses to generate files.
A blueprint is a directory that contains a `index.ts` file and any .eta templates that are needed.

The index.ts file is where the blueprint is defined. Its executes a runner function that is passed a `AssembleContext` object.

```ts
// ./blueprints/component/index.ts
import { prompt, changeCase, AssembleContext, runner, assembleTemplate } from '@jdpnielsen/assemble';

runner(async (context: AssembleContext) => {
  // Enquirer is bundled with Assemble and can be used to prompt the user for input
  const { name } = await prompt([
    {
      type: 'text',
      name: 'name',
      message: 'What is the name of the component?',
      required: true,
    },
  ]);

  const name = changeCase(answers.name);

  await assembleTemplate({
    // Assemble uses eta for templating
    input: path.join(__dirname, './blueprint.tsx.eta'),
    output: path.join(context.cwd, `./src/components/${name.kebabCase}/${name.kebabCase}.tsx`),
    templateVariables: {
      componentName: name.pascalCase,
    },
    context,
  });
}).catch((error) => {
  console.error(error);
  process.exit(1);
})
```

See [example](./example/blueprints) folder for examples.

To make a blueprint available to Assemble, you need to add it to the config file.

```ts
// assemble.config.ts
import { defineConfig } from '@jdpnielsen/assemble';

export default defineConfig({
  blueprints: [
    {
      name: 'component',
      recipe: './blueprints/component/index.ts',
    },
  ],
});
```

Once a blueprint is added to the config file, it can be used by Assemble.

```bash
$ npx assemble --blueprint component
```

## Motivation

Assemble was created to make it easier to generate files based on templates. The core idea is that you can create a blueprint that defines how a file should be generated using bundled helpers from the Assemble library. Assemble bundles [Enquirer](https://github.com/enquirer/enquirer), [Eta](https://eta.js.org/) and [ts-morph](https://ts-morph.com/) to make it easier to create blueprints.

Assemble cli then makes it easy to generate files using the Assemble command-line tool.


[build-img]:https://github.com/jdpnielsen/assemble/actions/workflows/release.yml/badge.svg
[build-url]:https://github.com/jdpnielsen/assemble/actions/workflows/release.yml
[downloads-img]:https://img.shields.io/npm/dt/@jdpnielsen/assemble
[downloads-url]:https://www.npmtrends.com/@jdpnielsen/assemble
[npm-img]:https://img.shields.io/npm/v/@jdpnielsen/assemble
[npm-url]:https://www.npmjs.com/package/@jdpnielsen/assemble
[issues-img]:https://img.shields.io/github/issues/jdpnielsen/assemble
[issues-url]:https://github.com/jdpnielsen/assemble/issues
[semantic-release-img]:https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]:https://github.com/semantic-release/semantic-release
[commitizen-img]:https://img.shields.io/badge/commitizen-friendly-brightgreen.svg
[commitizen-url]:http://commitizen.github.io/cz-cli/
