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
      req.isCurl = true;
    }
    next();
  },
  function(req, res, next) {
    if (req.isCurl) {
      res.end('yur usin curl!');
    } else {
      res.end('oh hai');
    }
    next();
  }
)
.before(function(req, res) {
  req.i = req.i + 1 || 1;
  req.lastStart = process.hrtime();
})
.after(function(req, res) {
  var t = process.hrtime(req.lastStart);
  console.log('middleware ' + req.i + ' took %d seconds and %d nanoseconds', t[0], t[1]);
})
.done(function(req, res) {
  var t = process.hrtime(req.startTime);
  console.log(req.url + ' served in %d seconds and %d nanoseconds', t[0], t[1]);
})
.done(function(req, res) {
  console.log(req.url + ' served with status ' + res.statusCode);
  console.log();
})
.bind();

http.Server(handle).listen(8080);
