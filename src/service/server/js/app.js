var express = require("express");
var path = require("path");
var app = express();

app.set("view engine", 'ejs');

/* request format reference
var data={count:0};

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

app.use(express.static(path.join(__dirname, 'public')));

*/


var tempescope = {effect_code : "9901"};

var tempescope_effects = {
  "1101" : {
    name : "fine",
    act:"BA0CFFFFFF003CP00H00",
    next:"0000"
  },
  "1201" : {
    name : "cloudy",
    act:"B20C0000FF003CP00H01",
    next:"0000"
  },
  "1301" : {
    name : "rain",
    act:"B40CFF0000003CP01H01",
    next:"0000"
  },
  "9101" : {
    name : "demo",
    act:"CFFFFFF003CH01D02BCH00P01CFF00FF000FD0064C0000FF0F0FD0064CFFFF001E0FD0064C00FFFF2D0FP00D01F4CFFFFFF003CB10D0005B20D0005B30D0005B40D0005B50D0005B60D0005B70D0005B80D0005B90D0005BA0D0005B90D0005B80D0005B70D0005B60D0005B50D0005B40D0005B30D0005B20D0005R02",
    next:"0000"
  },
  "9901" : {
    name : "off",
    act:"B00P00H00",
    next:"0000"
  },
  "9911" : {
    name : "error",
    act:"B90CFF0000003CP00H00",
    next:"0000"
  }
};

app.get('/tempescope/set/effect', function(req, res){
  console.log(req.url);

  tempescope.effect_code = req.query.code;

  res.render('rsp_msg', {msg:"OK"});
});

app.get('/tempescope/effect', function(req, res){
  console.log(req.url);

  var code = req.query.code;
  if(code === undefined)
  {
    code = tempescope.effect_code;
  }

  var effect = tempescope_effects[code];
  if(effect === undefined)
  {
    code = "9911";
    effect = tempescope_effects[code];
  }

  res.render('rsp_effect',  {name:effect.name, code:code, act:effect.act, next:effect.next});
});

app.listen(3081, function(){
  console.log('Server On!');
});
