var express = require('express');
var bodyParser = require('body-parser');
var json = require('express-json');
var path = require("path");
var http = require("http");
var xmlParser = require('xml-parser');

var app = express();
app.use(bodyParser.json());
app.use(json());
app.set("view engine", "ejs");

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
  "1000" : {
    name : "KMS RSS",
    act:"",
    next:"0000"
  },
  "1001" : {
    name : "init",
    act:"W012C BA0 P01 H01 D0030 CFF000000FF D0010 CFFA50000FF D0010 CFFFF0000FF D0010 C00800000FF D0010 C0000FF00FF D0010 C4B008200FF D0010 CEE82EE00FF D0010",
    next:"0000"
  },
  "1101" : {
    name : "fine",
    act:"BA0CFFFFFF003CP00H00D0060",
    next:"0000"
  },
  "1201" : {
    name : "cloudy",
    act:"B20C0000FF003CP00H01D0060",
    next:"0000"
  },
  "1301" : {
    name : "rain",
    act:"B40CFF0000003CP01H00D0060",
    next:"0000"
  },
  "1302" : {
    name : "rain-anim",
    act:"B40CFF0000003CP01H01D0060",
    next:"1303"
  },
  "1303" : {
    name : "rain-anim-2",
    act:"H00 B10 CFFFFFF003C B10D0001 B50D0005 BC0D0003 B50D0002 BA0D0001 B30D0002 R05",
    next:"1304"
  },
  "1304" : {
    name : "rain-anim-3",
    act:"B40CFF0000003CP01H01D0060",
    next:"1305"
  },
  "1305" : {
    name : "rain-anim-4",
    act:"P00 B10 CFFFFFF003C D0003 BC0D0003 B50D0002 BA0D0001 B30D0002 R03",
    next:"1306"
  },
  "1306" : {
    name : "rain-anim-5",
      act:"B40CFF0000003CP01H01D0060",
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
  "9902" : {
    name : "full_load",
    act:"BFFCFFFFFF003CP01H01",
    next:"0000"
  },
  "9903" : {
    name : "medium_load",
    act:"B7FCFFFFFF003CP01H01",
    next:"0000"
  },
  "9904" : {
    name : "light_load",
    act:"B3FCFFFFFF003CP01H01",
    next:"0000"
  },
  "9905" : {
    name : "pump_off",
    act:"P00",
    next:"0000"
  },
  "9906" : {
    name : "pump_on",
    act:"P01",
    next:"0000"
  },
  "9907" : {
    name : "humi_off",
    act:"H00",
    next:"0000"
  },
  "9908" : {
    name : "humi_on",
    act:"H01",
    next:"0000"
  },
  "9909" : {
    name : "led_off",
    act:"B00",
    next:"0000"
  },
  "9910" : {
    name : "led_low",
    act:"B11",
    next:"0000"
  },
  "9911" : {
    name : "led_middle",
    act:"B80",
    next:"0000"
  },
  "9912" : {
    name : "led_high",
    act:"BEE",
    next:"0000"
  },
  "9913" : {
    name : "led_red",
    act:"CFF000000FF",
    next:"0000"
  },
  "9914" : {
    name : "led_orange",
    act:"CFFA50000FF",
    next:"0000"
  },
  "9915" : {
    name : "led_yellow",
    act:"CFFFF0000FF",
    next:"0000"
  },
  "9916" : {
    name : "led_green",
    act:"C00800000FF",
    next:"0000"
  },
  "9917" : {
    name : "led_blue",
    act:"C0000FF00FF",
    next:"0000"
  },
  "9918" : {
    name : "led_indigo",
    act:"C4B008200FF",
    next:"0000"
  },
  "9919" : {
    name : "led_violet",
    act:"CEE82EE00FF",
    next:"0000"
  },
  "9920" : {
    name : "led_rainbow",
    act:"CFF00000001 CFFA5000101 CFFFF000201 C0080000301 C0000FF0401 C4B00820501 CEE82EE0601 CFF00000701 CFFA5000801 CFFFF000901 C0080000A01 C0000FF0B01 C4B00820C01 CEE82EE0D01 CFF00000E01 CFFA5000F01 CFFFF001001 C0080001101 C0000FF1201 C4B00821301 CEE82EE1401 CFF00001501 CFFA5001601 CFFFF001701 C0080001801 C0000FF1901 C4B00821A01 CEE82EE1B01 CFF00001C01 CFFA5001D01 CFFFF001E01 C0080001F01 C0000FF2001 C4B00822101 CEE82EE2201 CFF00002301 CFFA5002401 CFFFF002501 C0080002601 C0000FF2701",
    next:"0000"
  },
  "9951" : {
    name : "set_waiting_3s",
    act:"W012C",
    next:"0000"
  },
  "9952" : {
    name : "set_waiting_5s",
    act:"W01F4",
    next:"0000"
  },
  "9953" : {
    name : "set_waiting_10s",
    act:"W03E8",
    next:"0000"
  },
  "9999" : {
    name : "error",
    act:"B90CFF0000003CP00H00",
    next:"0000"
  }
};

var tempescope_list = {
  "global" : {effect_code : "1000", effect_list:effect_list}
};

var kmaRssReqOptions = {
  host : "www.kma.go.kr",
  port : 80,
  path : "/wid/queryDFSRSS.jsp?zone=2723067100"
};

function findElement(element, tagName){
  var foundElement;
  element.children.forEach(function(value, index, array1){
    if(value.name === tagName){
      foundElement = value;
      return false;
    }
  });

  return foundElement;
}

function setWeatherFromKma(){
  http.get(kmaRssReqOptions, function(res){
    var serverData = "";
    res.on("data", function(chunk){
      serverData += chunk;
    });

    res.on("end", function(){
      var kmaRss = xmlParser(serverData);

      var tagHierarchy = ["channel", "item", "description", "body", "data", "wfEn"];
      var element = kmaRss.root;

      tagHierarchy.forEach(function(value, index, array1){
        element = findElement(element, value);
        if( element === undefined){
          return false;
        }
      });

      if( element === undefined){
        LOG("KMA RSS Error");
      }

      LOG("KMA RSS : " + element.content);

      var effect_code = "9999";
      switch(element.content){
        case "Clear":
          effect_code = "1101";
          break;
        case "Partly Cloudy":
        case "Mostly Cloudy":
        case "Cloudy":
          effect_code = "1201";
          break;
        case "Rain":
        case "Snow/Rain":
        case "Snow":
          effect_code = "1301";
          break;
      }

      if(effect_list[effect_code] !== undefined){
        effect_list["1000"].act = effect_list[effect_code].act;
      }
    });
  });
}

setWeatherFromKma();
setInterval(setWeatherFromKma, 3600000);

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
    if(code === "1001"){
      tempescope = {effect_code : "1000", effect_list:{}};
      tempescope_list[id] = tempescope;
    } else {
      tempescope = tempescope_list.global;
    }
  }

  effect = tempescope.effect_list[code];
  if(effect === undefined){
    effect = tempescope_list.global.effect_list[code];
    if(effect === undefined){
      code = "9999";
      effect = tempescope_list.global.effect_list[code];
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
    res.json({result:"ERROR", message:id + " is wrong"});
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

  if(tempescope !== tempescope_list.global){
    effect = tempescope_list.global.effect_list[code];
    if(effect !== undefined){
      res.json({result:"ERROR", message:code + " is duplicated"});
      return;
    }
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

app.delete('/tempescope/effects/:code', function(req, res){
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

app.delete('/tempescopes/:id/effects/:code', function(req, res){
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
