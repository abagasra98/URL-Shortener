// collection.insert(doc, function(err, data) {
//   if (err) throw err;
//   console.log("Successfully inserted document");
//   res.send("Hello World");
// });
//if (collection.find({_id: query}).count(true) > 0) {
//   var resDoc = collection.findOne({_id: query}, function(err, ));
//   if (resDoc) {
//     console.log("URL successfully located in the database");
//     res.redirect(resDoc.url);
//   }
// //}
//  else {
//    console.log("Unable to locate URL with ID " + query);
//    res.json({error: "This URL is not present in the databse"});
// }


// db.createCollection('urlCodes', function(err, collection) {
//   if (err) throw err;
//
//   if (collection.find({_id: query}).count(true) > 0) {
//     console.log("URL successfully located in the database");
//     return res.redirect('https://www.google.com');
//   } else {
//     console.log("Unable to locate URL with ID " + query);
//     return res.json({error: "This URL is not present in the databse"});
//   }
// })
