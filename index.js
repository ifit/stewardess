var stewardess = require('./lib/index')
stewardess.plugins = {
  timer: require('./plugins/timer'),
  hrTimer: require('./plugins/hr-timer'),
  overallTime: require('./plugins/overall-time')
}

module.exports = stewardess;
