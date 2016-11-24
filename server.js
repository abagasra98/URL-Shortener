var express = require('express');
var mongo = require('mongodb').MongoClient;
var validUrl = require('valid-url');
const path = require('path');

var app = express();
const url = 'mongodb://localhost:27017/test' // database name in url?
app.set('port', (process.env.PORT || 8080));

app.get('/', function(req, res) {
  app.use(express.static('views'));
  res.sendFile(path.join(__dirname + '/views/index.html'));
});

app.get('/:id', function(req, res) {
  //var query = decodeURI(req.path.substring(1));
  var query = decodeURI(req.params.id);
  console.log(query);
  if (!isNaN(query)) {
    mongo.connect(url, function(err, db){
      if (err) throw err;
      var collection = db.collection('urlCodes');
      collection.find({_id: +query}).limit(1).count(true, function(err, count) {
          if (err) throw err;
          console.log(count);
          if (count == 1) {
            collection.findOne({_id: +query}, function(error, doc) { res.redirect(doc.url); db.close(); })
          } else {
            res.json({error: "This URL is not present in the database"});
            db.close();
          }
      })
    })
  } else {
    res.json({error: "Invalid url entered, please make sure you have entered the correct url"});
  }
});

app.get('/shorten/*', function(req, res) {
  var query = decodeURI(req.path.substring(1));
  query = query.substring(query.indexOf('/')+1)
  if (validUrl.isUri(query)) { // store and retrieve using hashes, instead of ID?
    var queryHash = query.hashCode();
    mongo.connect(url, function(err, db) {
      if (err) throw err;
      var collection = db.collection('urlCodes');
      collection.find({_id: queryHash}).limit(1).count(true, function(err, count) {
        if (err) throw err;
        console.log(count);
        if (count == 0) {
          var tempDoc = {_id: queryHash, url: query};
          console.log("Entering url into database")
          collection.insert(tempDoc, function(err, data) {
            if (err) throw err;
            console.log("Successfully inserted document into database");
          }) // handle error and ensure insertion?
        }
        res.json({original_url: query, short_url: generateShortUrl(queryHash)});
        db.close();
      })
    })
  } else {
    res.json({error: "Wrong url format, make sure you have a valid protocol and real site."});
  }
})

function generateShortUrl(hashCode) {
  return 'localhost:' + app.get('port') + '/' + hashCode
}

function dbContains(key, callback) {
  mongo.connect(url, function(err, db){
    if (err) throw err;
    var collection = db.collection('urlCodes');
    collection.find({_id: key}).limit(1).count(true, function(err, count) {
      if (err) callback(err, null);
      if (count == 1) {
        db.close();
        return callback(null, true);
      } else {
        db.close();
        return callback(null, false);
      }
    });
  });
}

// collection.find({_id: query}).toArray(function(err, docs) {
//   if (err) throw err;
//   if (docs.length > 0) {
//     console.log("URL successfully located in the database");
//     return res.redirect('https://www.google.com');
//   } else {
//     console.log("Unable to locate URL with ID " + query);
//     return res.json({error: "This URL is not present in the databse"});
//   }
//   db.close();
// })

//var collection = db.collection('urlCodes');
// if (collection.find({_id: query}).limit(1).size() == 1) {
//   console.log("URL successfully located in the database");
//   res.redirect('https://www.google.com');
// } else {
//   console.log("Unable to locate URL with ID " + query);
//   res.json({error: "This URL is not present in the databse"});
// }
// db.close();

// mongo.connect('mongodb://localhost:27017/learnyoumongo', function(err, db) {
//   if (err)
//     throw err;
//   var collection = db.collection('parrots');
//   collection.find({
//     age: {$gt: parseInt(process.argv[2]) }
//   }).toArray(function(err, documents) {
//     if (err) throw err;
//     console.log(documents);
//     db.close();
//   });
// });

app.listen(app.get('port'), function() {
  console.log("URL Shortener app listening on port " + app.get('port'));
})

String.prototype.hashCode = function(){
	var hash = 0;
	if (this.length == 0) return hash;
	for (i = 0; i < this.length; i++) {
		char = this.charCodeAt(i);
		hash = ((hash<<5)-hash)+char;
		hash = hash & hash; // Convert to 32bit integer
	}
	return hash;
}
