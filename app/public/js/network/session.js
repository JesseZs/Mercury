/**
 * 0 get  1 post urlencode 2 post 3 post multipart 4 post json-body
 * @param uri
 * @param type
 * @param params
 * @param data
 * @constructor
 */

function Server(uri, type, params, body, files)
{
  //this.url = 'http://127.0.0.1';
  //this.url = 'https://lighting_test.kingsoft.com';
  //this.url = 'https://lighting.kingsoft.com'
  //this.url = window.location.origin;
  this.url = window.location.href.replace(window.location.pathname,"");

  this.secret = "WNyZXQiLCJleHAiOjIwNDczO";

  this.uri = uri;
  this.type = type;
  this.params = params;
  this.heads = {};
  if(this.params == null){
    this.params = {};
  }

  this.params['client'] = 5;
  this.params['uuid'] = "web_test";
  this.params['clientVersion'] = 2.0;

  //get the token
  var token = window.token;
  if(token != null){
    this.params['token'] = token;
  }
  this.body = body;
  if(files)
  {
    this.files = files;
  }
  else {
    this.files = [];
  }

}
Server.prototype = {
  getUrl: function()
  {
    return this.url + this.uri;
  },

  getHeads: function(){
    return this.heads;
  },

  getParams: function()
  {
    if(!this.params) throw '"Server" request param error';

    this.params.time = (new Date()).valueOf();
    //this.params.time = 1425374055014;

    //log.info(paramSerial+secret);
    this.params.sign = hex_md5(this.GenParamSerial(this.params) + this.secret);
    //log.info(commonParam.sign);
    return this.params;
  },

  getBody: function()
  {
    return this.body;
  },

  getFiles: function()
  {
    return this.files;
  },

  GenParamSerial : function(param)
  {
    var retValue = '';
    var keyList = ['client','uuid','token','clientVersion','time'];
    /*keyList.sort(function(e1,e2){
      e1 > e2;
    });*/
    keyList.sort();
    for(var i=0; i<keyList.length; ++i)
    {
      var key = keyList[i];
      var value = param[key];
      if(value == null) continue;
      if(retValue == '')
      {
        retValue = key+'_'+value;
      }
      else
      {
        retValue += '|'+key+'_'+value;
      }
    }
    return retValue;
  }

};

function Session(){
  this.servicePool = new ServicePool();

  //change listener,[function list]
  this.listenerHandle = [];

}

Session.prototype = {

  serviceReady : function(_service,data){
    _service.Init(data["server"]);
    _service.SendRequest(this.requestCallBack.bind(this),data["ud"]);
  },

  registerListener : function(cb){
    listenerHandle.push(cb);
  },

  unregisterListener : function(cb){
    for(var i=0; i<listenerHandle.length; ++i)
    {
      if(listenerHandle[i] == cb)
      {
        listenerHandle.splice(i,1);
        break;
      }
    }
  },

  request : function(userData){
    //request a service
    this.servicePool.requestService(this.serviceReady.bind(this), userData);
  },

  requestCallBack : function(response,userData){
    //var result = JSON.parse(response);
    var result = null;
    if(response) result = JSON.parse(response);
    var resultData = null;
    if(result['code'] == 0){
      resultData = result['data'];
    }
    else{
      console.log("session http result ["+result['code']+"]---"+result['data']);
    }
    userData['callBack'](resultData,userData['ud']);
  },

  ///====================login========================

  login : function(account, password, callBackFun, ud)
  {
    var server = new Server("/login", 1, {'account':phone, 'password':verify_code});
    var userData = {'callBack':callBackFun, 'ud':ud};
    this.request({'server':server,'ud':userData});
  },

};

(function(t){
  if(!t){
    window.S = new Session();
  }else{
    window[t] = new Session();
  }
)('S');
