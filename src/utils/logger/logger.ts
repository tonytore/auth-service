
import winston, { Logger } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import LokiTransport from "winston-loki";
import appConfig from "../../config/app_config";

const winstonLogger = (
  lokiUrl: string,
  name: string,
  level: string,
  nodeEnv: "development" | "production",
): Logger => {
  const options = {
    console: {
      level,
      handleExceptions: true,
      format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.colorize({ all: true }),
        winston.format.printf(({ level, message, label, timestamp }) => {
          return `${timestamp} [${label || name}] ${level}: ${message}`;
        }),
      ),
    },
    loki: {
      labels: { app: name, environment: nodeEnv },
      level,
      host: lokiUrl,
      format: winston.format.json(),
      replaceTimestamp: true,
      onConnectionError: (err: unknown) => console.error("Loki connection error:", err),
    },
    file: new DailyRotateFile({
      filename: "logs/application%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "10m",
      maxFiles: "14d",
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    }),
  };

  const transports: winston.transport[] = [options.file];

  if (nodeEnv === "development") {
    transports.push(new winston.transports.Console(options.console));
    transports.push(new LokiTransport(options.loki));
  } else {
    // In production, we primarily use Loki, but keep the file rotate as a fallback
    transports.push(new LokiTransport(options.loki));
  }

  return winston.createLogger({
    exitOnError: false,
    defaultMeta: { service: name },
    transports: transports,
  });
};

const logger = winstonLogger(
  appConfig.LOKI_URL || "http://loki:3100",
  appConfig.APP_NAME || "auth-service",
  appConfig.LOG_LEVEL || "info",
  appConfig.NODE_ENV || "development",
);

export { logger };
