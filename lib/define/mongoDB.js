var singleton_pools = {}
module.exports.Context = function(config) {
  assert.equal(config.type, 'mongoDB')
  const config_key = crypto.createHash('md5')
                           .update(JSON.stringify(config))
                           .digest('hex')
  if (!singleton_pools[config_key]) {
    singleton_pools[config_key] = config
    log.info('mongoDB info created:', config)
  }
  const pool = singleton_pools[config_key]
  this.getConnection = function() {
    log.info('getConnection MongoDB')      
    var ret = new MongoConnection(pool, config.readonly)
    // if (config.extend) {
    //   local.extendByConfig(ret, config)
    // }
    return ret
  }
}


function MongoConnection(pool, readonly) {
  this._events = new EventEmitter()
  this._readonly = readonly
  this._connected = false
  this._released = false   
  // console.log(pool+"   init")
  this._pool=pool.DB_CONN_STR
  this._host=pool.host
  this._port=pool.port
  this._db=pool.db;
  
}
MongoConnection.prototype.query=function(set,where,callback){
  if (this._readonly) {
      return errNotAllowed(callback) 
    } 
    var that=this   
   
      // console.log(that._connected)
      mongodb.MongoClient.connect(that._pool,numberOfRetries=retryNum,function(err,db){
      console.log('查询连接成功');
      //that._connected=true  
        var selectData = function(db,set,where, callback) {  
          //连接到表  
          var collection = db.collection(set);
          that._connected=true
          //查询数据       
          collection.find(where).toArray(function(err, result) {
            console.log("finding")
            if(err)
            {
              console.log('Error:'+ err);
              return;
            }    
            console.log(result) 
            callback(result);
          });
        }
        selectData(db,set,where,function(result){
          console.log("result")
          console.log(result);
          db.close;
        })     
    })   
}
MongoConnection.prototype.select=function(set,where,callback){
  if (this._readonly) {
      return errNotAllowed(callback) 
  }
    
    that=this
    // var mongo = require("mongodb");
    // var host = "localhost";
    // var port = "27017";
    var server = new mongodb.Server(that._host,that._port,{auto_reconnect:true});
    var db = new mongodb.Db(that._db,server,{safe:true});

    db.open(function(err,db){
      if(err){
        throw err;
        // console.log("连接数据库出错");
      }else{
        console.log("查询连接成功");
        db.collection(set,function(err,collection){          
          if(err){
            console.log("连接到数据集出错："+err)
          }
          else{          
            collection.find(where).toArray(function(err, result){  
                
             if(err) console.log("Error update:"+err)
             else {
               console.log("查询所得结果")
               console.log(result)
              }
           })           
          }
        })
        db.close();
      }
    });
    db.on("close",function(err,db){
      if(err){
        throw err;
        // console.log("连接数据库出错");
      }else{
        // console.log("关闭数据库连接：第四次到这")
      }
    })   
      mongodb.MongoClient.connect(that._pool,numberOfRetries=retryNum,function(err,db){
      db.close;
    })
    
    
}
MongoConnection.prototype.update=function(set,where,update,callback){
    if (this._readonly) {
      return errNotAllowed(callback) 
    }
    that=this
    // var mongo = require("mongodb");
    // var host = "localhost";
    // var port = "27017";
    var server = new mongodb.Server(that._host,that._port,{auto_reconnect:true});
    var db = new mongodb.Db(that._db,server,{safe:true});

    db.open(function(err,db){
      if(err){
        throw err;
        // console.log("连接数据库出错");
      }else{
        console.log("更新连接成功");
        db.collection(set,function(err,collection){
          if(err){
            console.log("连接到数据集出错："+err)
          }
          else{          
           collection.update(where,update,function(err,result){            
             if(err) console.log("Error update:"+err)
             else {
               console.log("更新后数据信息")
               console.log(result)
              }
           })
          }
        })
        db.close();
      }
    });


    db.on("close",function(err,db){
      if(err){
        throw err;
        // console.log("连接数据库出错");
      }else{
        // console.log("关闭数据库连接：第四次到这")
      }
    })   
      mongodb.MongoClient.connect(that._pool,numberOfRetries=retryNum,function(err,db){ 
      db.close;
    })
   
  } 

MongoConnection.prototype.delete=function(set,data,callback){
     if (this._readonly) {
      return errNotAllowed(callback) 
    }       
    that=this 
    async.waterfall([
      function(next){ 
    var server = new mongodb.Server(that._host,that._port,{auto_reconnect:true});
    var db = new mongodb.Db(that._db,server,{safe:true});

    db.open(function(err,db){
      if(err){
        throw err;
        // console.log("连接数据库出错");
      }else{
        console.log("删除连接成功");
        db.collection(set,function(err,collection){
          if(err){
            console.log("连接到数据集出错：181"+err)
          }
          else{         
           collection.remove(data,function(err,result){            
             if(err) console.log("Error delete:"+err)
             else {
               console.log("删除数据后的反馈信息")
               console.log(result)
              }
           })
          }
        })
        db.close();
      }
    });


    db.on("close",function(err,db){
      if(err){
        throw err;
        // console.log("连接数据库出错");
      }else{
        // console.log("关闭数据库连接：第四次到这")
      }
    })   
      mongodb.MongoClient.connect(that._pool,numberOfRetries=retryNum,function(err,db){ 
      db.close;
    })
  }
],
  function(err){         
      throw(err);
  })   
  }
MongoConnection.prototype.insert=function(set,data,callback){
    if (this._readonly) {
      return errNotAllowed(callback) 
    }       
    that=this 
    async.waterfall([
      function(next){ 
      var insertData = function(set, data) {        
          //连接到表 site              
          mongodb.MongoClient.connect(that._pool,numberOfRetries=retryNum, function(err, db) {
          console.log("插入连接成功！");               
          //插入数据
          var collection=db.collection(set)                           
          collection.insert(data, function(err, result) { 
              if(err)
              {
                 console.log('Error:'+ err);
                  return;
              }  
              else {
              console.log("插入数据情况：");
              console.log(result)
              }
          });                  
            db.close();   
          });       
            
      }   
      insertData(set,data);      
      }
  ],
  function(err){         
      throw(err);
  })
       
}

// const sqlx = require('..')
const retryNum=1
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
  info : __log,
}

local.buildSql = (p) => {
  const x = mongo_sql.sql(p)
  sql = x.toString().replace(/\$[0-9]+/g, '?').replace(/"/g, '`')
  return {
    text: sql,
    values: x.values
  }
}
//override  MysqlConnection  insert method
local.extendByConfig = (obj, config) => {
  Object.keys(config.extend).forEach(method_name => {
    obj[method_name] = config.extend[method_name]
  })
}

