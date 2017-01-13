var express = require('express');
var json = require('express-json');
var path = require("path");
var app = express();

app.set("view engine", 'ejs');

app.use(json());

/*
app.use(function(req, res, next){
    var oldRender = res.render;
    res.render = function(){
        res.header('Content-Type', 'text/plain');
        oldRender.apply(this, arguments);
    };

    next();
});
*/

function LOG(o){
  console.log(o);
}

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

var tempescopes = {
  "20161201-0" : {effect_code : "1101", effect:tempescope_effects},
  "20161201-1" : {effect_code : "1101", effect:{}},
  "20161201-2" : {effect_code : "1101", effect:{}}
};

tempescopes.global = tempescopes["20161201-0"];
tempescopes.p001 = tempescopes["20161201-1"];
tempescopes.p002 = tempescopes["20161201-2"];

app.get('/tempescopes/:id/effects/:code', function(req, res){
  LOG(req.url);

  var id = req.params.id;
  var code = req.params.code;

  var effect;
  var tempescope = tempescopes[id];

  if(tempescope === undefined)
  {
    code = "9901";
    effect = tempescopes.global.effect[code];
  }
  else {
    effect = tempescope.effect[code];
    if(effect === undefined)
    {
      effect = tempescopes.global.effect[code];
      if(effect === undefined)
      {
        code = "9901";
        effect = tempescopes.global.effect[code];
      }
    }
  }

  res.setHeader('Content-Type', 'text/plain')
  res.render('rsp_effect', {name:effect.name, code:code, act:effect.act, next:effect.next});
});

app.get('/tempescopes/:id/effect', function(req, res){
  LOG(req.url);

  var id = req.params.id;
  var code;

  var effect;
  var tempescope = tempescopes[id];

  if(tempescope === undefined)
  {
    code = "9901";
    effect = tempescopes.global.effect[code];
  }
  else {
    code = tempescope.effect_code;
    effect = tempescope.effect[code];
    if(effect === undefined)
    {
      effect = tempescopes.global.effect[code];
      if(effect === undefined)
      {
        code = "9901";
        effect = tempescopes.global.effect[code];
      }
    }
  }

  res.setHeader('Content-Type', 'text/plain')
  res.render('rsp_effect', {name:effect.name, code:code, act:effect.act, next:effect.next});
});

app.get('/tempescope/effect', function(req, res){
  LOG(req.url);

  var code = tempescopes.global.effect_code;
  var effect = tempescopes.global.effect[code];
  if(effect === undefined)
  {
    code = "9901";
    effect = tempescopes.global.effect[code];
  }

  res.setHeader('Content-Type', 'text/plain')
  res.render('rsp_effect', {name:effect.name, code:code, act:effect.act, next:effect.next});
});

app.post('/tempescope/add/effect', function(req, res){
  LOG(req.url);

  var effect_code = req.body.code;
  var effect = tempescope_effects[effect_code];
  if(effect_code === undefined || effect !== undefined)
  {
    res.render('rsp_msg', {msg:"ERROR"});
    return;
  }

  var effect_name = req.body.name;
  if(effect_name === undefined)
  {
    effect_name = "User effect";
  }

  var effect_act = req.body.act;
  if(effect_act === undefined)
  {
    effect_act = "B90CFF0000003CP00H00";
  }

  var effect_next = req.body.next;
  if(effect_next === undefined)
  {
    effect_next = "0000";
  }

  tempescope_effects[code] = {name:effect_name, act:effect_act, next:effect_next};

  res.render('rsp_msg', {msg:"OK"});
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(3081, function(){
  console.log('Server On!');
});
