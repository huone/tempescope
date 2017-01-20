var express = require('express');
var bodyParser = require('body-parser');
var json = require('express-json');
var path = require("path");

var app = express();
app.use(bodyParser.json());
app.use(json());
app.set("view engine", 'ejs');

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

function toACT(act)
{
  return act.toUpperCase().replace(/\s/g,"").replace(/,/g,"");
}

var effect_list = {
  "1101" : {
    name : "fine",
    act:"BA0CFFFFFF003CP00H00",
    next:"1201"
  },
  "1201" : {
    name : "cloudy",
    act:"B20C0000FF003CP00H01",
    next:"1301"
  },
  "1301" : {
    name : "rain",
    act:"B40CFF0000003CP01H01",
    next:"1302"
  },
  "1302" : {
    name : "rain-2",
    act:"B10 CFFFFFF003C B10D0001 B50D0005 BC0D0003 B50D0002 BA0D0001 B30D0002 R05",
    next:"1303"
  },
  "1303" : {
    name : "rain-3",
    act:"B40CFF0000003CP01H01",
    next:"1304"
  },
  "1304" : {
    name : "rain-4",
    act:"B10 CFFFFFF003C D0003 BC0D0003 B50D0002 BA0D0001 B30D0002 R03",
    next:"1305"
  },
  "1305" : {
    name : "rain-5",
      act:"B40CFF0000003CP01H01",
    next:"9101"
  },
  "9101" : {
    name : "demo",
    act:"CFFFFFF003CH01D02BCH00P01CFF00FF000FD0064C0000FF0F0FD0064CFFFF001E0FD0064C00FFFF2D0FP00D01F4CFFFFFF003CB10D0005B20D0005B30D0005B40D0005B50D0005B60D0005B70D0005B80D0005B90D0005BA0D0005B90D0005B80D0005B70D0005B60D0005B50D0005B40D0005B30D0005B20D0005R02",
    next:"9901"
  },
  "9901" : {
    name : "off",
    act:"B00P00H00",
    next:"0000"
  },
  "9902" : {
    name : "full_load",
    act:"BFFCFFFFFF003CP01H00",
    next:"0000"
  },
  "9903" : {
    name : "pump_on",
    act:"P01",
    next:"0000"
  },
  "9999" : {
    name : "error",
    act:"B90CFF0000003CP00H00",
    next:"0000"
  }
};

var tempescope_list = {
  "00000000-0" : {effect_code : "1101", effect_list:effect_list},
  "20161201-1" : {effect_code : "1101", effect_list:{}},
  "20161201-2" : {effect_code : "1101", effect_list:{}}
};

tempescope_list.global = tempescope_list["00000000-0"];
tempescope_list.p001 = tempescope_list["20161201-1"];
tempescope_list.p002 = tempescope_list["20161201-2"];

app.get('/tempescope', function(req, res){
  LOG(req.url);

  res.redirect('../index.html');
});

app.get('/tempescope/list', function(req, res){
  LOG(req.url);

  //res.setHeader('Content-Type', 'text/plain');
  //res.render('rsp_result', {result:"OK, message:"list is ok"});

  res.json(tempescope_list);
});

app.get('/tempescope/effect/list', function(req, res){
  LOG(req.url);

  res.json(effect_list);
});

app.get('/tempescopes/:id/effect/list', function(req, res){
  LOG(req.url);

  var id = req.params.id;
  var tempescope = tempescope_list[id];

  if(tempescope !== undefined){
    res.json(tempescope.effect_list);
  } else {
    res.json({result:"ERROR", message : id + " is wrong"});
  }
});

app.get('/tempescope/effect', function(req, res){
  LOG(req.url);

  var code = tempescope_list.global.effect_code;
  var effect = tempescope_list.global.effect_list[code];

  if(effect === undefined){
    code = "9999";
    effect = tempescope_list.global.effect_list[code];
  }

  res.json({name:effect.name, code:code, act:toACT(effect.act), next:effect.next});
});

app.get('/tempescope/effects/:code', function(req, res){
  LOG(req.url);

  var code = req.params.code;
  var effect = tempescope_list.global.effect_list[code];

  if(effect === undefined){
    code = "9999";
    effect = tempescope_list.global.effect_list[code];
  }

  res.json({name:effect.name, code:code, act:toACT(effect.act), next:effect.next});
});

app.get('/tempescopes/:id/effect', function(req, res){
  LOG(req.url);

  var id = req.params.id;
  var code;

  var effect;
  var tempescope = tempescope_list[id];

  if(tempescope === undefined){
    code = "9999";
    effect = tempescope_list.global.effect_list[code];
  } else {
    code = tempescope.effect_code;
    effect = tempescope.effect_list[code];
    if(effect === undefined){
      effect = tempescope_list.global.effect_list[code];
      if(effect === undefined){
        code = "9999";
        effect = tempescope_list.global.effect_list[code];
      }
    }
  }

  res.json({name:effect.name, code:code, act:toACT(effect.act), next:effect.next});
});

