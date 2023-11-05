export type AssembleConfig = {
	blueprints: BlueprintConfig[];
}

export type BlueprintConfig = {
	name: string;
	recipe: string;
};

export type AssembleContext = {
	cwd: string;
	preview?: boolean;
};

export function defineConfig(config: AssembleConfig): AssembleConfig {
	return config;
}
