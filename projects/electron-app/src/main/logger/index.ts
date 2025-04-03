import log from 'electron-log';
import path from 'path';
import dayjs from 'dayjs';

log.transports.file.resolvePathFn = (variables) =>
  path.join(
    variables.libraryDefaultDir,
    `${dayjs().format('YYYY-MM-DD')}.log`
  );

log.initialize({ preload: true });

export const logger = log;
