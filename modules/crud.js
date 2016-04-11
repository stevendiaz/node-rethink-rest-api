(function() {
  var r = require('rethinkdb'),
      connection;

  r.connect( {host: 'localhost', port: 28015}, function(err, conn) {
    if (err) throw err;
    connection = conn;
    r.db('api').tableCreate('objects').run(conn, function(err, res) {
      if (err){
        if(err.name === "RqlRuntimeError") {
            console.log("This table already exists. Table not created");
        }
        else if(err.name === "ReqlOpFailedError") {
            console.log("This table already exists. Table not created");
        }
        else {
            console.log(res);
            throw err;
        }
      }
    });
  });

  exports.findAll = function(req, res) {
    r.table('cruds').run(connection, function(err, cursor) {
        if (err) throw err;
        cursor.toArray(function(err, result) {
            if (err) throw err;
            res.send(JSON.stringify(result, null, 2));
        });
    });
  };

  exports.findById = function(req, res) {
    var id = req.params.id;
    r.table('cruds').get(id).
      run(connection, function(err, result) {
          if (err)
            throw err;
          res.send(JSON.stringify(result, null, 2));
      });
  };

  exports.create = function(req, res) {
    var presentation = req.body;
    console.log(JSON.stringify(req.body, null, 2));
    r.table('cruds').insert(presentation).
      run(connection, function(err, result) {
        if (err)
          throw err;
        console.log("created!");
        req.body.id = result.generated_keys[0];
        res.send(JSON.stringify(req.body, null, 2));
        //res.send(JSON.stringify({status: 'ok', location: '/api/objects/'+result.generated_keys[0]}));
      });
  };

  //HTTP POST
  exports.update = function(req, res) {
    var presentation = req.body,
        id = req.params.id;
    r.table('cruds').get(id).update(presentation).
      run(connection, function(err, result) {
        if (err)
          throw err;
        console.log("updated!");
        req.body.id = id;
        res.send(JSON.stringify(req.body, null, 2));
      });
  };

  exports.delete = function(req, res) {
    var id = req.params.id;
    r.table('cruds').get(id).delete().
      run(connection, function(err, result) {
          if (err) throw err;
          console.log("deleted!");
          res.send();
      });
  };
})();
