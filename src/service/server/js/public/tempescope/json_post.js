jQuery.fn.jsonObject = function(){
  var jsonObj = {};
  try {
    if(this[0].tagName && this[0].tagName.toUpperCase() == "FORM"){
      var arr = this.serializeArray();
      if(arr){
        jQuery.each(arr, function(){
          jsonObj[this.name] = this.value;
        });
      }
    }
  } catch(e){
    alert(e.message);
  }

  return jsonObj;
}

jQuery.fn.jsonPost = function(url){
  return $.ajax({
    type: "post",
    url: url,
    dataType: "json",
    contentType: "application/json; charset=UTF-8",
    data: JSON.stringify(this.jsonObject())
  });
};

jQuery.fn.jsonGet = function(url, data){
  return $.ajax({
    url: url,
    dataType: "json",
    contentType: "application/json; charset=UTF-8",
    data: JSON.stringify(data)
  });
};
