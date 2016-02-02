
module.exports = {
  get : function(request, response){
    var data = request.params;
    if(data == null) data = {};
    response.render('no_task', data);
  },

  post : function(request, response){
      console.log(request.files);
      response.end();
  },

};
