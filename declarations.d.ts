declare namespace NodeJS {
  export interface ProcessEnv {
    MONGODB_URI: string;
    JWT_SECRET: string;
    COINBASE_API: string;
    COINBASE_WEBHOOK_SECRET: string;
  }
}

declare module "http" {
  interface IncomingMessage {
    rawBody: any;
  }
}
