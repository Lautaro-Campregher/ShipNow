import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "../config/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logsDirectory = path.resolve(__dirname, "../../logs");

const customLevels = {
  levels: {
    fatal: 0,
    error: 1,
    warning: 2,
    info: 3,
    http: 4,
    debug: 5,
  },
};

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message }) => {
    return `${timestamp} [${level}] ${message}`;
  }),
);

const logger = winston.createLogger({
  levels: customLevels.levels,
  level: config.nodeEnv === "production" ? "info" : "debug",
  format: logFormat,
  transports: [
    new winston.transports.Console(),
    new DailyRotateFile({
      dirname: logsDirectory,
      filename: "error-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      level: "error",
      maxFiles: "14d",
      format: winston.format.combine(
        winston.format((info) =>
          info.level === "error" || info.level === "fatal" ? info : false,
        )(),
        logFormat,
      ),
    }),
  ],
});

export default logger;
