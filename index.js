var stewardess = require('./lib/index')
stewardess.plugins = {
  timer: require('./plugins/timer')
}

module.exports = stewardess;
