(function(){
    var mainLoad = window.onload;
    window.onload = function(){
        if(mainLoad) mainLoad();

    }
})();