app.get('/tempescopes/:id/effects/:code', function(req, res){
  LOG(req.url);

  var id = req.params.id;
  var code = req.params.code;

  var effect;
  var tempescope = tempescope_list[id];

  if(tempescope === undefined){
    code = "9999";
    effect = tempescope_list.global.effect_list[code];
  } else {
    effect = tempescope.effect_list[code];
    if(effect === undefined){
      effect = tempescope_list.global.effect_list[code];
      if(effect === undefined){
        code = "9999";
        effect = tempescope_list.global.effect_list[code];
      }
    }
  }

  res.json({name:effect.name, code:code, act:toACT(effect.act), next:effect.next});
});

app.get('/tempescope/effect/:code/set', function(req, res){
  LOG(req.url);

  var code = req.params.code;

  tempescope_list.global.effect_code = code;
  res.json({result:"OK", message:"global effect is " + code});
});

app.get('/tempescopes/:id/effect/:code/set', function(req, res){
  LOG(req.url);

  var result;
  var id = req.params.id;
  var code = req.params.code;
  var tempescope = tempescope_list[id];

  if(tempescope !== undefined){
    tempescope_list[id].effect_code = code;
    result = {result:"OK", message: id + " effect is " + code};
  } else {
    result = {result:"ERROR", message: id + " is wrong"};
  }

  res.json(result);
});

app.post('/tempescope/effect/add', function(req, res){
  LOG(req.url);
  LOG(req.body);

  var id = req.body.id;
  if(id === undefined){
    res.json({result:"ERROR", message:"ID is undefined"});
    return;
  }

  var tempescope = tempescope_list[id];
  if(tempescope === undefined){
    res.json({result:"ERROR", message:id + "is wrong"});
    return;
  }

  var code = req.body.code;
  if(code === undefined){
    res.json({result:"ERROR", message:"Code is undefined"});
    return;
  }

  var effect = tempescope.effect_list[code];
  if(effect !== undefined){
    res.json({result:"ERROR", message:code + " is duplicated"});
    return;
  }

  var effect_name = req.body.name;
  if(effect_name === undefined){
    effect_name = "User effect";
  }

  var effect_act = req.body.act;
  if(effect_act === undefined){
    effect_act = "B90CFF0000003CP00H00";
  }

  var effect_next = req.body.next;
  if(effect_next === undefined){
    effect_next = "0000";
  }

  tempescope.effect_list[code] = {name:effect_name, act:effect_act, next:effect_next};

  res.json({result:"OK", message:code + " is added"});
});

app.post('/tempescope/effect/update', function(req, res){
  LOG(req.url);
  LOG(req.body);

  var id = req.body.id;
  if(id === undefined){
    res.json({result:"ERROR", message:"ID is undefined"});
    return;
  }

  var tempescope = tempescope_list[id];
  if(tempescope === undefined){
    res.json({result:"ERROR", message:id + " is wrong"});
    return;
  }

  var code = req.body.code;
  if(code === undefined){
    res.json({result:"ERROR", message:"Code is undefined"});
    return;
  }

  var effect = tempescope.effect_list[code];
  if(effect === undefined){
    res.json({result:"ERROR", message:code + " is wrong"});
    return;
  }

  var key = req.body.key;
  if(key === undefined){
    res.json({result:"ERROR", message:"Key is undefined"});
    return;
  }

  var oldValue = effect[key];
  if(oldValue === undefined){
    res.json({result:"ERROR", message:key + " is wrong"});
    return;
  }

  var value = req.body.value;
  if(value === undefined){
    res.json({result:"ERROR", message:"Value is undefined"});
    return;
  }

  effect[key] = value;

  res.json({result:"OK", message:key + " is updated in " + code + " of " + id});
});

app.get('/tempescope/effects/:code/delete', function(req, res){
  LOG(req.url);

  var id = req.params.id;
  var code = req.params.code;

  var effect = tempescope_list.global.effect_list[code];
  if(effect === undefined){
    res.json({result:"ERROR", message: code + " is wrong"});
    return;
  }

  delete tempescope_list.global.effect_list[code];
  res.json({result:"OK", message: code + " is deleted in global"});
});

app.get('/tempescopes/:id/effects/:code/delete', function(req, res){
  LOG(req.url);

  var id = req.params.id;
  var code = req.params.code;

  var tempescope = tempescope_list[id];
  if(tempescope === undefined){
    res.json({result:"ERROR", message: id + " is wrong"});
    return;
  }

  var effect = tempescope.effect_list[code];
  if(effect === undefined){
    res.json({result:"ERROR", message: code + " is wrong"});
    return;
  }

  delete tempescope.effect_list[code];
  res.json({result:"OK", message: code + " is deleted in " + id});
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(3081, function(){
  console.log('Server On!');
});
