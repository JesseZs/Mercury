//http request

var MAX_RETRY_REQUEST = 2;
var MAX_SERVICE_COUNT = 8;

try {
  if (typeof XMLHttpRequest.prototype.sendAsBinary == 'undefined') {
    XMLHttpRequest.prototype.sendAsBinary = function(text){
      var data = new ArrayBuffer(text.length);
      var ui8a = new Uint8Array(data, 0);
      for (var i = 0; i < text.length; i++) ui8a[i] = (text.charCodeAt(i) & 0xff);
      this.send(ui8a);
    }
  }
} catch (e) {}

function HttpService()
{
  this.xmlHttpRequest = null;
  this.responseFun = null;
  this.changeStateFun = null;
  this.userData = null;
  this.id = -1;
  this.state = -1;
  this.retryCount = 0;
  this.server = null;
  this.recycleFun = null;
  this.GetHttpRequest();
  if(!this.xmlHttpRequest)
  {
    throw "no service"
  }
  this.notificationCallbacks = null;
}

HttpService.prototype = {
  Init : function(_server){
    if(this.state == -1)
    {
      if(_server) this.server = _server;
      if(!this.server){
        throw "unrecognized server";
      }
    }
  },

  Notification : function(){
    if(this.notificationCallbacks == null)
    {
      this.notificationCallbacks = new RequestNotification();
    }
    return this.notificationCallbacks;
  },
  GetHttpRequest : function(){
    /*if(!this.xmlHttpRequest){
      if(window && window.ActiveXObject)
        this.xmlHttpRequest = new ActiveXObject("Microsoft.XMLHTTP");
      else
        this.xmlHttpRequest = new XMLHttpRequest();
    }*/
    this.xmlHttpRequest = (function () {
      var xhrList = [function () {
        return new XMLHttpRequest();
      }, function () {
        return new ActiveXObject('Microsoft.XMLHTTP');
      }, function () {
        return new ActiveXObject('MsXML2.XMLHTTP');
      }, function () {
        return new ActiveXObject('MsXML3.XMLHTTP');
      }], xhr = null;
      while (xhr = xhrList.shift()) {
        try {
          xhr();
          break;
        } catch (e) {
          xhr = null;
          continue;
        }
      }
      if (xhr === null) {
        throw new Error('no ajax support');
      } else {
        return xhr();
      }
    })();
    //register events
    this.xmlHttpRequest.onreadystatechange = this.statechange.bind(this);
    this.xmlHttpRequest.ontimeout = this.onTimeout.bind(this);
    //if('timeout' in this.xmlHttpRequest)this.xmlHttpRequest.timeout = 10000;
    var that = this;
    $(this.xmlHttpRequest).on('loadedmetadata', function () {
      that.xmlHttpRequest.timeout = 10000;
    });
    //this.xmlHttpRequest.addEventListener("error", this.onError.bind(this) );
    //this.xmlHttpRequest.addEventListener("abort", this.onAbort.bind(this) );
    //this.xmlHttpRequest.addEventListener("load", this.onLoad.bind(this) );

    return this.xmlHttpRequest;
  },

  RegisterRecycle : function(_recycleFun)
  {
    this.recycleFun = _recycleFun;
  },

  SendRequest : function(fun, ud)
  {
    this.responseFun = fun;
    this.userData = ud;

    var request = this.xmlHttpRequest;
    var requestUrl = this.server.getUrl();
    var requestParam = this.server.getParam();
    var requestBody = this.server.getBody();
    var requestFiles = this.server.getFiles();
    var requestType = this.server.type;

    if(requestFiles.length > 0)
    {
      requestType = 3;
    }

    //console.log("HttpService::SendRequest---requestType["+this.server.requestType+"]");

    /* the AJAX request... */
    if (requestType === 0)//0 get
    {
      var paramArray = [];
      for(var k in requestParam)
      {
        paramArray.push(k+"="+requestParam[k]);
      }
      /* method is GET */
      requestUrl += paramArray.length > 0 ? "?" + paramArray.join("&") : "";
      request.open("GET", requestUrl, true);
      request.send();
    }
    else
    {
      /* method is POST */
      if(requestType === 1)
      {
        var paramArray = [];
        for(var k in requestParam)
        {
          paramArray.push(k+"="+requestParam[k]);
        }
        request.open("POST", requestUrl, true);
        /* enctype is application/x-www-form-urlencoded*/
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.send(paramArray.join("&"));
      }
      else if(requestType === 2)
      {
        var paramArray = [];
        for(var k in requestParam)
        {
          paramArray.push(k+"="+requestParam[k]);
        }
        request.open("POST", requestUrl, true);
        /* enctype is text/plain */
        request.setRequestHeader("Content-Type", "text/plain");
        request.send(paramArray.join("\r\n"));
      }
      else if(requestType === 3)
      {
        var paramArray = [];
        for(var k in requestParam)
        {
          paramArray.push('Content-Disposition: form-data; name="'+k+'"\r\nContent-Type: text/plain\r\nContent-Transfer-Encoding: 8bit\r\n\r\n'+requestParam[k]);
        }
        for(var k in requestFiles)
        {
          paramArray.push('Content-Disposition: form-data; name="'+requestFiles[k].key+'"; filename="'+unescape(encodeURIComponent(requestFiles[k].name))+'"\r\nContent-Type: application/octet-stream\r\nContent-Transfer-Encoding: binary\r\n\r\n'+requestFiles[k]);
        }
        /* enctype is multipart/form-data */
        request.open("POST", requestUrl, true);
        var sBoundary = "---------------------------" + Date.now().toString(16);
        request.setRequestHeader("Content-Type", "multipart\/form-data; boundary=" + sBoundary);
        var binaryData = "--" + sBoundary + "\r\n" + paramArray.join("\r\n--" + sBoundary + "\r\n") + "\r\n--" + sBoundary + "--\r\n";
        //console.log(binaryData);

        request.sendAsBinary(binaryData);
      }
      else if(requestType === 4)
      {
        var paramArray = [];
        for(var k in requestParam)
        {
          paramArray.push(k+"="+requestParam[k]);
        }
        requestUrl += paramArray.length > 0 ? "?" + paramArray.join("&") : "";
        request.open("POST", requestUrl, true);
        request.setRequestHeader("Content-Type", "application/json");
        request.send(JSON.stringify(requestBody));
      }
      else
      {
        throw 'http Service request error, undefined request type[requestType='+requestType+']';
      }
    }
  },

  retryRequest : function()
  {
    if(++this.retryCount > MAX_RETRY_REQUEST)
    {
      //console.log('service multy request failed['+this.server.getRequestUrl()+']');
      this._final();
      return;
    }
    //console.log('service retry['+this.retryCount+'] request ['+this.server.getRequestUrl()+']');
    //this.GetHttpRequest(true);
    this.SendRequest(this.responseFun,this.userData);
    //console.log( ''+this.xmlHttpRequest.readyState+' : '+this.xmlHttpRequest.status+' : '+this.xmlHttpRequest.statusText);
  },

  statechange : function(){
    //console.log( 'HttpService service id='+this.id+', state: '+this.xmlHttpRequest.readyState+' : '+this.xmlHttpRequest.status+' : '+this.xmlHttpRequest.statusText);
    this.changeState(this.xmlHttpRequest.readyState);
    if(this.xmlHttpRequest.readyState == 4) {
      if (this.xmlHttpRequest.status == 200) {
        //console.log("============="+this.xmlHttpRequest.responseText);
        var response = this.xmlHttpRequest.responseText;
        if (this.responseFun) this.responseFun(response, this.userData);
        this.xmlHttpRequest.abort();
      }
      else{
        if(this.responseFun) this.responseFun(null, this.userData);
      }
      this._final();
    }
  },

  changeState : function(_state){
    //console.log("change state["+this.state+" to "+_state+"]");
    this.state = _state;
    if(this.changeStateFun) this.changeStateFun(_state);
  },

  onTimeout: function() {
    if(this.responseFun) this.responseFun(null,this.userData);
    this._final();
  },

  onLoad: function(event) {
    var response = "";
    if (this.xmlHttpRequest.status == 200) {
      response = this.xmlHttpRequest.responseText;
    }
    if(this.responseFun) this.responseFun(response,this.userData);
    this._final();
  },

  onAbort: function(event) {
    //console.log("HttpService abort------------------");
    if(this.responseFun) this.responseFun(null, this.userData);
  },

  onError: function(event) {
    //console.log( 'HttpService error['+this.xmlHttpRequest.readyState+' : '+this.xmlHttpRequest.status+' : '+this.xmlHttpRequest.statusText+']'+event.loaded+'/'+event.total);
    if ((this.xmlHttpRequest.readyState == 4) && (this.xmlHttpRequest.status == 0)) {
      this.retryRequest();
    }
    if(this.responseFun) this.responseFun(null, this.userData);
    this._final();
  },

  _final : function(){
    if(this.recycleFun) this.recycleFun(this);
  }

};

