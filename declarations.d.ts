declare namespace NodeJS {
  export interface ProcessEnv {
    MONGODB_URI: string;
    JWT_SECRET: string;
  }
}
