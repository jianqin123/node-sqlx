var singleton_pools = {}
module.exports.Context = function (config) {
  assert.equal(config.type, 'mongodb')
  const config_key = crypto.createHash('md5')
    .update(JSON.stringify(config))
    .digest('hex')
  if (!singleton_pools[config_key]) {
    singleton_pools[config_key] = config
    log.info('MongoDB info created:', config)
  }
  const connect_info = singleton_pools[config_key]
  this.getConnection = function () {
    log.info('getConnection MongoDB')
    var ret = new MongoConnection(connect_info, config.readonly)
    return ret
  }
}
function MongoConnection(connect_info, readonly) {
  this._addreess = connect_info.address
  this._host = connect_info.host
  this._port = connect_info.port
  this._db = connect_info.db;
}
var user = require('./user')
/**
 * select data satified the condition
 * @param set collection
 * @param where condition * 
 */
MongoConnection.prototype.select = function (set, where, callback) {
  if (this._readonly) {
    console.log("only read is allowed")
  }
  var server = new mongodb.Server(this._host, this._port, { auto_reconnect: true });
  var db = new mongodb.Db(this._db, server, { safe: true });
  db.open(function (err, db) {
    if (err) {
      throw err;
    } else {
      db.collection(set, function (err, collection) {
        if (err) {
          console.log('fail to set' + err)
        }
        else {
          collection.find(where).toArray(function (err, result) {
            if (err){
              console.log('Error update:' + err);
            }
            else {
              console.log('the select result')
              console.log(result)
            }
          })
        }
      })
      db.close();
    }
  });
  mongodb.MongoClient.connect(this._addreess,callback)
}
/**
 * select all data from set
 * @param set colleciton
 */
MongoConnection.prototype.selectAll = function (set, callback) {
  if (this._readonly) {
    console.log("only read is allowed")
  }
  var collection=user.openDatabase()
  var server = new mongodb.Server(this._host, this._port, { auto_reconnect: true });
  var db = new mongodb.Db(this._db, server, { safe: true });
  db.open(function (err, db) {
    if (err) {
      console.log('fail to databse' + err)      
    } else {
      db.collection(set, function (err, collection) {
        if (err) {
          console.log('select fail to connect to set ' + err)         
        }
        else {
          user.findCollectionNoCondition(collection)
        }
      })
      db.close();
    }
  });
  mongodb.MongoClient.connect(this._addreess,callback)
}
/**
 * update data satisfied from old value to new value
 * @param set collection
 * @param where old value
 * @param update new value *
 */
MongoConnection.prototype.update = function (set, where, update, callback) {
  if (this._readonly) {
    console.log("only read is allowed")
  }
  var server = new mongodb.Server(this._host, this._port, { auto_reconnect: true });
  var db = new mongodb.Db(this._db, server, { safe: true });
  var pool = this._pool
  db.open(function (err, db) {
    if (err) {
      console.log('fail to database:' + err)     
    } else {
      db.collection(set, function (err, collection) {
        if (err) {
          console.log('fail to set' + err)         
        }
        else {
          collection.update(where, update, function (err, result) {
            if (err) {
              console.log('Error update:' + err)             
            }
            else {
              console.log('infomation after update')
              console.log(result)
            }
          })
        }
      })
    }
    db.close();
  });
  mongodb.MongoClient.connect(this._addreess,callback)
}
/**
 * delete data from set 
 *@param set collection
  @param data data to delet 
 */
MongoConnection.prototype.delete = function (set, data, callback) {
  if (this._readonly) {
    console.log("only read is allowed")
  }
  var server = new mongodb.Server(this._host, this._port, { auto_reconnect: true });
  var db = new mongodb.Db(this._db, server, { safe: true });
  db.open(function (err, db) {
    if (err) {
      console.log('fail to open database' + err)      
    } else {
      db.collection(set, function (err, collection) {
        if (err) {
          console.log('fail to connect set' + err)         
        }
        else {
          user.removeCollection(collection, data)      
        }
      })
      db.close();
    }
  });
  mongodb.MongoClient.connect(this._addreess, callback)
}
/**
 * insert data into  collection
 * @param set collection
 * @param data data to be inserted
 */
MongoConnection.prototype.insert = function (set, data, callback) {
  mongodb.MongoClient.connect(this._addreess,function (err, db) {
    if (err) {
      console.log("only read is allowed")
    }
    else {
      var collection = db.collection(set)
      user.insertCollection(collection, data, callback)
      db.close();     
    }
  });
  mongodb.MongoClient.connect(this._addreess,callback)    
}

const Q = require('q')
const mongodb = require('mongodb')
const util = require('util')
const crypto = require('crypto')
const async = require('async')
const assert = require('assert')
const debug = require('debug')
function __log() {
  debug(util.format.apply(null, arguments))
}
const log = {
    trace: __log,
    error: __log,
    debug: __log,
    info: __log,
}


