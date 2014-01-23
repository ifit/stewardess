"use strict";

var stewardess = require('../index')
  ;

var cats = [ 'Gary' ];
stewardess(
  function first(options, next) {
    options.cats.indexOf('Gebbeth') == -1 ? options.cats.push('Gebbeth') : options.cats.push('Rorschach');
    return next(options.cats.length > 3 ? 'break' : null); // the `break' here prevents an infinite loop
  },
  function second(options, next) {
    options.cats.push('Crook');
    return next();
  },
  function third(options, next) {
    options.cats.push('Sarah');
    return next('beginning');
  }
)
.done(function(options) {
  process.stdout.write('cats: ');
  console.log(options.cats);
})
.plugin(stewardess.plugins.timer)
.run({cats: cats});
