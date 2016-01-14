(function(){
  var mainLoad = window.onload;
  window.onload = function(){
    if(mainLoad) mainLoad();
    
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

})();
