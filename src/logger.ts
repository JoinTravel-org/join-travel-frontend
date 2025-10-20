class Logger {
  private static instance: Logger;

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatMessage(level: string, message: string, error?: unknown): string {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] [${level}] ${message}`;
    if (error) {
      return `${formattedMessage} - Error: ${error instanceof Error ? error.message : String(error)}`;
    }
    return formattedMessage;
  }

  public info(message: string): void {
    console.log(this.formatMessage('INFO', message));
  }

  public warn(message: string): void {
    console.warn(this.formatMessage('WARN', message));
  }

  public error(message: string, error?: unknown): void {
    console.error(this.formatMessage('ERROR', message, error));
  }

  public debug(message: string): void {
    console.debug(this.formatMessage('DEBUG', message));
  }
}

export default Logger;