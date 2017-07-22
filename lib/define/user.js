/**
 * open database
 * @param host ip
 * @param port port
 * @param databaseName
 * @return  return -1 where fail 
 */
function openDatabase(host, port, databaseName, collectionName, callback) {
    console.log("come here for open database")
    var deferred = Q.defer();
    var server = new mongodb.Server(host, port, { auto_reconnect: true });
    var db = new mongodb.Db(databaseName, server, { safe: true });
    db.open(function (err, db) {
        if (err) {
            console.log('fail to open database');
            deferred.reject(err);
        }
        else {
            console.log('success to open database');
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
 * @return return -1 when fail
 */
function openCollection(db, collectionName) {
    console.log(" open collection")
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
 * @return return -1 when fail ,else return collection
 */
function insertCollection(collection, tmp,callback) {     
    collection.insert(tmp, { safe: true }, function (err, result) {
        if (err) {
            console.log('fail to set' + tmp);
            // return -1;
            callback(null,null,null)
        } else {            
            // return "sucess insert into set"
            callback(null,result,null)
        }
    });
   }
module.exports.insertCollection = insertCollection
/**
 * select all data from set
 * @param collection
 * @return return -1 when fail ,otherwise return all data
 */
function findCollectionNoCondition(collection) {
    console.log("come here for open collection")
    var deferred = Q.defer();
    collection.find().toArray(function (errfind, cols) {
        if (!errfind) {
            // console.log('success query set' + JSON.stringify(cols));
            deferred.resolve(JSON.stringify(cols));
            return(JSON.stringify(cols))
        } else {
            console.log('fail to query set');
            deferred.reject(errfind);
            // return -1;
        }
    });

    return deferred.promise;
}
module.exports.findCollectionNoCondition = findCollectionNoCondition
/**
 * select data satisfy condition
 * @param collection
 * @return retunr -1 when fail.otherwise return data satifyed
 */
function findCollectionHasCondition(collection, tmp) {
    collection.find(tmp).toArray(function (errfind, cols) {
        if (!errfind) {
            // console.log('sucess query set' + JSON.stringify(cols));
            return JSON.stringify(cols);
        } else {
            console.log('fail to query set');
            return -1;
        }
    });
}
module.exports.findCollectionHasCondition = findCollectionHasCondition
/**
 * delete data from set
 * @param collection
 * @param tmp
 * @return return -1 when fail ,otherwise return "remove success"
 */
function removeCollection(collection, tmp) {
    // var deferred = Q.defer();
    collection.remove(tmp, { safe: true }, function (err, count) {
        if (err) {
            console.log('fail to delete set' + tmp);
            return -1;
        } else {
            console.log('sucess to delete set' + count);
            return "remove sucess";
        }
    });
    //  return deferred.promise;
}
module.exports.removeCollection = removeCollection
var Q = require('q')
var mongodb = require("mongodb");
