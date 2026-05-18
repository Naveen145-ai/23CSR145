const axios = require('axios');

// EXACT API format from Pre-Test Setup
const LOG_API = 'http://4.224.186.213/evaluation-service/logs';

/**
 * Core logging function - EXACT Pre-Test Setup specification
 * @param {string} stack - "backend" or "frontend" (lowercase)
 * @param {string} level - "debug", "info", "warn", "error", "fatal" (lowercase)
 * @param {string} packageName - "cache", "controller", "cron_job", "db", "domain", "route", "service" (lowercase)
 * @param {string} message - Log message
 */
async function log(stack, level, packageName, message) {
  // Validation
  const validStacks = ['backend', 'frontend'];
  const validLevels = ['debug', 'info', 'warn', 'error', 'fatal'];
  const validPackages = ['cache', 'controller', 'cron_job', 'db', 'domain', 'route', 'service'];

  if (!validStacks.includes(stack)) {
    console.error(`❌ Invalid stack: ${stack}. Must be: ${validStacks.join(', ')}`);
    return;
  }

  if (!validLevels.includes(level)) {
    console.error(`❌ Invalid level: ${level}. Must be: ${validLevels.join(', ')}`);
    return;
  }

  if (!validPackages.includes(packageName)) {
    console.error(`❌ Invalid package: ${packageName}. Must be: ${validPackages.join(', ')}`);
    return;
  }

  // EXACT payload format from Pre-Test Setup
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
    // Silently fail if API is down - don't crash logging
    console.log(`[${level.toUpperCase()}] [${packageName}] ${message}`);
  }
}

// Helper functions
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

// Express middleware
function expressMiddleware() {
  return (req, res, next) => {
    // Log incoming request
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
