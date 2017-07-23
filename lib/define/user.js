/**
 * open database
 * @param host ip
 * @param port port
 * @param databaseName databasename
 *  */
function openDatabase(host, port, databaseName, collectionName) {
  var deferred = Q.defer();
  var server = new mongodb.Server(host, port, { auto_reconnect: true });
  var db = new mongodb.Db(databaseName, server, { safe: true });
  db.open(function (err, db) {
    if (err) {
      console.log('fail to open database');
      deferred.reject(err);
    }
    else {     
      console.log('success open database')
      deferred.resolve([db, collectionName]);
    }
  });
  return deferred.promise;
}
module.exports.openDatabase = openDatabase
/**
 * connct to set
 * @param db database
 * @param collectionName collection name
 */
function openCollection(db, collectionName) { 
  var deferred = Q.defer();
  db.collection(collectionName, { safe: true }, function (errcollection, collection) {
  if (!errcollection) {
    console.log('success to set');
    deferred.resolve(collection);
    } else {
    console.log('fail to set');
    deferred.reject(errcollection);
    }
  });
  return deferred.promise;
}
module.exports.openCollection = openCollection
/**
 * insert data
 * @param collection
 * @param tmp data to insert 
 */
function insertCollection(collection, tmp,callback) {     
  collection.insert(tmp, { safe: true }, function (err, result) {
    if (err) {
      console.log('fail to set' + tmp);           
    } else {
      callback(null,result,null)
    }
  });
}
module.exports.insertCollection = insertCollection
/**
 * select all data from set
 * @param collection
 */
function findCollectionNoCondition(collection) {  
  var deferred = Q.defer();
  collection.find().toArray(function (errfind, cols) {
    if (!errfind) {           
      deferred.resolve(JSON.stringify(cols));     
    } else {
      console.log('fail to query set');
      deferred.reject(errfind);            
    }
  });
  return deferred.promise;
}
module.exports.findCollectionNoCondition = findCollectionNoCondition
/**
 * select data satisfy condition
 * @param collection 
 */
function findCollectionHasCondition(collection, tmp) {
  collection.find(tmp).toArray(function (errfind, cols) {
    if (!errfind) {
      console.log('sucess query set');
      console.log(JSON.stringify(cols));      
    } else {
      console.log('fail to query set');     
    }
  });
}
module.exports.findCollectionHasCondition = findCollectionHasCondition
/**
 * delete data from set
 * @param collection collection
 * @param tmp data to be removed *
 */
function removeCollection(collection, tmp) {    
  collection.remove(tmp, { safe: true }, function (err, count) {
    if (err) {
      console.log('fail to delete set' + tmp);     
    } else {
      console.log('sucess to delete set' + count);     
    }
  });   
}
module.exports.removeCollection = removeCollection
var Q = require('q')
var mongodb = require("mongodb");
