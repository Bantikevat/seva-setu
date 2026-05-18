const colors = { reset: '\x1b[0m', green: '\x1b[32m', red: '\x1b[31m', yellow: '\x1b[33m', gray: '\x1b[90m', magenta: '\x1b[35m' };
const ts = () => new Date().toISOString().replace('T', ' ').substring(0, 19);
module.exports = {
  info:  (...a) => console.log(`${colors.green}[INFO]${colors.reset}`, `${colors.gray}${ts()}${colors.reset}`, ...a),
  error: (...a) => console.error(`${colors.red}[ERROR]${colors.reset}`, `${colors.gray}${ts()}${colors.reset}`, ...a),
  ai:    (...a) => console.log(`${colors.magenta}[🤖 AI]${colors.reset}`, `${colors.gray}${ts()}${colors.reset}`, ...a),
};
