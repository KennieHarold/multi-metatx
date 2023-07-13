import logger from 'pino';

const DateOptions: Intl.DateTimeFormatOptions = {
  month: 'numeric',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric'
};

export const log = logger({
  prettifier: true,
  base: {
    pid: false
  },
  timestamp: () => `,"time":"${new Date(Date.now()).toLocaleDateString('en-US', DateOptions)}"`
});

export const reportError = (error: Error, fallback = 'Internal server error') => {
  log.error(error?.message ?? fallback);
};
