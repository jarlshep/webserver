import type { MigrationConfig } from "drizzle-orm/migrator";

type Config = {
    api: APIConfig;
    db: DBConfig;
};

type APIConfig = {
    fileserverHits: number;
    port: number;
    platform: string;
    secret: string;
};

type DBConfig = {
    url: string;
    migrationConfig: MigrationConfig;
};

process.loadEnvFile();

function envOrThrow(key: string) {
    const value = process.env[key];
    if (value) {
        return value;
    } else {
      throw new Error(`Env var ${key} is not set`);
    }
}

const migrationConfig: MigrationConfig = {
    migrationsFolder: "./src/db/migrations",
};

export const config: Config = {
    api: {
        fileserverHits: 0,
        port: Number(envOrThrow("PORT")),
        platform: envOrThrow("PLATFORM"),
        secret: envOrThrow("SECRET"),
    },
    db: {
        url: envOrThrow("DB_URL"),
        migrationConfig: migrationConfig,
    }
};