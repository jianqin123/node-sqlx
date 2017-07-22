describe('testMongoDB', function () {

  it('insert2 MongoDB2', function (done) {
    var data = { 'n': 'w' };
    var set = 'first'
    const client = sqlx.createClient()
    client.define(set, MONGO_CONFIG_2)
    const conn = client.getConnection(OPERATER_INFO_1)
    async.waterfall([
      function (next) {
        conn.insert(set, data, next)
        done();
      }], function (err) {
        throw err
      })
  })



  it('update MongoDB', function (done) {
    var where = { 'n': 'w' };
    var update = { $set: { 'm': 'f' } }
    var set = 'first'
    const client = sqlx.createClient()
    client.define(set, MONGO_CONFIG_2)
    const conn = client.getConnection(OPERATER_INFO_1)
    async.waterfall([
      function (next) {
        conn.update(set, where, update, next)
        done();
      }], function (err) {
        throw err
      })
  })


  it('select MongoDB', function (done) {
    var where = { 'n': 'w' };
    var set = 'first'
    const client = sqlx.createClient()
    client.define(set, MONGO_CONFIG_2)
    const conn = client.getConnection(OPERATER_INFO_1)
    async.waterfall([
      function (next) {
        conn.select(set, where, next)
        done();
      }], function (err) {
        throw err
      })
  })




  it('delete MongoDB', function (done) {   
    var data = { 'n': 'w' };
    var set = 'first'
    const client = sqlx.createClient()
    client.define(set, MONGO_CONFIG_2)
    const conn = client.getConnection(OPERATER_INFO_1)
    async.waterfall([
      function (next) {
        conn.delete(set, data, next)
        done();
      }], function (err) {
        throw err
      })  
  })

})


const mongodb = require('mongodb')
const assert = require('assert')
const async = require('async')
const sqlx = require('..')
const child_process = require('child_process')
const _ = require('lodash')

const MONGO_CONFIG_1 = {
  type: 'MongoDB',
  db: 'test2',
  host: 'localhost',
  port: '27017',
  DB_CONN_STR: 'mongodb://localhost:27017/test2'
}
const MONGO_CONFIG_2 = _.merge(_.cloneDeep(MONGO_CONFIG_1), {
  config: {
    connectionLimit: 5,
  },
})
const OPERATER_INFO_1 = {
  user: '101,23',
  actions: '*',
}