type APIConfig = {
    fileserverHits: number;
    dbURL: string;
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

export const config: APIConfig = {
    fileserverHits: 0,
    dbURL: envOrThrow("DB_URL"),
};