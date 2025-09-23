import type { Config } from 'jest'
import { createJsWithTsEsmPreset } from 'ts-jest'

const presetConfig = createJsWithTsEsmPreset({
	//...options
	tsconfig: 'tsconfig.test.json',

})

export default {
	displayName: 'ts-only',
	...presetConfig,
	collectCoverageFrom: [
		'<rootDir>/src/**/*.ts',
		'<rootDir>/src/**/*.mts',
		'!<rootDir>/src/**/*.spec.ts',
		'!<rootDir>/src/**/*.spec.mts',
		'!<rootDir>/src/__tests__/**/*.ts',
		'!<rootDir>/src/types/**/*.ts',
		'!<rootDir>/src/cli.ts',
	],
	collectCoverage: true,
	transform: {
		'^.+\\.ts$': ['ts-jest', {
			babel: true,
			tsconfig: 'tsconfig.test.json',
		}],
		'^.+\\.mts$': ['ts-jest', {
			babel: true,
			tsconfig: 'tsconfig.test.json',
		}]
	},
} satisfies Config
