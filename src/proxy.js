var express = require('express');
var request = require('request');

var app = express();
app.use('/', function(req, res) {
  console.log(req.url)
  req.pipe(request(req.url.substr(1))).pipe(res);
});

app.listen(process.env.PORT || 3333);
