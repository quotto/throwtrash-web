interface LogParams {
  message: string;
  data?: any;
  method?: string;
}

class Logger {
  private module: string;

  constructor(module: string = 'unknown') {
    this.module = module;
  }

  private log(level: 'debug' | 'info' | 'warn' | 'error', params: LogParams) {
    const { message, data, method } = params;
    const logMessage = {
      module: this.module,
      method,
      message,
      data,
    };
    console[level](logMessage);
  }

  debug(params: LogParams) {
    this.log('debug', params);
  }

  info(params: LogParams) {
    this.log('info', params);
  }

  warn(params: LogParams) {
    this.log('warn', params);
  }

  error(params: LogParams) {
    this.log('error', params);
  }
}

export default Logger;