"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const winston_daily_rotate_file_1 = __importDefault(
  require("winston-daily-rotate-file"),
);
const app_config_1 = __importDefault(require("../../config/app_config"));
const winstonLogger = (lokiUrl, name, level, nodeEnv) => {
  const options = {
    console: {
      level,
      handleExceptions: true,
      format: winston_1.default.format.combine(
        winston_1.default.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston_1.default.format.colorize({ all: true }),
        winston_1.default.format.printf(
          ({ level, message, label, timestamp }) => {
            return `${timestamp} [${label || name}] ${level}: ${message}`;
          },
        ),
      ),
    },
    loki: {
      labels: { app: name, environment: nodeEnv },
      level,
      host: lokiUrl,
      format: winston_1.default.format.json(),
      replaceTimestamp: true,
      onConnectionError: (err) => console.error("Loki connection error:", err),
    },
    file: new winston_daily_rotate_file_1.default({
      filename: "logs/application%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "10m",
      maxFiles: "14d",
      format: winston_1.default.format.combine(
        winston_1.default.format.timestamp(),
        winston_1.default.format.json(),
      ),
    }),
  };
  const transports = [options.file];
  if (nodeEnv === "development") {
    transports.push(new winston_1.default.transports.Console(options.console));
    // transports.push(new LokiTransport(options.loki));
  } else {
    // In production, we primarily use Loki, but keep the file rotate as a fallback
    // transports.push(new LokiTransport(options.loki));
  }
  return winston_1.default.createLogger({
    exitOnError: false,
    defaultMeta: { service: name },
    transports: transports,
  });
};
const logger = winstonLogger(
  app_config_1.default.LOKI_URL || "http://localhost:3100",
  app_config_1.default.APP_NAME || "auth-service",
  app_config_1.default.LOG_LEVEL || "info",
  app_config_1.default.NODE_ENV || "development",
);
exports.logger = logger;
