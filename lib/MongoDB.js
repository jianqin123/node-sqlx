var singleton_pools = {}
module.exports.Context = function (config) {
    assert.equal(config.type, 'MongoDB')
    const config_key = crypto.createHash('md5')
        .update(JSON.stringify(config))
        .digest('hex')
    if (!singleton_pools[config_key]) {
        singleton_pools[config_key] = config
        log.info('MongoDB info created:', config)
    }
    const pool = singleton_pools[config_key]
    this.getConnection = function () {
        log.info('getConnection MongoDB')
        var ret = new MongoConnection(pool, config.readonly)
        return ret
    }
}

function MongoConnection(pool, readonly) {
    this._pool = pool.DB_CONN_STR
    this._host = pool.host
    this._port = pool.port
    this._db = pool.db;
}
var user = require('./user')
/**
 * select data satified the condition
 * @param set collection
 * @param where condition
 * @param return -1 if error ,otherwise return data
 */
MongoConnection.prototype.select = function (set, where, callback) {
    if (this._readonly) {
        return errNotAllowed(callback)
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
                        if (err) console.log('Error update:' + err)
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
    mongodb.MongoClient.connect(this._pool, numberOfRetries = retryNum, callback)

}
/**
 * select all data from set
 * @param set :colleciton
 * @return ：return -1 if error，otherwise return all data 
 */
MongoConnection.prototype.selectAll = function (set, callback) {
    var server = new mongodb.Server(this._host, this._port, { auto_reconnect: true });
    var db = new mongodb.Db(this._db, server, { safe: true });
    db.open(function (err, db) {
        if (err) {
            console.log('fail to databse' + err)
            return -1;
        } else {
            db.collection(set, function (err, collection) {
                if (err) {
                    console.log('select fail to connect to set ' + err)
                    return -1;
                }
                else {
                    user.findCollectionNoCondition(collection)
                }
            })
            db.close();
        }
    });
    mongodb.MongoClient.connect(this._pool, numberOfRetries = retryNum, callback)
}
/**
 * update data satisfied from old value to new value
 * @param set :collection
 * @param where:old value
 * @param update :new value 
 *
 */

MongoConnection.prototype.update = function (set, where, update, callback) {
    if (this._readonly) {
        return -1;
    }
    var server = new mongodb.Server(this._host, this._port, { auto_reconnect: true });
    var db = new mongodb.Db(this._db, server, { safe: true });
    var pool = this._pool
    db.open(function (err, db) {
        if (err) {
            console.log('fail to database:' + err)
            return -1;
        } else {
            db.collection(set, function (err, collection) {              
                if (err) {
                    console.log('fail to set' + err)
                    return -1;
                }
                else {                 
                    collection.update(where, update, function (err, result) {
                        if (err) {
                            console.log('Error update:' + err)
                            return -1;
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
    mongodb.MongoClient.connect(this._pool, numberOfRetries = retryNum, callback)   
   

}

/**
 * delete data from set 
 *@param set:collection
  @param data:data to delet
  @param return return -1 if error,otherwise return 'remove success'
 */

MongoConnection.prototype.delete = function (set, data, callback) {
    if (this._readonly) {
        return -1
    }
    var server = new mongodb.Server(this._host, this._port, { auto_reconnect: true });
    var db = new mongodb.Db(this._db, server, { safe: true });    
    db.open(function (err, db) {      
        if (err) {
            console.log('fail to open database' + err)
            return -1;
        } else {
            db.collection(set, function (err, collection) {
                if (err) {
                    console.log('fail to connect set' + err)
                    return -1;
                }
                else {                 
                    user.removeCollection(collection, data)
                    return 'success remove'
                }
            })
            db.close();
        }
    });
    mongodb.MongoClient.connect(this._pool, callback)
   
   
}
/**
 * insert data into  collection
 * @param set:collection
 * @param data:data to be inserted
 * @ return -1 if error ,otherwise return 'success insert'
 */
MongoConnection.prototype.insert = function (set, data, callback) {
    mongodb.MongoClient.connect(this._pool, numberOfRetries = retryNum, function (err, db) {
        if (err) {
            return callback(null, null, null)
        }
        else {
            var collection = db.collection(set)
            user.insertCollection(collection, data, callback)
            db.close();
            return "insert into  success"
        }
    });
    mongodb.MongoClient.connect(this._pool, numberOfRetries = retryNum, callback)
}

const Q = require('q')
const retryNum = 1
const child_process = require('child_process')
const _ = require('lodash')
const bson = require('bson');
const mongodb = require('mongodb')
const QUERY_READONLY_ALLOW = ['SELECT']
const util = require('util')
const mysql = require('mysql')
const mongo_sql = require('mongo-sql')
const crypto = require('crypto')
const async = require('async')
const assert = require('assert')
const EventEmitter = require('events')
const debug = require('debug')('sqlx')
var local = {}
function __log() {
    debug(util.format.apply(null, arguments))
}
const log = {
    trace: __log,
    error: __log,
    debug: __log,
    info: __log,
}


