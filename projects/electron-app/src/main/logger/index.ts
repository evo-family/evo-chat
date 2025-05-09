import log from 'electron-log';
import path from 'path';
import dayjs from 'dayjs';

// 设置日志文件路径
log.transports.file.resolvePathFn = (variables) =>
  path.join(variables.libraryDefaultDir, `${dayjs().format('YYYY-MM-DD')}.log`);

// 初始化日志
log.initialize({ preload: true });

// 重写 console 方法
const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info,
};

// 重定向 console 输出到 electron-log
console.log = (...args) => {
  originalConsole.log(...args);
  log.info(...args);
};

console.error = (...args) => {
  originalConsole.error(...args);
  log.error(...args);
};

console.warn = (...args) => {
  originalConsole.warn(...args);
  log.warn(...args);
};

console.info = (...args) => {
  originalConsole.info(...args);
  log.info(...args);
};

export const logger = log;
