(function(t){
  if(!t){
    window.A = t;
  }else{
    window[t] = t;
  }
  var t = {

  };

  var mainLoad = window.onload;
  window.onload = function(){
    if(mainLoad) mainLoad();
    console.log("main");
    for(var i=0; i<1; ++i){
      var test='test';
      console.log("for1");
    }
    console.log(test);
    console.log(i);
    for(var i=0; i<1; ++i){
      console.log("for2");
    }

    var img = new Image();
    img.id = "img1";
    img.src = "images/2.png";
    document.body.appendChild(img);
    var addWidth = 0;
    var m = 0;
    var interval = setInterval(function(){
      img.width = (++addWidth) % 50 * (10 - (++m) % 10);
      //if(addWidth > 10000) clearInterval(interval);

    }, 50);
  }

})('A');
