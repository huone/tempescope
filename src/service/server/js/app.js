var express = require("express");
var path = require("path");
var app = express();

var data={count:0};

app.set("view engine", 'ejs');

app.get('/', function(req, res){
  data.count++;
  res.render('first', data);
});

app.get('/reset', function(req, res){
  data.count = 0;
  res.render('first', data);
});

app.get('/set/count', function(req, res){
  if(req.query.count) data.count = req.query.count;
  res.render('first', data);
});

app.get('/set/:num', function(req, res){
  data.count = req.params.num;
  res.render('first', data);
});

app.get('/test', function(req, res){
  res.send(data.count.toString());
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(3000, function(){
  console.log('Server On!');
});
