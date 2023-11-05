import { constantCase, snakeCase, pascalCase, lowerCase, kebabCase, camelCase } from 'case-anything';

export function changeCase(input: string) {
	return {
		lowerCase: lowerCase(input),
		kebabCase: kebabCase(input),
		camelCase: camelCase(input),
		pascalCase: pascalCase(input),
		constantCase: constantCase(input),
		snakeCase: snakeCase(input),
	}
}
