import { buildConfigSchema, BuildConfigSchema } from './schema';

class BuildConfig {
  private static instance: BuildConfig | null = null;
  private config: BuildConfigSchema | null = null;

  static getInstance(): BuildConfig {
    if (!BuildConfig.instance) {
      BuildConfig.instance = new BuildConfig();
    }

    return BuildConfig.instance;
  }

  async get<K extends keyof BuildConfigSchema>(key: K): Promise<BuildConfigSchema[K]> {
    await this.load();

    if (!this.config) {
      throw new Error('BuildConfig not loaded');
    }

    if (key in this.config) {
      return this.config[key];
    }

    throw new Error(`Key "${key}" not found in BuildConfig`);
  }

  private async load(): Promise<void> {
    if (this.config) {
      return;
    }

    const data = await import('./build-config.json').then((module) => module.default);

    this.config = buildConfigSchema.parse(data);
  }
}

export const getBuildConfigValue = async <K extends keyof BuildConfigSchema>(
  key: K,
): Promise<BuildConfigSchema[K]> => {
  return BuildConfig.getInstance().get(key);
};
