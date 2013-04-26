"use strict";

var stewardess = require('../index')
  , mongoose = require('mongoose')
  , assert = require('assert')
  , Model
  ;

var people = [
  { name: 'bob', age: 18 },
  { name: 'joe', age: 20 },
  { name: 'john', age: 22 },
  { name: 'sally', age: 24 },
  { name: 'billy', age: 32 }
];

describe('stewardess mongoose queries', function() {
  it('we need a schema and some data', schemaAndData);
  it('should run a query', runQuery);
});

function schemaAndData(done) {
  var schema = new mongoose.Schema({
    name: String,
    age: Number
  });
  mongoose.connect('mongodb://localhost/test');
  Model = mongoose.model('stewardess', schema);
  var docs = people.concat();
  function save(err) {
    if (err) return done(err);
    if (!docs.length) return done();
    var doc = docs.pop();
    doc = new Model(doc);
    doc.save(save);
  }
  Model.remove({}, save);
}

function runQuery(done) {
  stewardess(

    Model
      .find()
      .select({ name: 1, age: 1, _id: 0 })
      .sort('age')
      .comment('people'),

    function convertToObjects(options, next) {
      options.people = options.people.map(function(o) {
        return o.toObject();
      });
      next();
    },

    function checkForDocs(options, next) {
      assert.deepEqual(people, options.people);
      next();
    }
  )
  .error(done)
  .done(function() {
    done();
  })
  .run({});

}
