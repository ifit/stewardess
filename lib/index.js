"use strict";

var events       = require('events')
  , util         = require('util')
  , EventEmitter = events.EventEmitter
  , mongoose     = { Query: function(){} }
  ;

try {
  mongoose = require('' + 'mongoose'); // hack to make work with browserify
} catch (e) { }

// create a new instance of Stewardess and return it
function stewardess() {
  var queue = ( arguments.length === 1
              ? [arguments[0]]
              : Array.apply(null, arguments));
  var self = new Stewardess(queue);
  return self;
}
module.exports = stewardess;

// class defenition
function Stewardess(queue) {
  EventEmitter.call(this);
  this.queue = [];
  queue.forEach(this.add.bind(this));
}
util.inherits(Stewardess, EventEmitter);

// run through the queue
Stewardess.prototype.run = function() {
  var queue = this.queue
    , queuePos = 0
    , self = this
    , context = this.context || this
    , fnName
    , args = ( arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments) )
    , beforeArgs = [].concat('before', args, null)
    , afterArgs  = [].concat('after',  args, null)
    , doneArgs   = [].concat('done',   args)
    , finalArgs  = [].concat('final',  args)
    ;

  function before(name) {
    beforeArgs[beforeArgs.length - 1] = name;
    self.emit.apply(self, beforeArgs);
  }

  function after(name) {
    afterArgs[afterArgs.length - 1] = name;
    self.emit.apply(self, afterArgs);
  }

  function done() {
    self.emit.apply(self, doneArgs);
    self.emit.apply(self, finalArgs);
  }

  function error(err) {
    self._error(err, args);
    self.emit.apply(self, finalArgs);
  }

  // push the callback onto the arguments
  args.push(function(err) {
    if (err && [ 'break', 'skip', 'previous', 'repeat' ].indexOf(err) === -1) return error(err);
    after(fnName);
    if (err === 'break') return done();
    if (err === 'skip') queuePos += 1;
    if (err === 'repeat') queuePos -= 1;
    if (err === 'previous') queuePos = Math.max(queuePos - 2, 0);
    nextTick(next);
  });

  // start
  next();

  function next() {
    // check if we are finished
    if (queuePos < queue.length) {
      // get next method
      var fn = queue[queuePos];
      queuePos += 1;
      fnName = fn.name || 'anonymous';

      before(fnName);

      try {
        fn.apply(context, args);
      } catch (e) {
        return error(e);
      }

    } else {
      done();
    }
  }

}

Stewardess.prototype.plugin = function(plugin, options) {
  plugin(this, options);
  return this;
}

Stewardess.prototype._error = function(err, args) {
  args.unshift('error', err);
  args.pop();
  this.emit.apply(this, args);
}

Stewardess.prototype.context = function(context) {
  this.context = context;
  return this;
}

Stewardess.prototype.bind = function() {
  return this.run.bind(this);
}

Stewardess.prototype.add = function(fn) {
  if (fn instanceof mongoose.Query) {
    this.addMongooseQuery(fn);
  } else {
    this.queue.push(fn);
  }
  return this;
}

Stewardess.prototype.addMongooseQuery = function(query) {
  this.queue.push(function(options, next) {
    query.exec(function(err, docs) {
      if (err) return next(err);
      if (!query.options.comment) return next(new Error('mongoose query needs comment'));
      options[query.options.comment] = docs;
      next();
    });
  });
}

Stewardess.prototype.addBefore = function(fn) {
  this.queue.unshift(fn);
  return this;
}

Stewardess.prototype.after = function(fn) {
  return this.contextOn('after', fn);
}

Stewardess.prototype.before = function(fn) {
  return this.contextOn('before', fn);
}

Stewardess.prototype.error = function(fn) {
  return this.contextOn('error', fn);
}

Stewardess.prototype.done = function(fn) {
  return this.contextOn('done', fn);
}

Stewardess.prototype.final = function(fn) {
  return this.contextOn('final', fn);
}

Stewardess.prototype.contextOn = function(event, fn) {
  var self = this;
  this.on(event, function() {
    fn.apply(self.context, arguments);
  });
  return self;
}

function nextTick(cb) {
  if (typeof setImmediate !== 'undefined') {
    setImmediate(cb);
  } else if (typeof process !== 'undefined' && process && process.nextTick) {
    process.nextTick(cb);
  } else {
    setTimeout(cb, 0);
  }
}
