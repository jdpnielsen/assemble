import { defineConfig } from '../src/index';

export default defineConfig({
	blueprints: [
		{
			name: 'component',
			recipe: './blueprints/component/index.ts',
		},
		{
			name: 'block',
			recipe: './blueprints/block/index.ts',
		},
		{
			name: 'template',
			recipe: './blueprints/template/index.ts',
		},
	],
});
