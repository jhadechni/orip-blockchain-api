import { config } from "dotenv";
config();

interface EnvConfig {
  [key: string]: string | undefined;
}

class ConfigService {
  private static instance: ConfigService;
  private envConfig: EnvConfig;
  private constructor(envConfig: EnvConfig) {
    this.envConfig = envConfig;
  }
  static getInstance() {
    if (this.instance == null) {
      this.instance = new ConfigService(process.env);
    }
    return this.instance;
  }
  get(key: string): string {
    if (!this.envConfig[key]) {
      throw new Error(`Env var ${key} is not defined`);
    }
    return this.envConfig[key] || "";
  }
}

export const configService = ConfigService.getInstance();
