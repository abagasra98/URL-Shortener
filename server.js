var express = require('express');
var mongo = require('mongodb').MongoClient;
var validUrl = require('valid-url');
const path = require('path');

var app = express();
app.set('port', (process.env.PORT || 8080));

app.get('/', function(req, res) {
  app.use(express.static('views'));
  res.sendFile(path.join(__dirname + '/views/index.html'));
});

app.get('/*', function(req, res) {
  var query = decodeURI(req.path.substring(1));
  if (!isNaN(query)) {
    mongo.connect('mongodb://localhost:27017/test', function(err, db){
      if (err) throw err;
      var collection = db.collection('urlCodes');
      collection.find({_id: query}).limit(1).count(true, function(err, count) {
          if (err) throw err;
          if (count == 1) {
            collection.findOne({_id: query}, function(error, document) {
              if (error) throw error;
              res.redirect(document.url);
              db.close();
            })
          } else {
            res.json({error: "This URL is not present in the databse"});
            db.close();
          }
      })

      // , function(err, cursor) {
      //   if (cursor.count(true) == 1)
      //     res.redirect(cursor.toArray()[0].url);
      //   else
      //     res.json({error: "This URL is not present in the databse"});
      // })
      // .count(true, function(err, count) {
      //   if (err) throw err;
      //   if (count == 1) {
      //     collection.findOne({_id: query}, function(err, doc) { res.redirect(doc.url); })
      //   } else {
      //     res.json({error: "This URL is not present in the databse"});
      //   }
      // });
      // console.log(cursor.count(true));
      // if (cursor.count(true) == 1) {
      //   res.send("Success");
      // } else {
      //   res.send("Failure");
      // }
      // collection.find({_id: query}).toArray(function(err, docs) {
      //   if (err) throw err;
      //   if (docs.length > 0) {
      //     console.log("URL successfully located in the database");
      //     res.redirect(docs[0].url);
      //   } else {
      //     console.log("Unable to locate URL with ID " + query);
      //     res.json({error: "This URL is not present in the databse"});
      //   }
      // });
    })
  } else {
    res.json({error: "Invalid url entered, please make sure you have entered the correct url"});
  }
});

app.get('/shorten/*', function(req, res) {
  var query = decodeURI(req.path.substring(1));
  query = query.substring(query.indexOf('/')+1)
  if (validUrl.isUri(query)) {

  } else {
    res.json({error: "Wrong url format, make sure you have a valid protocol and real site."});
  }
})

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
