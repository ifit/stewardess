"use strict";

var http = require('http')
  , stewardess = require('../index')

var handle = stewardess(
  function(req, res, next) {
    req.startTime = process.hrtime();
    next();
  },
  function(req, res, next) {
    console.log(req.url + ' requested');
    next();
  },
  function(req, res, next) {
    if (req.headers && /^curl/.test(req.headers['user-agent'])) {
      res.end('yur usin curl!');
      next('break'); // fire 'done' and stop
    } else {
      next();
    }
  },
  function(req, res, next) {
    res.end('oh hai');
    next();
  }
)
.before(function(req, res) {
  req.i = req.i + 1 || 1;
  req.lastStart = process.hrtime();
})
.after(function(req, res) {
  var t = process.hrtime(req.lastStart);
  console.log('middleware ' + req.i + ' took %d seconds and %d ms', t[0], t[1]/1000000);
})
.done(function(req, res) {
  var t = process.hrtime(req.startTime);
  console.log(req.url + ' served in %d seconds and %d ms', t[0], t[1]/1000000);
})
.done(function(req, res) {
  console.log(req.url + ' served with status ' + res.statusCode);
  console.log();
})
.bind();

http.Server(handle).listen(8080);
