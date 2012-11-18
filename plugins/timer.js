"use strict";

var colors = require('colors')
  , defaults = require('./defaults')
  ;

function timer(stewardess, options) {
  options = defaults(options, {
    slow: 0,
    log: console.log.bind(console),
    colors: [
      { color: null,   ms: 0 },
      { color: 'yellow', ms: 10 },
      { color: 'red',    ms: 105 }
    ]
  });

  stewardess
  .before(function(obj) {
    obj._time = Date.now();
  })
  .after(function(obj) {
    var name = arguments[arguments.length - 1];
    var ms = Date.now() - obj._time;
    var color;
    if (ms >= options.slow) {
      var msg = name + ' took ' + ms + 'ms';
      if (options.colors && options.colors.length) {
        var i;
        for (i = options.colors.length - 1; ms < options.colors[i].ms; --i);
        color = options.colors[i].color;
        if (color && colors[color]) msg = msg[color];
      }
      options.log(msg);
    }
  });
}

module.exports = timer;
