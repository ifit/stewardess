var stewardess = require('./lib/index');

stewardess.plugins = {
  timer: require('./plugins/timer'),
  hrTimer: require('./plugins/hr-timer'),
  overallTime: require('./plugins/overall-time')
}

stewardess.skip = function() {
  arguments[arguments.length - 1]('skip')
}

module.exports = stewardess;
