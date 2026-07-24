/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
export type LogLevel = "debug" | "info" | "warn" | "error";

export class Logger {
  private context?: string;

  constructor(context?: string) {
    this.context = context;
  }

  private formatMessage(level: LogLevel, message: any, ...optionalParams: any[]): string {
    const timestamp = new Date().toISOString();
    const ctx = this.context ? ` [${this.context}]` : "";
    const colorReset = "\x1b[0m";
    let color = "";

    switch (level) {
      case "debug":
        color = "\x1b[35m"; // Magenta
        break;
      case "info":
        color = "\x1b[32m"; // Green
        break;
      case "warn":
        color = "\x1b[33m"; // Yellow
        break;
      case "error":
        color = "\x1b[31m"; // Red
        break;
    }

    const levelStr = `${color}${level.toUpperCase()}${colorReset}`;
    const extra =
      optionalParams.length > 0
        ? ` ${optionalParams.map((p) => (typeof p === "object" ? JSON.stringify(p) : String(p))).join(" ")}`
        : "";
    return `[${timestamp}] ${levelStr}${ctx}: ${message}${extra}`;
  }

  log(message: any, ...optionalParams: any[]) {
    this.info(message, ...optionalParams);
  }

  info(message: any, ...optionalParams: any[]) {
    console.log(this.formatMessage("info", message, ...optionalParams));
  }

  warn(message: any, ...optionalParams: any[]) {
    console.warn(this.formatMessage("warn", message, ...optionalParams));
  }

  error(message: any, ...optionalParams: any[]) {
    console.error(this.formatMessage("error", message, ...optionalParams));
  }

  debug(message: any, ...optionalParams: any[]) {
    if (process.env.NODE_ENV !== "production") {
      console.debug(this.formatMessage("debug", message, ...optionalParams));
    }
  }
}

export function requestLogger(loggerInstance: Logger = new Logger("HTTP")) {
  return (req: any, res: any, next: () => void) => {
    const start = Date.now();
    const { method, originalUrl } = req;

    res.on("finish", () => {
      const duration = Date.now() - start;
      const { statusCode } = res;

      let level: LogLevel = "info";
      if (statusCode >= 500) {
        level = "error";
      } else if (statusCode >= 400) {
        level = "warn";
      }

      const msg = `${method} ${originalUrl} ${statusCode} - ${duration}ms`;
      if (level === "error") {
        loggerInstance.error(msg);
      } else if (level === "warn") {
        loggerInstance.warn(msg);
      } else {
        loggerInstance.info(msg);
      }
    });

    next();
  };
}