function ServicePool(_maxCount){
  this.maxCount = 8;
  this.count = 0;
  if(_maxCount) this.maxCount = _maxCount;
  else if(MAX_SERVICE_COUNT) this.maxCount = MAX_SERVICE_COUNT;

  this.poolQueue = [];
  this.requestQueue = [];
}

ServicePool.prototype = {
  requestService : function(cb/*callback function **/,ud/*user data, can as cb last param */){
    var ret = 0;
    var _service = null;
    this.count = this.poolQueue.length;
    for(var i=0;i<this.count;++i)
    {
      if(this.poolQueue[i].state == -1)
      {
        _service = this.poolQueue[i];
        break;
      }
    }
    if(_service)
    {
      cb(_service,ud);
    }
    else if(this.count < this.maxCount)
    {
      _service = new HttpService();
      _service.RegisterRecycle(this.returnService.bind(this));
      cb(_service,ud);
      this.poolQueue.push(_service);
      _service.id = this.count;
      ++this.count;
    }
    else
    {
      this.requestQueue.push([cb,ud]);
      ret = 2;
    }
    // if(_service) log.info('ServicePool---requestService[id='+_service.id+']');
    return ret;
  },
  returnService : function(_service){
    // log.info('ServicePool---returnService[id='+_service.id+']');
    if(_service.id<0 || _service.id>=this.count)
    {
      //throw 'ServicePool error service id['+_service.id+']';
      return;
    }
    this.poolQueue[_service.id].state = -1;
    if(this.requestQueue.length > 0)
    {
      var _request = this.requestQueue.pop();
      _request[0](_service,_request[1]);
      // log.info('ServicePool---requestService[id='+_service.id+']');
    }
    return 0;
  },
}
