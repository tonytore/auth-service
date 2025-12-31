import env from "dotenv";
env.config();

const appConfig = {
  PORT: process.env.PORT || 3000,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USER: process.env.DB_USER,
  BLOG_AUTH_DB: process.env.BLOG_AUTH_DB,
  DB_PASSWORD: process.env.DB_PASSWORD,
  LOKI_URL: process.env.LOKI_URL || "http://localhost:3100",
  APP_NAME: process.env.APP_NAME,
  LOG_LEVEL: process.env.LOG_LEVEL,
  NODE_ENV: process.env.NODE_ENV as "development" | "production",
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRY: 18000,
  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRY: 86400,
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN,
  ACCESS_COOKIE_OPTIONS: {
    httpOnly: true,
    secure: false,
    sameSite: "lax" as const,
    maxAge: 15 * 60 * 1000,
  },
  REFRESH_COOKIE_OPTIONS: {
    httpOnly: true,
    secure: true,
    sameSite: "strict" as const,
    path: '/api/auth/refresh',
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
  INTERNAL_SERVICE_TOKEN: process.env.INTERNAL_SERVICE_TOKEN,

};

export default appConfig;
