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
  this._readonly=readonly
  this._address = connect_info.address
  this._host = connect_info.host
  this._port = connect_info.port
  this._db = connect_info.db
  this._released=false
}
/**
 * select data satisfied the condition from collection
 * @param set collection
 * @param where condition 
 * @param update not used here
 */
var  selectData=function(set, where, update, next){       
  set.find(where).toArray(function (err, result) {
    if (err){      
      return next(err)
    } else {     
      return next(null, result)
    }
  })  
}
/**
 * insert data into collection
 * @param  set collection
 * @param  where data need to insert into collection
 * @param update not used here
 */
var insertData=function(set, where, update, next){
  set.insert(where, {safe:true}, function (err, result) {
    if (err) {     
      return next(err)        
    } else {      
      return next(null, result)
    }
  })
}
/**
 * delete data from collection
 * @param  set collection 
 * @param where the data need to delete
 * @param update not used here
 */
var deleteData=function(set, where, update, next){
  set.remove(where, {safe: true}, function (err, count) {   
    if (err) {    
      return next(err)
    } else {     
      return next(null, count) 
    }
  }) 
}
/**
 * update selected data to new value
 * @param set collection
 * @param where the data need to update
 * @param update new value
 */
var updateData=function(set, where, update, next){  
  set.update(where, update, function (err, result) {
    if (err) {      
      return next(err)           
    }
    else {     
      return next(null, result)
    }
  })
}
/**
 * interact with database with specific function
 * @param  host host
 * @param  port port
 * @param  database database name
 * @param  set collection
 * @param  where used in select and update function
 * @param  update old value when update
 * @param  address address to database
 * @param  callback function to be execute
 * @param  next callback function
 */
var interactWithDatabase=function(host, port, database, set, where, update, address, callback, next){
  var server = new mongodb.Server(host, port, { auto_reconnect: true })
  var db = new mongodb.Db(database, server, { safe: true })
  db.open(function (err, db) {
    if (err) {     
      next(err)     
    } else { 
      db.collection(set, function (err, collection) {  
        if (err) {         
          next(err)       
        }
        else {  
          callback(collection, where, update, next)           
        }
      })
      db.close()
    }
  })
  mongodb.MongoClient.connect(address, callback) 
}
/**
 * release connection
 */
MongoConnection.prototype.release = function() {
  this._released = true
  if (!this._conn) return 
}
/**
 * select data satisfied the specific condition from collection 
 * @param set collection
 * @param where  condition
 */
MongoConnection.prototype.select = function (set, where, callback) {
  if (this._readonly) {
    console.log('only read is allowed')
  } 
  assert(callback.constructor === Function) 
  interactWithDatabase(this._host, this._port, this._db,set, where,null, this._address, selectData, callback)
}
/**
 * update data satisfied from old value to new value
 * @param set collection
 * @param where old value
 * @param update new value *
 */
MongoConnection.prototype.update = function (set, where, update, callback) {
  if (this._readonly) {
    console.log('only read is allowed')
    return 
  }
  assert(callback.constructor === Function) 
  interactWithDatabase(this._host, this._port, this._db, set, where, update, this._address, updateData, callback)
}
/**
 * delete data from set 
 *@param set collection
  @param data data to delet 
 */
MongoConnection.prototype.delete = function (set, data, callback) {
  if (this._readonly) {
    console.log('only read is allowed')
    return
  }
  assert(callback.constructor === Function) 
  interactWithDatabase(this._host, this._port, this._db, set, data, null, this._address, deleteData, callback)  
}
/**
 * insert data into  collection
 * @param set collection
 * @param data data to be inserted
 */
MongoConnection.prototype.insert = function (set, data, callback) {
  if (this._readonly) {
    console.log('only read is allowed')
    return    
  }
  assert(callback.constructor === Function)      
  interactWithDatabase(this._host, this._port, this._db, set, data, null, this._address, insertData, callback) 
}
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


