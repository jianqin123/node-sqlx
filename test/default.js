describe('default', function() {

it('basic', function(done) {
  const client = sqlx.createClient()
  client.define(['table1'], function1)
  client.define(['table2'], function2)
  client.define('table3'  , function3)
  client.define('table4'  , function5)
  client.define('*', functionX)

  var n_called = 0
  function function1() { n_called++ }
  function function2() { n_called++ }
  function function3() { n_called++ }
  function function4() { n_called++ }
  function function5() { n_called++ }
  function functionX() { n_called++ }

  var operator_info = {
    user: '101,23',
  }

  const conn = client.getConnection(operator_info)
  conn.insert('table1', function(){})
  conn.update('table1', function(){})
  assert.equal(n_called, 2)
  conn.update('tableX', function(){})
  conn.insert('tableX', function(){})
  assert.equal(n_called, 4)
  conn.release()
  done()
})


})

const sqlx = require('..')
const assert = require('assert')
const async = require('async')
