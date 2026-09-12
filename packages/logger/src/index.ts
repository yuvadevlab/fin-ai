/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Lightweight logger utility for the FinAI monorepo.
 *
 * Provides a `Logger` class with coloured, timestamped console output and
 * a `requestLogger` Express middleware that logs each HTTP request's
 * method, URL, status code, and duration — with error-level logging for 5xx
 * responses. Used by both `apps/api/main.ts` (HTTP) and services (application).
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export type LoggerConfig = {
  level?: LogLevel;
  enabled?: boolean;
  file?: string;
};

/** Convert env string to a LogLevel, lowercased and validated. */
function parseLogLevel(raw?: string): LogLevel {
  if (!raw) return "info";
  const v = raw.toLowerCase().trim();
  return ["debug", "info", "warn", "error"].includes(v) ? (v as LogLevel) : "info";
}

/** Minimal file transport — appends UTF-8 lines to the given path. */
import fs from "fs";

function createFileTransport(path: string): NodeJS.WritableStream {
  const dir = path.split("/").slice(0, -1).join("/") || ".";
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch {
    // directory exists or is not writable — best-effort
  }
  return fs.createWriteStream(path, { flags: "a", encoding: "utf8" });
}

export class Logger {
  context?: string;

  constructor(context?: string) {
    this.context = context;
  }

  formatMessage(level: LogLevel, message: any, ...optionalParams: any[]): string {
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

/**
 * Build a Logger configured from env + explicit options.
 *
 * - `LOG_ENABLED` → enabled (default true)
 * - `LOG_LEVEL`   → minimum level (default "info")
 * - `LOG_PERSIST` → when "true", also write logs to disk
 * - `LOG_FILE`    → target log file path (unspecified → persistence is a no-op)
 */
export function createLogger(config?: LoggerConfig): Logger {
  const enabled =
    config?.enabled ?? (process.env.LOG_ENABLED ? process.env.LOG_ENABLED !== "false" : true);
  const level = config?.level ?? parseLogLevel(process.env.LOG_LEVEL);
  const file = config?.file ?? process.env.LOG_FILE;
  const fileStream = file && process.env.LOG_PERSIST === "true" ? createFileTransport(file) : null;

  // Rank so we can compare the active minimum against the message level.
  const levelRank: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };
  const base = new Logger(undefined as any);

  const out = (msgLevel: LogLevel, message: string, ...rest: unknown[]) => {
    if (!enabled) return;
    if (levelRank[msgLevel] < levelRank[level]) return;
    const formatted = base.formatMessage(msgLevel, message, ...rest);
    if (msgLevel === "debug" && process.env.NODE_ENV === "production") return;
    (console as any)[
      {
        debug: "debug",
        info: "log",
        warn: "warn",
        error: "error",
      }[msgLevel] || "log"
    ](formatted);
    if (fileStream) {
      (fileStream as any).write(formatted + "\n");
    }
  };

  return {
    get context() {
      return (base as any).context;
    },
    set context(v) {
      (base as any).context = v;
    },
    log(message: any, ...rest: unknown[]) {
      out("info", message as string, ...rest);
    },
    info(message: any, ...rest: unknown[]) {
      out("info", message as string, ...rest);
    },
    warn(message: any, ...rest: unknown[]) {
      out("warn", message as string, ...rest);
    },
    error(message: any, ...rest: unknown[]) {
      out("error", message as string, ...rest);
    },
    debug(message: any, ...rest: unknown[]) {
      out("debug", message as string, ...rest);
    },
  } as unknown as Logger;
}

/**
 * Wrap a naive `Logger` instance so its output honors `LoggerConfig` +
 * env (LOG_ENABLED / LOG_LEVEL / LOG_PERSIST / LOG_FILE).
 *
 * Used in `apps/api/main.ts` so the Nest app logger and the HTTP request
 * logger can both carry a context string (via `new Logger("NAME")`) while
 * env controls magnitude, persistence, and per-request gating.
 */
export function loggerWithConfig(base: Logger, config?: LoggerConfig): Logger {
  const envLogger = createLogger(config);
  const proxy: any = {
    get context() {
      return base.context;
    },
    set context(v) {
      base.context = v;
    },
    log(...args: unknown[]) {
      envLogger.log(args[0] as string, ...(args.slice(1) as unknown[]));
    },
    info(...args: unknown[]) {
      envLogger.info(args[0] as string, ...(args.slice(1) as unknown[]));
    },
    warn(...args: unknown[]) {
      envLogger.warn(args[0] as string, ...(args.slice(1) as unknown[]));
    },
    error(...args: unknown[]) {
      envLogger.error(args[0] as string, ...(args.slice(1) as unknown[]));
    },
    debug(...args: unknown[]) {
      envLogger.debug(args[0] as string, ...(args.slice(1) as unknown[]));
    },
  };
  return proxy as unknown as Logger;
}

/**
 * Express middleware that logs incoming HTTP requests.
 *
 * Logs after the response finishes (via `res.on("finish")`) so the status
 * code is available. 5xx responses are logged at error level; 4xx at warn;
 * everything else at info. Returns the final duration in milliseconds.
 */
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
