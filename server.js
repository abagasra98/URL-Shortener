var express = require('express');
var mongo = require('mongodb').MongoClient;
var validUrl = require('valid-url');
const path = require('path');

var app = express();
const url = process.env.MONGOLAB_URI;
//const url = 'mongodb://localhost:27017/test' // database name in url?
app.set('port', (process.env.PORT || 8080));

app.get('/', function(req, res) {
  app.use(express.static('views'));
  res.sendFile(path.join(__dirname + '/views/index.html'));
});

app.get('/:id', function(req, res) {
  var query = decodeURI(req.params.id);
  if (!isNaN(query)) {
    mongo.connect(url, function(err, db){
      if (err) throw err;
      var collection = db.collection('hashCodes');
      collection.find({_id: +query}).limit(1).count(true, function(err, count) {
          if (err) throw err;
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
  if (validUrl.isUri(query)) {
    var queryHash = query.hashCode();
    mongo.connect(url, function(err, db) {
      if (err) throw err;
      var collection = db.collection('hashCodes');
      collection.find({_id: queryHash}).limit(1).count(true, function(err, count) {
        if (err) throw err;
        if (count == 0) {
          var tempDoc = {_id: queryHash, url: query};
          collection.insert(tempDoc) // handle error and ensure insertion?
        }
        res.json({original_url: query, short_url: ('https://sleepy-harbor-10918.herokuapp.com/' + queryHash)});
        db.close();
      })
    })
  } else {
    res.json({error: "Wrong url format, make sure you have a valid protocol and real site."});
  }
})

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
