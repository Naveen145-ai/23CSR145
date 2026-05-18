const axios = require('axios');

const LOG_API = 'http://4.224.186.213/evaluation-service/logs';

async function log(stack, level, packageName, message) {
  const validStacks = ['backend', 'frontend'];
  const validLevels = ['debug', 'info', 'warn', 'error', 'fatal'];
  const validPackages = ['cache', 'controller', 'cron_job', 'db', 'domain', 'route', 'service'];

  if (!validStacks.includes(stack)) {
    console.error(` Invalid stack: ${stack}. Must be: ${validStacks.join(', ')}`);
    return;
  }

  if (!validLevels.includes(level)) {
    console.error(` Invalid level: ${level}. Must be: ${validLevels.join(', ')}`);
    return;
  }

  if (!validPackages.includes(packageName)) {
    console.error(` Invalid package: ${packageName}. Must be: ${validPackages.join(', ')}`);
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
