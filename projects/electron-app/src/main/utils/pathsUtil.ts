import path from 'path';
import log from 'electron-log';
import dayjs from 'dayjs';

/**
 * 获取日志文件路径
 */
export const getLogPath = () => {
  return log.transports.file.getFile().path;
};
