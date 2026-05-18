const axios = require('axios');

const LOG_API = 'http://4.224.186.213/evaluation-service/logs';

async function log(stack, level, packageName, message) {
  const allowedStacks = ['backend', 'frontend'];
  const allowedLevels = ['debug', 'info', 'warn', 'error', 'fatal'];
  const allowedPackages = ['cache', 'controller', 'cron_job', 'db', 'domain', 'route', 'service'];

  if (!allowedStacks.includes(stack)) {
    console.error(`Stack error: ${stack}. Accepted: ${allowedStacks.join(', ')}`);
    return;
  }

  if (!allowedLevels.includes(level)) {
    console.error(`Level error: ${level}. Accepted: ${allowedLevels.join(', ')}`);
    return;
  }

  if (!allowedPackages.includes(packageName)) {
    console.error(`Package error: ${packageName}. Accepted: ${allowedPackages.join(', ')}`);
    return;
  }

  const payload = {
    stack: stack,
    level: level,
    package: packageName,
    message: message
  };

  try {
    await axios.post(LOG_API, payload);
    console.log(`[${level.toUpperCase()}] [${packageName}] ${message}`);
  } catch (error) {
    console.log(`[${level.toUpperCase()}] [${packageName}] ${message}`);
  }
}

function debug(packageName, message) {
  return log('backend', 'debug', packageName, message);
}

function info(packageName, message) {
  return log('backend', 'info', packageName, message);
}

function warn(packageName, message) {
  return log('backend', 'warn', packageName, message);
}

function error(packageName, message) {
  return log('backend', 'error', packageName, message);
}

function fatal(packageName, message) {
  return log('backend', 'fatal', packageName, message);
}

function expressMiddleware() {
  return (req, res, next) => {
    log('backend', 'debug', 'route', `${req.method} ${req.path}`);
    next();
  };
}

module.exports = {
  log,
  debug,
  info,
  warn,
  error,
  fatal,
  expressMiddleware
};
